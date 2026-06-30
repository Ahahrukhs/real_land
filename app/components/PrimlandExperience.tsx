"use client";

import "leaflet/dist/leaflet.css";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import L from "leaflet";
import {
  ArrowRight,
  AudioLines,
  BedDouble,
  Compass,
  Dumbbell,
  Eye,
  Flag,
  Gem,
  Home,
  Leaf,
  LocateFixed,
  MapPin,
  Maximize2,
  Minus,
  Mountain,
  Plus,
  Route,
  Search,
  Shield,
  Sparkles,
  Trees,
  Waves
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents
} from "react-leaflet";

type ZoneType = "residences" | "golf" | "wellness" | "trails";

type Zone = {
  id: string;
  name: string;
  type: ZoneType;
  lat: number;
  lng: number;
  elevation: string;
  acres: string;
  status: string;
  pace: string;
  homes: string;
  copy: string;
  hue: string;
  icon: "home" | "golf" | "wellness" | "trail";
};

const zones: Zone[] = [
  {
    id: "ridge-villas",
    name: "Blue Ridge Villas",
    type: "residences",
    lat: 36.6391,
    lng: -80.4543,
    elevation: "2,870 ft",
    acres: "43",
    status: "Priority release",
    pace: "Quiet ridge",
    homes: "18 residences",
    copy: "Private overlooks, arrival courts, and sunset-facing terraces along the upper ridge.",
    hue: "#e9d8a6",
    icon: "home"
  },
  {
    id: "fairway-lodges",
    name: "Fairway Lodges",
    type: "residences",
    lat: 36.6344,
    lng: -80.4454,
    elevation: "2,630 ft",
    acres: "29",
    status: "Touring now",
    pace: "Golf-front",
    homes: "24 lodges",
    copy: "Low-slung lodge homes placed between the woodland edge and rolling fairways.",
    hue: "#ccd878",
    icon: "home"
  },
  {
    id: "highlands-course",
    name: "Highlands Course",
    type: "golf",
    lat: 36.6359,
    lng: -80.4626,
    elevation: "2,540 ft",
    acres: "147",
    status: "Open",
    pace: "Championship loop",
    homes: "18 holes",
    copy: "A mountain golf sequence with creek crossings, elevated greens, and long meadow views.",
    hue: "#a8c957",
    icon: "golf"
  },
  {
    id: "wellness-spring",
    name: "Spring House Spa",
    type: "wellness",
    lat: 36.6426,
    lng: -80.4417,
    elevation: "2,490 ft",
    acres: "11",
    status: "Reserved access",
    pace: "Slow rituals",
    homes: "Pools and spa",
    copy: "Warm mineral pools, recovery rooms, and forest bathing paths gathered near the spring.",
    hue: "#8bd3dd",
    icon: "wellness"
  },
  {
    id: "river-trail",
    name: "Dan River Trail",
    type: "trails",
    lat: 36.6469,
    lng: -80.4568,
    elevation: "2,300 ft",
    acres: "7.8 mi",
    status: "Guided routes",
    pace: "Creekside",
    homes: "5 trailheads",
    copy: "A shaded trail system connecting water, overlooks, and picnic clearings.",
    hue: "#7bbf90",
    icon: "trail"
  },
  {
    id: "summit-lookout",
    name: "Summit Lookout",
    type: "trails",
    lat: 36.6507,
    lng: -80.4382,
    elevation: "3,020 ft",
    acres: "360 view",
    status: "Sunrise access",
    pace: "High point",
    homes: "Lookout deck",
    copy: "The highest public point in the plan, made for sunrise hikes and evening gatherings.",
    hue: "#f4a261",
    icon: "trail"
  }
];

const categoryMeta: Record<ZoneType, { label: string; icon: typeof Home; stat: string }> = {
  residences: { label: "Residences", icon: Home, stat: "42 homes" },
  golf: { label: "Golf", icon: Flag, stat: "18 holes" },
  wellness: { label: "Wellness", icon: Waves, stat: "4 rituals" },
  trails: { label: "Trails", icon: Route, stat: "12 mi" }
};

const routeLine = zones.map((zone) => [zone.lat, zone.lng] as [number, number]);

const center: [number, number] = [36.6408, -80.4501];

