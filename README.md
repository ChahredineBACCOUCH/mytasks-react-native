# MyTasks — Gestion de tâches en React Native (Expo)

Application simple pour apprendre React Native : ajouter, modifier, supprimer et filtrer des tâches.

Elle existe en **3 versions de persistance** (façon de garder les données) :

| Version | Mode       | Où sont les données ?                       | Marche sans Internet ? |
|---------|------------|---------------------------------------------|------------------------|
| 1       | `'local'`  | Sur le téléphone (AsyncStorage)             | ✅ Oui                 |
| 2       | `'online'` | Sur un serveur (API REST)                   | ❌ Non                 |
| 3       | `'sync'`   | Sur le téléphone **+** synchronisées en ligne | ✅ Oui (envoi plus tard) |

👉 Pour changer de version, modifie **une seule ligne** dans [`src/config.js`](src/config.js) :

```js
export const MODE = 'local'; // ou 'online' ou 'sync'
```

---

## 1. Installer et lancer

```bash
npm install
npx expo start
```

Scanne le QR code avec l'application **Expo Go** sur ton téléphone.

## 2. Lancer le serveur API (versions 2 et 3)

Le serveur est un faux serveur REST ([json-server](https://github.com/typicode/json-server)).
Les données sont dans `server/db.json`.

```bash
npm run api
```

Puis, dans `src/config.js`, mets l'**adresse IP de ton ordinateur** (pas `localhost` !) :

```js
export const API_URL = 'http://192.168.1.15:3000';
```

Sur Windows, tape `ipconfig` dans un terminal et cherche « Adresse IPv4 ».
Le téléphone et l'ordinateur doivent être sur le **même Wi-Fi**.

Test dans le navigateur : http://localhost:3000/tasks

---

## 3. Organisation du code

```
App.js                      Point de départ
src/
├── config.js               ⚙️  Choix de la version (MODE) + adresse du serveur
├── theme.js                Couleurs, priorités, statuts
├── components/
│   ├── Badge.js            Petite étiquette colorée
│   ├── TaskCard.js         Carte d'une tâche (Partie 1 : props + styles)
│   └── Stats.js            Compteurs Total / Terminées / À faire
├── context/
│   └── TasksContext.js     L'état des tâches partagé (Partie 2 : useState)
├── screens/
│   ├── HomeScreen.js       Écran Accueil
│   ├── TaskListScreen.js   Liste + recherche + filtres (FlatList)
│   ├── TaskDetailsScreen.js Détails + supprimer
│   ├── TaskFormScreen.js   Ajouter / modifier (Partie 3 : CRUD)
│   └── ProfileScreen.js    Version utilisée + bouton synchroniser
├── navigation/
│   └── AppNavigator.js     Onglets + écrans (Partie 4 : navigation)
└── storage/                💾 Partie 5 : persistance
    ├── index.js            Choisit la version selon MODE
    ├── localStore.js       Version 1 : AsyncStorage
    ├── apiStore.js         Version 2 : fetch() vers l'API
    └── syncStore.js        Version 3 : local + file d'attente + synchronisation
server/
└── db.json                 Données du serveur API
```

### L'idée importante

Les 3 fichiers de `storage/` ont **les mêmes 4 fonctions** :

```js
getTasks()        // lire toutes les tâches
addTask(task)     // ajouter
updateTask(task)  // modifier
deleteTask(id)    // supprimer
```

Les écrans ne savent pas où sont les données : ils appellent juste ces fonctions
(via `useTasks()`). C'est pour ça qu'on peut changer de version avec une seule ligne.

### Comment marche la version 3 (sync) ?

1. Chaque changement est enregistré **d'abord sur le téléphone** → l'appli est rapide et marche hors ligne.
2. Le changement est mis dans une **file d'attente** (`pendingChanges`).
3. L'appli essaie d'envoyer la file au serveur :
   - ça marche → la file est vidée ;
   - pas d'Internet → la file est gardée et renvoyée plus tard
     (au prochain démarrage, en tirant la liste vers le bas, ou avec le bouton **Synchroniser** de l'écran Profil).

**Pour tester :** éteins le serveur (`Ctrl + C`), ajoute des tâches, regarde le compteur
dans Profil, rallume le serveur (`npm run api`) et appuie sur **Synchroniser maintenant**.
