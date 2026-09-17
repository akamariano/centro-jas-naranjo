const BURBUJAS = [
  { top: "-10%", left: "-8%", size: 480, opacity: 0.09, x: 40, y: 30, duration: 26 },
  { top: "8%", left: "68%", size: 380, opacity: 0.07, x: -30, y: 40, duration: 30 },
  { top: "58%", left: "-6%", size: 420, opacity: 0.08, x: 35, y: -25, duration: 24 },
  { top: "70%", left: "72%", size: 340, opacity: 0.06, x: -25, y: -30, duration: 28 },
  { top: "32%", left: "38%", size: 300, opacity: 0.05, x: 20, y: 20, duration: 34 },
];

const DESTELLOS = [
  { top: "12%", left: "18%", size: 3, duration: 4.2, delay: 0 },
  { top: "22%", left: "82%", size: 2, duration: 3.6, delay: 0.4 },
  { top: "35%", left: "8%", size: 2, duration: 5, delay: 1.1 },
  { top: "18%", left: "55%", size: 3, duration: 4.6, delay: 0.8 },
  { top: "48%", left: "92%", size: 2, duration: 3.9, delay: 0.2 },
  { top: "62%", left: "30%", size: 3, duration: 4.4, delay: 1.6 },
  { top: "72%", left: "60%", size: 2, duration: 5.2, delay: 0.6 },
  { top: "84%", left: "15%", size: 2, duration: 3.8, delay: 1.3 },
  { top: "90%", left: "80%", size: 3, duration: 4.8, delay: 0.3 },
  { top: "6%", left: "38%", size: 2, duration: 4.1, delay: 1.8 },
  { top: "54%", left: "68%", size: 2, duration: 3.5, delay: 0.9 },
  { top: "78%", left: "42%", size: 3, duration: 5.4, delay: 0.1 },
];

/**
 * Capa decorativa fija detrás de toda la app: negro con degradado, burbujas
 * (glow suave, deriva lenta) y destellos (puntos que titilan). Puramente
 * visual — pointer-events-none, aria-hidden, un solo montaje en <App>.
 * El movimiento respeta prefers-reduced-motion (ver index.css: se neutraliza
 * globalmente ahí, no hace falta duplicar la condición aquí).
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% -10%, #161616 0%, #050505 45%, #000000 100%)",
      }}
    >
      {BURBUJAS.map((b, i) => (
        <div
          key={i}
          className="animate-drift absolute rounded-full blur-3xl"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            backgroundColor: `rgba(255,255,255,${b.opacity})`,
            "--drift-x": `${b.x}px`,
            "--drift-y": `${b.y}px`,
            "--drift-duration": `${b.duration}s`,
          }}
        />
      ))}

      {DESTELLOS.map((d, i) => (
        <div
          key={i}
          className="animate-twinkle absolute rounded-full bg-white"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            boxShadow: "0 0 6px 1px rgba(255,255,255,0.7)",
            animationDelay: `${d.delay}s`,
            "--twinkle-duration": `${d.duration}s`,
            "--twinkle-min": 0.15,
            "--twinkle-max": 0.85,
          }}
        />
      ))}
    </div>
  );
}
