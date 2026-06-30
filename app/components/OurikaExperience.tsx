"use client";

import "leaflet/dist/leaflet.css";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import L from "leaflet";
import {
  ArrowRight,
  AudioLines,
  Building2,
  Compass,
  Eye,
  Factory,
  Landmark,
  LocateFixed,
  MapPin,
  Maximize2,
  Minus,
  Navigation,
  Plus,
  Search,
  Shield
} from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
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

type ZoneType = "capital" | "ncr" | "commercial" | "heritage";

type Zone = {
  id: string;
  name: string;
  type: ZoneType;
  lat: number;
  lng: number;
  position: string;
  market: string;
  status: string;
  pace: string;
  focus: string;
  copy: string;
  hue: string;
  icon: ZoneType;
};

const zones: Zone[] = [
  {
    id: "lucknow",
    name: "Lucknow",
    type: "capital",
    lat: 26.8467,
    lng: 80.9462,
    position: "26.8467 N, 80.9462 E",
    market: "Capital region",
    status: "Core UP hub",
    pace: "Capital core",
    focus: "Administrative and residential demand",
    copy: "Uttar Pradesh's capital anchors the map with established residential corridors, airport-led connectivity, and strong civic infrastructure.",
    hue: "#f5d05f",
    icon: "capital"
  },
  {
    id: "gaziabad",
    name: "Gaziabad",
    type: "ncr",
    lat: 28.6692,
    lng: 77.4538,
    position: "28.6692 N, 77.4538 E",
    market: "Delhi NCR edge",
    status: "Gateway location",
    pace: "NCR corridor",
    focus: "Expressway and commuter connectivity",
    copy: "A western UP gateway connected to Delhi NCR, with strong movement along expressway, metro, and logistics corridors.",
    hue: "#77c8ff",
    icon: "ncr"
  },
  {
    id: "kanpur",
    name: "Kanpur",
    type: "commercial",
    lat: 26.4499,
    lng: 80.3319,
    position: "26.4499 N, 80.3319 E",
    market: "Industrial belt",
    status: "Commercial strength",
    pace: "Business node",
    focus: "Manufacturing and trade catchment",
    copy: "A deep commercial base with industrial demand, education anchors, and central UP access for long-term land positioning.",
    hue: "#ff9f6e",
    icon: "commercial"
  },
  {
    id: "ayodhya",
    name: "Ayodhya",
    type: "heritage",
    lat: 26.7922,
    lng: 82.1998,
    position: "26.7922 N, 82.1998 E",
    market: "Heritage growth",
    status: "Tourism surge",
    pace: "Pilgrim circuit",
    focus: "Hospitality and destination demand",
    copy: "A major heritage destination with expanding tourism infrastructure, hospitality demand, and renewed regional visibility.",
    hue: "#aee86f",
    icon: "heritage"
  }
];

const categoryMeta: Record<ZoneType, { label: string; icon: typeof MapPin; stat: string }> = {
  capital: { label: "Capital", icon: Landmark, stat: "Lucknow" },
  ncr: { label: "NCR", icon: Building2, stat: "Gaziabad" },
  commercial: { label: "Commercial", icon: Factory, stat: "Kanpur" },
  heritage: { label: "Heritage", icon: Navigation, stat: "Ayodhya" }
};

const routeLine = zones.map((zone) => [zone.lat, zone.lng] as [number, number]);

const center: [number, number] = [28.05, 80.05];

type SkyStyle = CSSProperties & Record<`--${string}`, string | number>;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const cloudLayout = [
  { top: -10, left: -20, width: 620 },
  { top: 5, left: 52, width: 560 },
  { top: 22, left: -16, width: 430 },
  { top: 30, left: 58, width: 680 },
  { top: 60, left: 10, width: 520 }
];

