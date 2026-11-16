# Version 4 : caméra, fichiers, rappels et commentaires

C'est une **copie de la version 3** (local + synchronisation en ligne) avec 6 nouveautés :

| # | Nouveauté | Fichier principal |
|---|---|---|
| 1 | **Communiquer avec la caméra** (photo de la tâche) | [`src/components/CameraModal.js`](src/components/CameraModal.js) |
| 2 | **Ajouter un fichier** à une tâche | [`src/services/files.js`](src/services/files.js) |
| 3 | **Appeler une API pour récupérer un fichier** | [`src/services/files.js`](src/services/files.js) + [`server/download.js`](server/download.js) |
| 4 | **Rappel à une date et une heure** (notification) | [`src/services/notifications.js`](src/services/notifications.js) |
| 5 | **Rappel à un lieu** (carte OpenStreetMap) | [`src/components/MapPickerModal.js`](src/components/MapPickerModal.js) + [`src/components/Watchers.js`](src/components/Watchers.js) |
| 6 | **Observateurs + commentaires + notification** | [`src/components/CommentsSection.js`](src/components/CommentsSection.js) + [`src/components/Watchers.js`](src/components/Watchers.js) |

## Lancer

**1. Le serveur API** (premier terminal) :

```bash
npm install
npm run api
```

`npm run api` lance json-server **avec** le middleware [`server/download.js`](server/download.js), qui ajoute la route de téléchargement.

**2. L'adresse du serveur** : dans [`src/config.js`](src/config.js), mets l'**adresse IP de ton ordinateur** (tape `ipconfig` sur Windows). Le téléphone et l'ordinateur doivent être sur le même Wi-Fi.

**3. L'application** (deuxième terminal) :

```bash
npx expo start
```

Scanne le QR code avec **Expo Go**, puis écris **ton nom** dans l'onglet **Profil** (il sert pour les commentaires et les observateurs).

## Ce que contient une tâche maintenant

```js
{
  "id": "1731500000000",
  "title": "Réparer le vélo",
  "priority": "elevee",
  "status": "a_faire",
  "createdAt": "2026-11-16T10:00:00.000Z",
  "image": "data:image/jpeg;base64,/9j/4AAQ...",                  // 1. photo
  "files": [{ "id": "17315...", "name": "devis.pdf", "mimeType": "application/pdf", "size": 48213 }], // 2.
  "reminder": "2026-11-20T08:30:00.000Z",                         // 4. rappel date/heure
  "location": { "latitude": 48.85, "longitude": 2.35, "label": "Paris", "radius": 200 }, // 5.
  "observers": ["Sara", "Ali"]                                    // 6. observateurs
}
```

Ces champs sont enregistrés et synchronisés **comme le reste de la tâche** (version 3) : `src/storage/` n'a pas changé de logique.
Le **contenu** des fichiers et les **commentaires** sont à part, sur le serveur (`/files` et `/comments`).

## Organisation du code (nouveautés)

```
src/
├── components/
│   ├── CameraModal.js       1. caméra en direct (expo-camera)
│   ├── OsmMap.js            5. carte OpenStreetMap (Leaflet dans une WebView)
│   ├── MapPickerModal.js    5. choisir un lieu : toucher la carte ou chercher une adresse
│   ├── FileList.js          3. liste des fichiers : toucher = télécharger + ouvrir
│   ├── CommentsSection.js   6. lire et écrire les commentaires
│   ├── Watchers.js          5 + 6. surveille la position GPS et les nouveaux commentaires
│   ├── SmallButton.js       petit bouton avec icône
│   └── fields/              un champ du formulaire par nouveauté
│       ├── PhotoField.js  FilesField.js  ReminderField.js
│       └── PlaceField.js  ObserversField.js
├── services/
│   ├── photo.js             réduire une photo et la passer en base64
│   ├── files.js             2 + 3. envoyer / récupérer un fichier
│   ├── notifications.js     4. notifications locales + rappels programmés
│   ├── osm.js               5. API Nominatim + page web de la carte
│   └── user.js              mon nom (écran Profil)
├── storage/apiStore.js      + uploadFile, fileUrl, getComments, addComment
└── utils.js                 formatDateTime, formatSize, distanceMeters
server/
├── db.json                  + "files": [] et "comments": []
└── download.js              3. route GET /download/:id
```

## 1. Communiquer avec la caméra

[`CameraModal.js`](src/components/CameraModal.js) utilise **expo-camera** :

1. `useCameraPermissions()` demande la permission.
2. `<CameraView ref={cameraRef} facing={facing} />` affiche l'image de la caméra **en direct**.
3. On **parle à la caméra** avec la ref : `cameraRef.current.takePictureAsync()`.
4. `facing` = `'back'` ou `'front'` : bouton pour changer de caméra.
5. La photo est réduite à 400 px et convertie en base64 ([`services/photo.js`](src/services/photo.js)).

