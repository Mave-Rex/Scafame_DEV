// src/app/shared/utils/url.util.ts
export function normalizeImage(url?: string | null): string | null {
  if (!url) return null;

  // Si viene con http(s), nos quedamos únicamente con el path (/uploads/...)
  if (/^https?:\/\//i.test(url)) {
    try {
      return new URL(url).pathname || null;
    } catch {
      // si por alguna razón falla, caemos al retorno normalizado abajo
    }
  }

  // Asegura que empiece con "/"
  return url.startsWith('/') ? url : `/${url}`;
}
