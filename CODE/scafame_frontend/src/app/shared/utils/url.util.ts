// src/app/shared/utils/url.util.ts
export function normalizeImage(url?: string | null): string | null {
  if (!url) return null;

  const raw = String(url).trim();
  if (!raw) return null;

  // Si viene con http(s), nos quedamos únicamente con el path (/uploads/...)
  if (/^https?:\/\//i.test(raw)) {
    try {
      return normalizeImage(new URL(raw).pathname);
    } catch {
      // si por alguna razón falla, caemos al retorno normalizado abajo
    }
  }

  // Soporta valores heredados como /api/uploads/... y api/uploads/...
  if (/^\/?api\/uploads\//i.test(raw)) {
    const withoutApi = raw.replace(/^\/?api\//i, '');
    return withoutApi.startsWith('/') ? withoutApi : `/${withoutApi}`;
  }

  // Si ya apunta a uploads, solo garantizamos slash inicial.
  if (/^\/?uploads\//i.test(raw)) {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }

  // Algunos registros históricos guardaron solo el filename (ej: 1757...png)
  if (!raw.includes('/') && /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(raw)) {
    return `/uploads/${raw}`;
  }

  // Asegura que empiece con "/"
  return raw.startsWith('/') ? raw : `/${raw}`;
}