## 2. Ajouter un fichier

[`pickAndUploadFile()`](src/services/files.js) :

1. `DocumentPicker.getDocumentAsync()` ouvre le sélecteur de fichiers du téléphone.
2. `new File(uri).base64()` lit le fichier (expo-file-system).
3. `POST /files` envoie `{ id, name, mimeType, size, data }` au serveur (5 Mo maximum).
4. La tâche garde seulement `{ id, name, mimeType, size }`, pas le contenu (sinon AsyncStorage serait vite plein).

## 3. Appeler une API pour récupérer un fichier

- **Côté serveur**, json-server ne renvoie que du JSON. [`server/download.js`](server/download.js) ajoute la route **`GET /download/:id`**, qui renvoie le **vrai fichier** (octets + `Content-Type`).
- **Côté appli**, [`downloadAndOpenFile()`](src/services/files.js) :
  1. `File.downloadFileAsync(API_URL + '/download/' + id, destination)` télécharge le fichier dans le cache du téléphone ;
  2. `Sharing.shareAsync(uri)` l'ouvre avec une autre appli (lecteur PDF, galerie...).

## 4. Rappel à une date et une heure

- [`ReminderField.js`](src/components/fields/ReminderField.js) : choix de la date puis de l'heure (`@react-native-community/datetimepicker`).
- [`notifications.js`](src/services/notifications.js) : `scheduleNotificationAsync({ trigger: { type: DATE, date } })` programme une **notification locale**.
- Le Context appelle `scheduleReminder(task)` après un ajout ou une modification, et `cancelReminder(id)` après une suppression. Une tâche **terminée** n'a plus de rappel.
- La correspondance tâche → notification est gardée sur le téléphone (clé `scheduledReminders`).

## 5. Rappel à un lieu (OpenStreetMap)

- **La carte** ([`OsmMap.js`](src/components/OsmMap.js)) : la bibliothèque **Leaflet** affiche les tuiles **OpenStreetMap** dans une **WebView**.
  - Page web → appli : `window.ReactNativeWebView.postMessage(...)` quand on touche la carte.
  - Appli → page web : `webviewRef.current.injectJavaScript('setMarker(...)')` après une recherche.
- **La recherche d'adresse** ([`osm.js`](src/services/osm.js)) : API **Nominatim** d'OpenStreetMap (`/search` et `/reverse`).
- **Le rappel** ([`Watchers.js`](src/components/Watchers.js)) : `Location.watchPositionAsync()` suit la position. À moins de **200 m** du lieu d'une tâche « À faire », une notification est envoyée (une fois par arrivée).

## 6. Observateurs, commentaires et notification

- **Observateurs** : liste de noms dans la tâche ([`ObserversField.js`](src/components/fields/ObserversField.js)), ou bouton **Suivre cette tâche** dans les Détails.
- **Commentaires** ([`CommentsSection.js`](src/components/CommentsSection.js)) : `GET /comments?task=ID` et `POST /comments`, signés avec le nom de l'onglet Profil.
- **Notification** ([`Watchers.js`](src/components/Watchers.js)) : toutes les 15 secondes, l'appli lit `/comments`. Pour un **nouveau** commentaire sur une tâche dont **je suis observateur**, et écrit par **quelqu'un d'autre**, elle envoie une notification. Toucher la notification ouvre la tâche.

### Tester les commentaires avec un seul téléphone

1. Profil : nom = **Sara**. Ouvre une tâche → **Suivre cette tâche**.
2. Profil : nom = **Ali**. Ouvre la même tâche → écris un commentaire.
3. Profil : nom = **Sara**. Moins de 15 secondes plus tard, la notification arrive.

(Avec deux téléphones, chacun avec son nom, c'est encore plus parlant.)

## Limites (à connaître pour l'oral)

- **Rappels et commentaires = notifications locales.** Elles sont créées par l'appli **ouverte** (ou en arrière-plan récent). Une vraie appli enverrait des **notifications push** depuis le serveur (Expo Go ne les gère plus sur Android).
- **Rappel de lieu** : la position est suivie seulement quand l'appli est ouverte. En arrière-plan, il faudrait `expo-task-manager` + géorepérage, qui ne marche pas dans Expo Go.
- **Fichiers et commentaires** ont besoin du serveur (pas de mode hors ligne pour eux).
- **Le contenu des fichiers** est rangé dans `db.json` en base64 : bien pour un projet de cours, pas pour une vraie appli (on utiliserait un stockage de fichiers).
- **La carte** charge Leaflet et les tuiles depuis Internet : elle ne s'affiche pas hors ligne.
