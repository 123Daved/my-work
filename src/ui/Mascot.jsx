import loraFluffy from "../assets/lora-fluffy.png";
import loraFluffyBlink from "../assets/lora-fluffy-blink.png";

export function Mascot({ mood = "idle", size = 140 }) {
  return (
    <div
      className={`mascot-wrap mascot-${mood}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="毛绒小精灵 Lovera"
    >
      <span className="mascot-motion" aria-hidden="true">
        <img className="mascot-image mascot-open-image" src={loraFluffy} alt="" draggable="false" />
        <img className="mascot-image mascot-blink-image" src={loraFluffyBlink} alt="" draggable="false" />
      </span>
    </div>
  );
}

export function StarEmblem({ size = 86 }) {
  return (
    <div className="star-emblem" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <circle cx="40" cy="40" r="36" fill="rgba(255,255,255,0.55)" />
        <circle cx="40" cy="40" r="28" fill="rgba(255,247,240,0.95)" />
        <path
          d="M40 16 L45 32 H62 L48 42 L53 58 L40 48 L27 58 L32 42 L18 32 H35 Z"
          fill="#f0c27a"
          stroke="#e8894a"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}

export function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 12l8-6M8 12l8 6" />
    </svg>
  );
}
