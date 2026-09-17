/**
 * Colorway de marca: únicamente blanco y negro (sin verde/naranja).
 *
 * El archivo fuente (Logos/CJN_Logo.png) trae el símbolo y el texto
 * "CENTRO JAS NARANJO" horneados en una sola imagen, con el texto ocupando
 * solo ~8% de la altura total — a cualquier tamaño de UI (navbar, sidebar,
 * carnet) el texto queda ilegible/aplastado. Por eso el símbolo se recortó
 * aparte (CJN_Icono_*.png) y el texto se renderiza como texto real,
 * nítido a cualquier tamaño.
 *
 * variant: "negro" (fondos claros) | "blanco" (fondos oscuros, ej. sidebar admin)
 * stacked: símbolo arriba, texto centrado debajo (hero, login, carnet)
 * iconOnly: solo el símbolo, sin texto (espacios muy angostos)
 */
export default function Logo({
  variant = "negro",
  stacked = false,
  iconOnly = false,
  iconClassName = "h-9 w-auto",
  textClassName = "",
  className = "",
}) {
  // Ruta absoluta hardcodeada (no una importación de módulo), así que Vite no la
  // reescribe sola con el base path — hay que anteponer BASE_URL a mano para que
  // funcione también en GitHub Pages (donde la app vive en /<repo>/, no en "/").
  const nombreArchivo = variant === "blanco" ? "CJN_Icono_Blanco.png" : "CJN_Icono_Negro.png";
  const iconSrc = `${import.meta.env.BASE_URL}logos/${nombreArchivo}`;
  const textColor = variant === "blanco" ? "text-paper" : "text-ink";
  const wrapperBase = stacked ? "flex flex-col items-center gap-2" : "inline-flex items-center gap-2.5";
  const defaultTextSize = stacked ? "text-xl" : "text-base";

  return (
    <span className={`${wrapperBase} ${className}`}>
      <img src={iconSrc} alt="Centro JAS Naranjo" className={iconClassName} />
      {!iconOnly && (
        <span
          className={`font-semibold leading-none tracking-tight ${textColor} ${
            stacked ? "text-center" : ""
          } ${textClassName || defaultTextSize}`}
        >
          Centro JAS Naranjo
        </span>
      )}
    </span>
  );
}
