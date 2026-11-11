# Version 2 : En ligne (API REST)

Les tâches sont enregistrées **sur un serveur**. L'application lui parle avec `fetch()`.

✅ Les données sont partagées entre tous les téléphones.
❌ Sans Internet, ou si le serveur est éteint, l'application ne peut rien charger ni enregistrer.

## Lancer

**1. Le serveur API** (dans un premier terminal) :

```bash
npm install
npm run api
```

Le serveur est un faux serveur REST ([json-server](https://github.com/typicode/json-server)).
Ses données sont dans `server/db.json`. Pour vérifier qu'il marche, ouvre http://localhost:3000/tasks dans ton navigateur.

**2. L'adresse du serveur** : dans [`src/config.js`](src/config.js), mets l'**adresse IP de ton ordinateur** (pas `localhost`) :

```js
export const API_URL = 'http://192.168.1.15:3000';
```

Sur Windows, tape `ipconfig` dans un terminal et cherche « Adresse IPv4 ».
Le téléphone et l'ordinateur doivent être sur le **même Wi-Fi**.

**3. L'application** (dans un deuxième terminal) :

```bash
npx expo start
```

## Le fichier important

[`src/storage/apiStore.js`](src/storage/apiStore.js)

| Action | Requête |
|---|---|
| Lire | `GET /tasks` |
| Ajouter | `POST /tasks` |
| Modifier | `PUT /tasks/:id` |
| Supprimer | `DELETE /tasks/:id` |

**Pour tester la limite de cette version :** arrête le serveur (`Ctrl + C`) et essaie d'ajouter une tâche. Un message d'erreur apparaît.
