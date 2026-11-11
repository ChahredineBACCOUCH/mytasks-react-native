# Version 3 : Local + synchronisation en ligne

On combine les deux premières versions :

- chaque changement est enregistré **d'abord sur le téléphone** (comme la version 1), donc l'application marche sans Internet ;
- il est ensuite **envoyé au serveur** (comme la version 2) dès que c'est possible.

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

## Comment ça marche ?

Le fichier important est [`src/storage/syncStore.js`](src/storage/syncStore.js). Il utilise les deux autres :

```
src/storage/
├── localStore.js   même code que la version 1 (AsyncStorage)
├── apiStore.js     même code que la version 2 (fetch)
└── syncStore.js    local + file d'attente + synchronisation
```

1. Quand on ajoute, modifie ou supprime une tâche :
   - on l'enregistre sur le téléphone ;
   - on ajoute le changement dans une **file d'attente** (clé `pendingChanges`) ;
   - on essaie d'envoyer la file au serveur.
2. Si le serveur répond, le changement est retiré de la file.
3. S'il n'y a pas d'Internet, la file est gardée. Elle est renvoyée plus tard :
   - au prochain démarrage de l'application ;
   - quand on tire la liste vers le bas ;
   - avec le bouton **Synchroniser maintenant** de l'écran Profil.

Exemple de file d'attente :

```js
[
  { type: 'add',    task: { id: '17', title: 'Lire', ... } },
  { type: 'update', task: { id: '3',  title: 'Sport', ... } },
  { type: 'delete', id: '5' }
]
```

## Tester le mode hors ligne

1. Arrête le serveur (`Ctrl + C`).
2. Ajoute 2 tâches : elles apparaissent quand même.
3. Ouvre **Profil** : « Changements pas encore envoyés : 2 ».
4. Rallume le serveur (`npm run api`) et appuie sur **Synchroniser maintenant**.
5. Le compteur revient à 0 et les tâches sont dans `server/db.json`.
