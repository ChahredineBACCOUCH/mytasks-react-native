# MyTasks : gestion de tâches en React Native (Expo)

Application simple pour apprendre React Native : ajouter, modifier, supprimer, rechercher et filtrer des tâches.

Le dépôt contient **3 versions distinctes** de la même application. Seule la façon de **garder les données** (la persistance) change :

| Dossier | Version | Où sont les données ? | Marche sans Internet ? |
|---|---|---|---|
| [`v1-local/`](v1-local) | 1. Local | Sur le téléphone (AsyncStorage) | ✅ Oui |
| [`v2-en-ligne/`](v2-en-ligne) | 2. En ligne | Sur un serveur (API REST) | ❌ Non |
| [`v3-local-en-ligne/`](v3-local-en-ligne) | 3. Local + en ligne | Sur le téléphone **+** synchronisées avec le serveur | ✅ Oui (envoi plus tard) |
| [`v4-camera/`](v4-camera) | 4. Photo | Comme la version 3, **+ une photo par tâche** prise avec la caméra | ✅ Oui (envoi plus tard) |

La version 4 est une copie de la version 3 avec une seule nouveauté : la photo (voir [`v4-camera/README.md`](v4-camera/README.md)).

Chaque dossier est un **projet Expo complet et indépendant**. On l'ouvre, on l'installe et on le lance tout seul.

## Lancer une version

```bash
cd v1-local
npm install
npx expo start
```

Ensuite, scanne le QR code avec l'application **Expo Go** sur ton téléphone.

Pour les versions 2, 3 et 4, il faut aussi démarrer le serveur API. Les explications sont dans le README de chaque dossier.

## Ce qui est pareil dans les 3 versions

- Les écrans : Accueil, Liste, Détails, Formulaire, Profil
- Les composants : `TaskCard`, `Badge`, `Stats`
- La navigation : onglets en bas + écrans Détails / Modifier
- L'état global : `src/context/TasksContext.js`

## Ce qui change : le dossier `src/storage/`

Chaque version a un fichier de stockage avec **les mêmes 4 fonctions** :

```js
getTasks()        // lire toutes les tâches
addTask(task)     // ajouter
updateTask(task)  // modifier
deleteTask(id)    // supprimer
```

| Version | Fichier utilisé |
|---|---|
| 1 | `localStore.js` : AsyncStorage |
| 2 | `apiStore.js` : `fetch()` vers l'API |
| 3 | `syncStore.js` : utilise `localStore.js` + `apiStore.js` + une file d'attente |

Pour comparer les versions, regarde la ligne `import * as storage from ...` en haut de `src/context/TasksContext.js` : c'est la seule chose qui change dans la logique de l'application.

## Comparer deux versions

```bash
git diff --no-index v1-local/src v3-local-en-ligne/src
```

Pour voir uniquement ce que la photo a ajouté :

```bash
git diff --no-index v3-local-en-ligne/src v4-camera/src
```
