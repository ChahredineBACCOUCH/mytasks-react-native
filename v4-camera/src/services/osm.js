// =====================================================================
//  OPENSTREETMAP
// =====================================================================
//  - La carte : la bibliothèque Leaflet affiche les tuiles OpenStreetMap
//    dans une WebView (une petite page web dans l'appli).
//    Page web -> appli : window.ReactNativeWebView.postMessage(...)
//    Appli -> page web : webview.injectJavaScript('setMarker(...)')
//  - La recherche d'adresse : l'API Nominatim d'OpenStreetMap.

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const HEADERS = {
  'User-Agent': 'MyTasks-ReactNative-projet-etudiant', // demandé par Nominatim
  'Accept-Language': 'fr',
};

// Chercher un lieu par son nom : "Tour Eiffel", "10 rue de la Paix, Paris"...
export async function searchPlaces(text) {
  const url = NOMINATIM + '/search?format=json&limit=5&q=' + encodeURIComponent(text);
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error('Recherche impossible : ' + response.status);
  const places = await response.json();
  return places.map((p) => ({
    label: p.display_name,
    latitude: Number(p.lat),
    longitude: Number(p.lon),
  }));
}

// Trouver le nom d'un point (latitude, longitude) : "géocodage inverse"
export async function placeName(latitude, longitude) {
  const url = NOMINATIM + '/reverse?format=json&zoom=18&lat=' + latitude + '&lon=' + longitude;
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) return null;
  const place = await response.json();
  return place.display_name || null;
}

// Lien pour ouvrir le lieu sur le site openstreetmap.org
export function osmLink(latitude, longitude) {
  return (
    'https://www.openstreetmap.org/?mlat=' + latitude + '&mlon=' + longitude +
    '#map=17/' + latitude + '/' + longitude
  );
}

// La page web de la carte (Leaflet + tuiles OpenStreetMap)
export function leafletHtml(latitude, longitude, radius, interactive) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>html, body, #map { height: 100%; margin: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var interactive = ${interactive ? 'true' : 'false'};
    var map = L.map('map', {
      zoomControl: interactive, dragging: interactive,
      scrollWheelZoom: interactive, doubleClickZoom: interactive, touchZoom: interactive,
    }).setView([${latitude}, ${longitude}], 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    var marker = L.marker([${latitude}, ${longitude}]).addTo(map);
    var zone = L.circle([${latitude}, ${longitude}], { radius: ${radius} }).addTo(map);

    // Appelée par l'appli (injectJavaScript) pour déplacer le marqueur
    function setMarker(lat, lng) {
      marker.setLatLng([lat, lng]);
      zone.setLatLng([lat, lng]);
      map.setView([lat, lng]);
    }

    // Toucher la carte : on déplace le marqueur et on prévient l'appli
    if (interactive) {
      map.on('click', function (e) {
        setMarker(e.latlng.lat, e.latlng.lng);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          latitude: e.latlng.lat, longitude: e.latlng.lng,
        }));
      });
    }
  </script>
</body>
</html>`;
}
