/**
 * Lee un archivo de imagen y lo convierte a data URL, redimensionándolo si hace
 * falta (localStorage tiene ~5-10MB por origen — sin esto, unas pocas fotos
 * grandes lo llenarían). Cargarlo como <img> también rechaza archivos que no
 * sean imágenes de verdad, aunque su extensión diga lo contrario.
 */
export function archivoADataUrl(file, maxDim = 900, calidad = 0.75) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error("No se pudo leer el archivo."));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("El archivo no es una imagen válida."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const escala = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * escala);
          height = Math.round(height * escala);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", calidad));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(file);
  });
}