function iconFor(zone: Zone) {
  return L.divIcon({
    className: "estate-pin-wrapper",
    html: `
      <span class="estate-pin estate-pin-${zone.type}" style="--pin-color: ${zone.hue}" role="img" aria-label="${zone.name}">
        <span class="pin-label">${zone.name}</span>
        <span class="pin-pulse"></span>
        <span class="pin-core"></span>
      </span>
    `,
    iconSize: [118, 76],
    iconAnchor: [59, 72]
  });
}

function RecenterMap({ selected, shouldFocus }: { selected: Zone; shouldFocus: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!shouldFocus) return;

    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 10.25), {
      animate: true,
      duration: 1.25
    });
  }, [map, selected, shouldFocus]);

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
        aria-label="Center selected destination"
        onClick={() => map.flyTo([activeZone.lat, activeZone.lng], 10.7, { animate: true, duration: 1.2 })}
      >
        <LocateFixed size={18} />
      </button>
      <button aria-label="Show full Uttar Pradesh map" onClick={() => map.flyTo(center, 7, { animate: true, duration: 1.2 })}>
        <Maximize2 size={18} />
      </button>
    </motion.div>
  );
}

function ZoneIcon({ zone }: { zone: Zone }) {
  if (zone.icon === "capital") return <Landmark size={16} />;
  if (zone.icon === "ncr") return <Building2 size={16} />;
  if (zone.icon === "commercial") return <Factory size={16} />;
  return <Navigation size={16} />;
}

function AnimatedTitle() {
  const lines = ["UTTAR PRADESH", "DESTINATION MAP"];
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
    <div className="brand-mark" aria-label="Ourika Estates">
      <img src="/ourika-estates-logo.png" alt="Ourika Estates" />
    </div>
  );
}

