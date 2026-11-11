# Version 1 : Local (AsyncStorage)

Les tâches sont enregistrées **sur le téléphone** avec AsyncStorage.
Elles restent même après la fermeture de l'application.

✅ Fonctionne sans Internet. Aucun serveur nécessaire.
❌ Les données ne sont pas partagées entre plusieurs appareils.

## Lancer

```bash
npm install
npx expo start
```

## Le fichier important

[`src/storage/localStore.js`](src/storage/localStore.js) : toute la liste est rangée sous la clé `tasks`, en texte JSON.

```js
await AsyncStorage.setItem('tasks', JSON.stringify(tasks)); // écrire
const text = await AsyncStorage.getItem('tasks');           // lire
```

## Organisation du code

```
App.js                       Point de départ
src/
├── theme.js                 Couleurs, priorités, statuts
├── components/              Badge, TaskCard, Stats
├── context/TasksContext.js  L'état des tâches partagé (useState)
├── screens/                 Accueil, Liste, Détails, Formulaire, Profil
├── navigation/              Onglets + écrans
└── storage/localStore.js    💾 AsyncStorage
```
