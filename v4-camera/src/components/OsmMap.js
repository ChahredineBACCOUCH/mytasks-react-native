// Une carte OpenStreetMap (Leaflet dans une WebView).
// Props :
//   - latitude, longitude : le point au départ
//   - radius      : rayon de la zone en mètres (cercle bleu)
//   - interactive : true = on peut bouger la carte et toucher un point
//   - onPress({ latitude, longitude }) : appelé quand on touche la carte
//   - webviewRef  : pour déplacer le marqueur depuis l'appli (injectJavaScript)

import { useMemo } from 'react';
import { WebView } from 'react-native-webview';
import { leafletHtml } from '../services/osm';

export default function OsmMap({ latitude, longitude, radius = 200, interactive, onPress, webviewRef, style }) {
  // La page est créée une seule fois (au premier affichage)
  const html = useMemo(
    () => leafletHtml(latitude, longitude, radius, interactive),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Message envoyé par la page web (window.ReactNativeWebView.postMessage)
  function handleMessage(event) {
    if (onPress) onPress(JSON.parse(event.nativeEvent.data));
  }

  return (
    <WebView
      ref={webviewRef}
      style={style}
      originWhitelist={['*']}
      source={{ html }}
      onMessage={handleMessage}
      scrollEnabled={false}
    />
  );
}
