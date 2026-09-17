import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, X, ImagePlus, Link2, ImageOff } from "lucide-react";
import {
  listarAnunciosAdmin,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio,
  subirImagenAnuncio,
  agregarImagenAnuncioPorUrl,
  eliminarImagenAnuncio,
} from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { resolverUrlImagen } from "../../utils/imagenes";

const MAX_IMAGENES = 4;

const ESTADO_INICIAL = { titulo: "", contenido: "", publicado: true };

export default function AnunciosAdminPage() {
  const confirmAction = useConfirm();
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [agregandoUrl, setAgregandoUrl] = useState(false);
  const [urlImagen, setUrlImagen] = useState("");

  const cargar = () => {
    setCargando(true);
    listarAnunciosAdmin()
      .then(setAnuncios)
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const iniciarEdicion = (a) => {
    setEditandoId(a.id);
    setForm({ titulo: a.titulo, contenido: a.contenido, publicado: a.publicado });
    setImagenes(a.imagenes || []);
    setUrlImagen("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm(ESTADO_INICIAL);
    setImagenes([]);
    setUrlImagen("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      if (editandoId) {
        await actualizarAnuncio(editandoId, form);
        toast.success("Anuncio actualizado.");
        cargar();
      } else {
        const nuevo = await crearAnuncio(form);
        toast.success("Anuncio publicado. Ahora puedes agregarle imágenes.");
        iniciarEdicion(nuevo);
        cargar();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo guardar el anuncio."));
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (anuncio) => {
    const ok = await confirmAction({
      titulo: "¿Eliminar este anuncio?",
      mensaje: `Se eliminará "${anuncio.titulo}" y sus imágenes. Esto no se puede deshacer.`,
      confirmar: "Eliminar",
    });
    if (!ok) return;
    try {
      await eliminarAnuncio(anuncio.id);
      toast.success("Anuncio eliminado.");
      if (anuncio.id === editandoId) cancelarEdicion();
      cargar();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSubirArchivo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editandoId) return;
    setSubiendoImagen(true);
    try {
      const imagen = await subirImagenAnuncio(editandoId, file);
      setImagenes((prev) => [...prev, imagen]);
      cargar();
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo subir la imagen."));
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleAgregarUrl = async (e) => {
    e.preventDefault();
    if (!urlImagen.trim() || !editandoId) return;
    setAgregandoUrl(true);
    try {
      const imagen = await agregarImagenAnuncioPorUrl(editandoId, urlImagen.trim());
      setImagenes((prev) => [...prev, imagen]);
      setUrlImagen("");
      cargar();
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo agregar la imagen."));
    } finally {
      setAgregandoUrl(false);
    }
  };

  const handleEliminarImagen = async (imagenId) => {
    try {
      await eliminarImagenAnuncio(imagenId);
      setImagenes((prev) => prev.filter((img) => img.id !== imagenId));
      cargar();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const topeAlcanzado = imagenes.length >= MAX_IMAGENES;

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <div className="card h-fit space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">{editandoId ? "Editar anuncio" : "Nuevo anuncio"}</h2>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} className="btn-ghost !p-1.5">
                <X size={16} />
              </button>
            )}
          </div>
          <div>
            <label className="label">Título *</label>
            <input className="input" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>
          <div>
            <label className="label">Contenido *</label>
            <textarea
              className="input"
              rows={5}
              required
              value={form.contenido}
              onChange={(e) => setForm({ ...form, contenido: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={form.publicado}
              onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
              className="h-4 w-4 rounded border-ink/30"
            />
            Publicado (visible en el tablón público)
          </label>
          <button type="submit" disabled={enviando} className="btn-primary w-full">
            {enviando ? "Guardando…" : editandoId ? "Guardar cambios" : "Publicar"}
          </button>
        </form>

        <div className="border-t border-ink/10 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">
              Imágenes <span className="font-normal text-ink/40">({imagenes.length}/{MAX_IMAGENES})</span>
            </p>
          </div>

          {!editandoId ? (
            <p className="text-xs text-ink/40">Publica el anuncio primero para poder agregarle imágenes.</p>
          ) : (
            <div className="space-y-4">
              {imagenes.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {imagenes.map((img) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-ink/10">
                      <img src={resolverUrlImagen(img.url)} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleEliminarImagen(img.id)}
                        className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-paper opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {topeAlcanzado ? (
                <p className="flex items-center gap-1.5 text-xs text-ink/40">
                  <ImageOff size={14} />
                  Máximo de {MAX_IMAGENES} imágenes alcanzado.
                </p>
              ) : (
                <div className="space-y-2">
                  <label className="btn-secondary w-full cursor-pointer !py-2 text-xs">
                    <ImagePlus size={16} />
                    {subiendoImagen ? "Subiendo…" : "Subir archivo (JPG, PNG, WEBP)"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleSubirArchivo}
                      disabled={subiendoImagen}
                    />
                  </label>

                  <form onSubmit={handleAgregarUrl} className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                      <input
                        type="url"
                        className="input pl-8 text-xs"
                        placeholder="o pega una URL de imagen"
                        value={urlImagen}
                        onChange={(e) => setUrlImagen(e.target.value)}
                        disabled={agregandoUrl}
                      />
                    </div>
                    <button type="submit" disabled={agregandoUrl || !urlImagen.trim()} className="btn-secondary !px-3 text-xs">
                      {agregandoUrl ? "…" : "Agregar"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {cargando && <p className="text-sm text-paper/40">Cargando…</p>}
        {anuncios.map((a) => (
          <div key={a.id} className="card flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {a.imagenes?.[0] && (
                <img
                  src={resolverUrlImagen(a.imagenes[0].url)}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg border border-ink/10 object-cover"
                />
              )}
              <div>
                <p className="font-medium text-ink">
                  {a.titulo}
                  {!a.publicado && (
                    <span className="ml-2 rounded-full border border-ink/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink/50">
                      Borrador
                    </span>
                  )}
                  {a.imagenes?.length > 0 && (
                    <span className="ml-2 text-[10px] text-ink/30">
                      {a.imagenes.length} img{a.imagenes.length > 1 ? "s" : ""}
                    </span>
                  )}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-ink/50">{a.contenido}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => iniciarEdicion(a)} className="btn-ghost !p-2">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleEliminar(a)} className="btn-ghost !p-2 hover:bg-ink hover:text-paper">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {!cargando && anuncios.length === 0 && <p className="text-sm text-paper/40">Aún no hay anuncios.</p>}
      </div>
    </div>
  );
}