export default function OurikaExperience() {
  const [entered, setEntered] = useState(false);
  const [activeType, setActiveType] = useState<ZoneType | "all">("all");
  const [selectedId, setSelectedId] = useState(zones[0].id);
  const [engaged, setEngaged] = useState(false);
  const [shouldFocusSelected, setShouldFocusSelected] = useState(false);
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
  const cloudBanks = useMemo(
    () =>
      cloudLayout.map((cloud, index) => ({
        id: `cloud-${index}`,
        top: cloud.top + randomBetween(-6, 6),
        left: cloud.left + randomBetween(-8, 8),
        width: cloud.width + randomBetween(-90, 80),
        duration: randomBetween(64, 124),
        delay: randomBetween(-80, 0),
        opacity: randomBetween(0.24, 0.58),
        blur: randomBetween(0, 0.8),
        scaleX: Math.random() > 0.48 ? 1 : -1,
        scaleY: randomBetween(0.9, 1.08),
        midX: randomBetween(-10, 18),
        midY: randomBetween(-18, 16),
        driftX: randomBetween(10, 34),
        driftY: randomBetween(-20, 24)
      })),
    []
  );
  const birdFlock = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => {
        const leftToRight = Math.random() > 0.36;
        const startX = leftToRight ? randomBetween(-28, -8) : randomBetween(108, 128);
        const endX = leftToRight ? randomBetween(108, 132) : randomBetween(-32, -10);

        return {
          id: `bird-${index}`,
          top: randomBetween(7, 86),
          startX,
          midX: randomBetween(18, 82),
          endX,
          driftY: randomBetween(-92, 92),
          duration: randomBetween(16, 46),
          delay: randomBetween(-42, 0),
          opacity: randomBetween(0.28, 0.78),
          scale: randomBetween(0.48, 1.22),
          tilt: randomBetween(-9, 9),
          midTilt: randomBetween(-7, 7),
          endY: randomBetween(-36, 36),
          flap: randomBetween(0.8, 1.65)
        };
      }),
    []
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
    setShouldFocusSelected(true);
  };

  const enterMap = () => {
    setEntered(true);
    setShouldFocusSelected(false);
  };

  return (
    <main className="experience" ref={containerRef} onPointerMove={handlePointerMove}>
      <MapContainer
        className="estate-map"
        center={center}
        zoom={7}
        minZoom={6}
        maxZoom={12}
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
        <RecenterMap selected={selected} shouldFocus={shouldFocusSelected} />
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

      <div className="sky-layer" aria-hidden="true">
        {cloudBanks.map((cloud) => (
          <span
            className="cloud"
            key={cloud.id}
            style={
              {
                "--top": `${cloud.top}%`,
                "--left": `${cloud.left}%`,
                "--cloud-width": `${cloud.width}px`,
                "--duration": `${cloud.duration}s`,
                "--delay": `${cloud.delay}s`,
                "--opacity": cloud.opacity,
                "--blur": `${cloud.blur}px`,
                "--scale-x": cloud.scaleX,
                "--scale-y": cloud.scaleY,
                "--mid-x": `${cloud.midX}vw`,
                "--mid-y": `${cloud.midY}px`,
                "--drift-x": `${cloud.driftX}vw`,
                "--drift-y": `${cloud.driftY}px`
              } as SkyStyle
            }
          >
            <img src="/realistic-clouds.png" alt="" />
          </span>
        ))}
        {birdFlock.map((bird) => (
          <span
            className="bird"
            key={bird.id}
            style={
              {
                "--top": `${bird.top}%`,
                "--start-x": `${bird.startX}vw`,
                "--mid-x": `${bird.midX}vw`,
                "--end-x": `${bird.endX}vw`,
                "--drift-y": `${bird.driftY}px`,
                "--duration": `${bird.duration}s`,
                "--delay": `${bird.delay}s`,
                "--opacity": bird.opacity,
                "--scale": bird.scale,
                "--tilt": `${bird.tilt}deg`,
                "--mid-tilt": `${bird.midTilt}deg`,
                "--end-y": `${bird.endY}px`,
                "--flap-duration": `${bird.flap}s`
              } as SkyStyle
            }
          />
        ))}
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
              <MapPin size={18} />
              <Navigation size={16} />
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
              A cinematic Uttar Pradesh land map highlighting Lucknow, Gaziabad, Kanpur, and Ayodhya.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.36, duration: 0.72 }}
            >
              <button className="primary-cta" onClick={enterMap}>
                Explore the map
              </button>
              <button className="text-cta" onClick={enterMap}>
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
                UP destination dashboard
              </div>
              <h2>Ourika UP Map</h2>
              <p className="panel-copy">
                Drag the terrain, zoom into Uttar Pradesh, and select a highlighted city pin to inspect the destination.
              </p>

              <div className="search-shell">
                <Search size={16} />
                <span>Search Lucknow, Gaziabad, Kanpur, or Ayodhya</span>
              </div>

              <div className="category-grid">
                <button
                  className={activeType === "all" ? "category-card active" : "category-card"}
                  onClick={() => setActiveType("all")}
                >
                  <Eye size={17} />
                  <span>All</span>
                  <strong>4 pins</strong>
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
                  <span>Destinations</span>
                  <strong>4 cities</strong>
                </div>
                <div>
                  <span>State focus</span>
                  <strong>UP</strong>
                </div>
                <div>
                  <span>Corridor</span>
                  <strong>NCR to Awadh</strong>
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
                  <span>Position</span>
                  <strong>{selected.position}</strong>
                </div>
                <div>
                  <span>Market</span>
                  <strong>{selected.market}</strong>
                </div>
                <div>
                  <span>Signal</span>
                  <strong>{selected.status}</strong>
                </div>
                <div>
                  <span>Focus</span>
                  <strong>{selected.focus}</strong>
                </div>
              </div>
              <button className="reserve-button">
                View location notes
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

      {!entered && (
        <div className="status-ribbon">
          <Shield size={14} />
          Live Uttar Pradesh planning view
        </div>
      )}
    </main>
  );
}
