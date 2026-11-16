// Petites fonctions utiles partout.

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

// "2026-11-20T08:30:00.000Z" -> "20/11/2026 à 09:30" (heure du téléphone)
export function formatDateTime(iso) {
  const d = new Date(iso);
  return (
    pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() +
    ' à ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
  );
}

// 123456 -> "121 Ko"
export function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}

// Distance en mètres entre deux points GPS (formule de haversine)
export function distanceMeters(a, b) {
  const R = 6371000; // rayon de la Terre en mètres
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