function iconFor(zone: Zone) {
  return L.divIcon({
    className: "estate-pin-wrapper",
    html: `
      <button class="estate-pin estate-pin-${zone.type}" style="--pin-color: ${zone.hue}" aria-label="${zone.name}">
        <span class="pin-pulse"></span>
        <span class="pin-core"></span>
      </button>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
}

function RecenterMap({ selected }: { selected: Zone }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 15.8), {
      animate: true,
      duration: 1.25
    });
  }, [map, selected]);

  return null;
}

function MapActivity({ onEngage }: { onEngage: () => void }) {
  useMapEvents({
    dragstart: onEngage,
    zoomstart: onEngage
  });

  return null;
}

function MapControls({
  activeZone,
  entered
}: {
  activeZone: Zone;
  entered: boolean;
}) {
  const map = useMap();

  return (
    <motion.div
      className="map-controls"
      initial={false}
      animate={{ opacity: entered ? 1 : 0, x: entered ? 0 : 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <button aria-label="Zoom in" onClick={() => map.zoomIn()}>
        <Plus size={18} />
      </button>
      <button aria-label="Zoom out" onClick={() => map.zoomOut()}>
        <Minus size={18} />
      </button>
      <button
        aria-label="Center selected zone"
        onClick={() => map.flyTo([activeZone.lat, activeZone.lng], 16, { animate: true, duration: 1.2 })}
      >
        <LocateFixed size={18} />
      </button>
      <button aria-label="Show full estate" onClick={() => map.flyTo(center, 14.2, { animate: true, duration: 1.2 })}>
        <Maximize2 size={18} />
      </button>
    </motion.div>
  );
}

function ZoneIcon({ zone }: { zone: Zone }) {
  if (zone.icon === "home") return <Home size={16} />;
  if (zone.icon === "golf") return <Flag size={16} />;
  if (zone.icon === "wellness") return <Waves size={16} />;
  return <Trees size={16} />;
}

function AnimatedTitle() {
  const lines = ["THE BLUE RIDGE", "MOUNTAINS"];
  const title = lines.join(" ");

  return (
    <h1 className="hero-title" aria-label={title}>
      {lines.map((line, lineIndex) => (
        <span className="hero-line" key={line}>
          {line.split("").map((letter, index) => {
            const letterIndex = lineIndex === 0 ? index : lines[0].length + index;

            return (
              <motion.span
                aria-hidden="true"
                key={`${line}-${letter}-${index}`}
                initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.55 + letterIndex * 0.025, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {letter === " " ? "\u00a0" : letter}
              </motion.span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="Primland Residences">
      <span className="brand-glyph">
        <Leaf size={17} />
        <Sparkles size={13} />
      </span>
      <span className="brand-name">Primland</span>
      <span className="brand-sub">Residences</span>
    </div>
  );
}

export default function PrimlandExperience() {
  const [entered, setEntered] = useState(false);
  const [activeType, setActiveType] = useState<ZoneType | "all">("all");
  const [selectedId, setSelectedId] = useState(zones[0].id);
  const [engaged, setEngaged] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 24 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 24 });
  const heroShiftX = useTransform(springX, [0, 1], [-18, 18]);
  const heroShiftY = useTransform(springY, [0, 1], [-12, 12]);

  const filteredZones = useMemo(
    () => (activeType === "all" ? zones : zones.filter((zone) => zone.type === activeType)),
    [activeType]
  );
  const selected = zones.find((zone) => zone.id === selectedId) ?? zones[0];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".fog-bank", {
        x: "random(-90, 120)",
        y: "random(-28, 28)",
        opacity: "random(0.23, 0.55)",
        duration: "random(10, 18)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.45
      });

      gsap.to(".scan-line", {
        xPercent: 118,
        duration: 5.5,
        repeat: -1,
        ease: "power1.inOut"
      });

      gsap.to(".route-glow", {
        strokeDashoffset: -220,
        duration: 6,
        repeat: -1,
        ease: "none"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width);
    mouseY.set((event.clientY - rect.top) / rect.height);
  };

  const chooseZone = (zone: Zone) => {
    setSelectedId(zone.id);
    setEntered(true);
    setEngaged(true);
  };

  return (
    <main className="experience" ref={containerRef} onPointerMove={handlePointerMove}>
      <MapContainer
        className="estate-map"
        center={center}
        zoom={14.35}
        minZoom={13}
        maxZoom={17}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom
        preferCanvas
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          className="satellite-tiles"
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          opacity={0.34}
          subdomains={["a", "b", "c", "d"]}
        />
        <Polyline
          positions={routeLine}
          pathOptions={{ color: "#f4ead2", weight: 2.5, opacity: entered ? 0.8 : 0.25, dashArray: "12 16" }}
          className="route-glow"
        />
        {zones.map((zone) => (
          <CircleMarker
            key={`${zone.id}-halo`}
            center={[zone.lat, zone.lng]}
            radius={zone.id === selected.id ? 28 : 14}
            pathOptions={{
              color: zone.hue,
              fillColor: zone.hue,
              fillOpacity: zone.id === selected.id ? 0.16 : 0.06,
              opacity: zone.id === selected.id ? 0.78 : 0.25,
              weight: 1
            }}
          />
        ))}
        {filteredZones.map((zone) => (
          <Marker
            key={zone.id}
            position={[zone.lat, zone.lng]}
            icon={iconFor(zone)}
            eventHandlers={{ click: () => chooseZone(zone) }}
          >
            <Tooltip direction="top" offset={[0, -18]} opacity={0.92}>
              {zone.name}
            </Tooltip>
          </Marker>
        ))}
        <RecenterMap selected={selected} />
        <MapActivity onEngage={() => setEngaged(true)} />
        <MapControls activeZone={selected} entered={entered} />
      </MapContainer>

      <div className="topographic-overlay" />
      <div className="color-grade" />
      <div className="shade-overlay" />
      <div className="scan-line" />

      <div className="fog-layer" aria-hidden="true">
        <span className="fog-bank fog-bank-a" />
        <span className="fog-bank fog-bank-b" />
        <span className="fog-bank fog-bank-c" />
        <span className="fog-bank fog-bank-d" />
        <span className="fog-bank fog-bank-e" />
      </div>

      <header className="site-header">
        <button className="sound-wave" aria-label="Toggle ambient audio">
          <AudioLines size={20} />
        </button>
        <BrandMark />
        <button className="inquire-button">
          Inquire
          <ArrowRight size={15} />
        </button>
      </header>

      <AnimatePresence>
        {!entered && (
          <motion.section
            className="hero"
            style={{ x: heroShiftX, y: heroShiftY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <motion.div
              className="master-icon"
              initial={{ opacity: 0, y: -10, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.28, duration: 0.7, ease: "easeOut" }}
            >
              <Mountain size={18} />
              <Gem size={16} />
            </motion.div>
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              In the heart of
            </motion.p>
            <AnimatedTitle />
            <motion.p
              className="hero-copy"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.18, duration: 0.72 }}
            >
              A cinematic estate command center for residences, trails, golf, wellness, and private arrivals.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.36, duration: 0.72 }}
            >
              <button className="primary-cta" onClick={() => setEntered(true)}>
                Explore the map
              </button>
              <button className="text-cta" onClick={() => setEntered(true)}>
                Start without audio
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {entered && (
          <>
            <motion.aside
              className="dashboard-panel left-panel"
              initial={{ opacity: 0, x: -38 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="panel-kicker">
                <Compass size={16} />
                Estate dashboard
              </div>
              <h2>Blue Ridge Explorer</h2>
              <p className="panel-copy">
                Drag the terrain, zoom into the ridgelines, and select a highlighted zone to inspect the plan.
              </p>

              <div className="search-shell">
                <Search size={16} />
                <span>Search by zone, amenity, or release</span>
              </div>

              <div className="category-grid">
                <button
                  className={activeType === "all" ? "category-card active" : "category-card"}
                  onClick={() => setActiveType("all")}
                >
                  <Eye size={17} />
                  <span>All</span>
                  <strong>6 zones</strong>
                </button>
                {(Object.keys(categoryMeta) as ZoneType[]).map((type) => {
                  const Icon = categoryMeta[type].icon;

                  return (
                    <button
                      key={type}
                      className={activeType === type ? "category-card active" : "category-card"}
                      onClick={() => setActiveType(type)}
                    >
                      <Icon size={17} />
                      <span>{categoryMeta[type].label}</span>
                      <strong>{categoryMeta[type].stat}</strong>
                    </button>
                  );
                })}
              </div>

              <div className="metric-row">
                <div>
                  <span>Estate scale</span>
                  <strong>12,000 ac</strong>
                </div>
                <div>
                  <span>Peak elevation</span>
                  <strong>3,020 ft</strong>
                </div>
                <div>
                  <span>Active releases</span>
                  <strong>3</strong>
                </div>
              </div>
            </motion.aside>

            <motion.aside
              className="dashboard-panel right-panel"
              key={selected.id}
              initial={{ opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.48, ease: "easeOut" }}
            >
              <div className="zone-heading">
                <span className="zone-icon" style={{ color: selected.hue }}>
                  <ZoneIcon zone={selected} />
                </span>
                <div>
                  <span>{categoryMeta[selected.type].label}</span>
                  <h3>{selected.name}</h3>
                </div>
              </div>
              <p>{selected.copy}</p>
              <div className="detail-list">
                <div>
                  <span>Elevation</span>
                  <strong>{selected.elevation}</strong>
                </div>
                <div>
                  <span>Scale</span>
                  <strong>{selected.acres}</strong>
                </div>
                <div>
                  <span>Access</span>
                  <strong>{selected.status}</strong>
                </div>
                <div>
                  <span>Program</span>
                  <strong>{selected.homes}</strong>
                </div>
              </div>
              <button className="reserve-button">
                View release notes
                <ArrowRight size={15} />
              </button>
            </motion.aside>

            <motion.div
              className="bottom-dock"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            >
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  className={zone.id === selected.id ? "dock-item active" : "dock-item"}
                  onClick={() => chooseZone(zone)}
                >
                  <span className="dock-dot" style={{ background: zone.hue }} />
                  <span>{zone.name}</span>
                  <small>{zone.pace}</small>
                </button>
              ))}
            </motion.div>

            <motion.div
              className="map-hint"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: engaged ? 0 : 1, scale: engaged ? 0.96 : 1 }}
              transition={{ duration: 0.45 }}
            >
              <span>Drag</span>
              <span>Scroll to zoom</span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="status-ribbon">
        <Shield size={14} />
        Live terrain planning view
      </div>
    </main>
  );
}
