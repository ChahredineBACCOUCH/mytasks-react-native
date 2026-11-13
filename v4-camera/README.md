# Version 4 : photo avec la caméra

C'est une **copie de la version 3** (local + synchronisation en ligne), avec une nouveauté : on peut **ajouter une photo à une tâche** avec la caméra du téléphone.

## Lancer

**1. Le serveur API** (dans un premier terminal) :

```bash
npm install
npm run api
```

**2. L'adresse du serveur** : dans [`src/config.js`](src/config.js), mets l'**adresse IP de ton ordinateur** (pas `localhost`). Sur Windows, tape `ipconfig`. Le téléphone et l'ordinateur doivent être sur le même Wi-Fi.

**3. L'application** (dans un deuxième terminal) :

```bash
npx expo start
```

Scanne le QR code avec **Expo Go**. La caméra marche dans Expo Go sur un vrai téléphone. Sur un émulateur Android, la caméra est simulée.

## Ce qui a été ajouté par rapport à la version 3

| Fichier | Changement |
|---|---|
| [`src/camera.js`](src/camera.js) | **Nouveau.** `takePhoto()` : permission, caméra, réduction de la photo, conversion en base64 |
| [`src/screens/TaskFormScreen.js`](src/screens/TaskFormScreen.js) | State `image`, boutons **Prendre une photo** / **Retirer**, aperçu de la photo |
| [`src/context/TasksContext.js`](src/context/TasksContext.js) | `addTask(title, description, priority, image)` : la tâche a un champ `image` |
| [`src/screens/TaskDetailsScreen.js`](src/screens/TaskDetailsScreen.js) | Affiche la photo en grand (l'écran devient une `ScrollView`) |
| [`src/components/TaskCard.js`](src/components/TaskCard.js) | Petite photo à gauche de la carte |
| [`app.json`](app.json) | Plugin `expo-image-picker` + message de permission caméra |
| [`package.json`](package.json) | `expo-image-picker` et `expo-image-manipulator` |

Le stockage (`src/storage/`) **n'a pas changé** : la photo est un champ de la tâche comme les autres.

## Comment ça marche ?

1. Dans le formulaire, **Prendre une photo** appelle `takePhoto()` ([`src/camera.js`](src/camera.js)).
2. On demande la **permission** caméra (`requestCameraPermissionsAsync`).
3. On ouvre la **caméra** (`launchCameraAsync`). Si l'utilisateur annule, on ne change rien.
4. On **réduit** la photo à 400 pixels de large et on la compresse (`ImageManipulator.manipulate`).
5. On la convertit en **texte base64** : `'data:image/jpeg;base64,...'`.
6. Ce texte est rangé dans `task.image`, puis enregistré comme le reste de la tâche : sur le téléphone, dans la file d'attente, puis sur le serveur.
7. `<Image source={{ uri: task.image }} />` affiche la photo.

```js
{
  "id": "1731500000000",
  "title": "Réparer le vélo",
  "priority": "haute",
  "status": "a_faire",
  "createdAt": "2026-11-13T10:00:00.000Z",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### Pourquoi du base64 et pas le chemin du fichier ?

- La caméra enregistre la photo dans un **dossier temporaire** du téléphone : le système peut l'effacer.
- Un chemin de fichier ne veut rien dire pour le **serveur** ni pour un **autre téléphone**.
- En base64, la photo est **dans la tâche**. Elle est sauvegardée, synchronisée et affichée partout, sans code de stockage en plus.

### Pourquoi réduire la photo ?

Une photo de téléphone pèse plusieurs Mo. AsyncStorage garde toutes les tâches dans **un seul texte**, et ce texte est aussi envoyé au serveur. Réduite à 400 pixels, une photo pèse environ 20 à 40 Ko.

**Limite :** pour une vraie application avec beaucoup de photos, on enverrait plutôt les images à un service de fichiers (et on garderait seulement leur adresse dans la tâche).
