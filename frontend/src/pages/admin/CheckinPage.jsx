import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, Keyboard, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { obtenerActividadActiva, checkinPorQr, checkinManual } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import QRScanner from "../../components/admin/QRScanner.jsx";
import UserSearch from "../../components/admin/UserSearch.jsx";

export default function CheckinPage() {
  const [actividad, setActividad] = useState(null);
  const [cargandoActividad, setCargandoActividad] = useState(true);
  // null = pantalla de elección (cámara APAGADA). Solo pasa a "qr" con un clic explícito,
  // y vuelve a null al registrar con éxito o si el admin cancela — nunca queda encendida sola.
  const [modo, setModo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);

  const cargarActividad = useCallback(() => {
    setCargandoActividad(true);
    obtenerActividadActiva()
      .then(setActividad)
      .finally(() => setCargandoActividad(false));
  }, []);

  useEffect(cargarActividad, [cargarActividad]);

  const manejarResultado = (promesa, { apagarCamaraAlTerminar } = {}) => {
    setProcesando(true);
    promesa
      .then(({ usuario }) => {
        toast.success(`✅ Asistencia registrada para ${usuario.nombre_completo}`);
        setUltimoRegistro(usuario);
        if (apagarCamaraAlTerminar) setModo(null);
      })
      .catch((err) => toast.error(getErrorMessage(err, "No se pudo registrar la asistencia.")))
      .finally(() => setProcesando(false));
  };

  // Un registro exitoso apaga la cámara; un error la deja abierta para reintentar el mismo QR.
  const handleScan = useCallback((codigo) => {
    manejarResultado(checkinPorQr(codigo), { apagarCamaraAlTerminar: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSeleccionManual = (usuario) => {
    manejarResultado(checkinManual(usuario.id));
  };

  if (cargandoActividad) {
    return <p className="text-sm text-paper/40">Cargando actividad activa…</p>;
  }

  if (!actividad) {
    return (
      <div className="card animate-materialize flex max-w-md flex-col items-center gap-3 text-center">
        <AlertTriangle size={28} className="text-ink/40" />
        <p className="text-sm text-ink/70">No hay ninguna actividad activa. Crea una para empezar a recibir asistencias.</p>
        <Link to="/admin/actividades" className="btn-primary">
          Ir a Actividades
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-paper/40">Actividad activa</p>
        <h1 className="text-title text-paper">{actividad.nombre}</h1>
      </div>

      {modo === null && (
        <div className="grid animate-materialize grid-cols-2 gap-3">
          <button
            onClick={() => setModo("qr")}
            className="card flex flex-col items-center gap-3 py-8 text-center transition-transform active:scale-[0.97]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper">
              <Camera size={20} />
            </span>
            <span className="text-sm font-medium text-ink">Escanear código QR</span>
            <span className="text-xs text-ink/40">Enciende la cámara</span>
          </button>
          <button
            onClick={() => setModo("manual")}
            className="card flex flex-col items-center gap-3 py-8 text-center transition-transform active:scale-[0.97]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-100 text-ink">
              <Keyboard size={20} />
            </span>
            <span className="text-sm font-medium text-ink">Buscar por nombre/ID</span>
            <span className="text-xs text-ink/40">Sin cámara</span>
          </button>
        </div>
      )}

      {modo === "qr" && (
        <div className="animate-materialize space-y-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-paper">
              <span className="h-2 w-2 animate-pulse rounded-full bg-paper" />
              Cámara activa — apunta al código QR
            </p>
            <button
              onClick={() => setModo(null)}
              className="btn-ghost !px-3 !py-1.5 text-xs text-paper hover:bg-white/10 hover:text-paper"
            >
              <X size={14} />
              Cancelar
            </button>
          </div>
          <QRScanner activo onScan={handleScan} />
        </div>
      )}

      {modo === "manual" && (
        <div className="animate-materialize space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-paper">Buscar asistente</p>
            <button
              onClick={() => setModo(null)}
              className="btn-ghost !px-3 !py-1.5 text-xs text-paper hover:bg-white/10 hover:text-paper"
            >
              <X size={14} />
              Cerrar
            </button>
          </div>
          <div className="flex justify-center">
            <UserSearch onSeleccionar={handleSeleccionManual} disabled={procesando} />
          </div>
        </div>
      )}

      {ultimoRegistro && (
        <div className="animate-materialize mt-6 flex items-center gap-3 rounded-xl border border-ink/10 bg-paper-100 p-4 text-sm text-ink">
          <CheckCircle2 size={20} className="shrink-0 text-ink" />
          <span>
            Último registro: <strong>{ultimoRegistro.nombre_completo}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
