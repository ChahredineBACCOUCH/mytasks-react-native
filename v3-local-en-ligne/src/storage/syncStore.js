// =====================================================================
//  VERSION 3 : LOCAL + SYNCHRONISATION EN LIGNE
// =====================================================================
//  Idée simple :
//   1. Chaque changement est d'abord enregistré sur le téléphone
//      (comme la version 1) -> l'appli marche même sans Internet.
//   2. Le changement est aussi ajouté dans une "file d'attente".
//   3. On essaie d'envoyer la file d'attente au serveur (version 2).
//      - Si ça marche : on vide la file.
//      - Si pas d'Internet : on garde la file et on réessaiera plus tard.
//
//  Exemple de file d'attente :
//    [ { type: 'add',    task: {...} },
//      { type: 'update', task: {...} },
//      { type: 'delete', id: '123' } ]

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as local from './localStore';
import * as api from './apiStore';

const QUEUE_KEY = 'pendingChanges'; // le "tiroir" de la file d'attente

// ---------- La file d'attente ----------

async function getQueue() {
  const text = await AsyncStorage.getItem(QUEUE_KEY);
  return text === null ? [] : JSON.parse(text);
}

async function saveQueue(queue) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

async function addToQueue(change) {
  const queue = await getQueue();
  queue.push(change);
  await saveQueue(queue);
}

// Nombre de changements pas encore envoyés (affiché dans l'écran Profil)
export async function countPending() {
  const queue = await getQueue();
  return queue.length;
}

// ---------- La synchronisation ----------

// Envoie les changements en attente au serveur, un par un, dans l'ordre.
// Retourne true si tout a été envoyé, false sinon.
export async function syncNow() {
  const queue = await getQueue();

  while (queue.length > 0) {
    const change = queue[0]; // le plus ancien

    try {
      if (change.type === 'add') await api.addTask(change.task);
      if (change.type === 'update') await api.updateTask(change.task);
      if (change.type === 'delete') await api.deleteTask(change.id);
    } catch (error) {
      console.log('Synchronisation impossible pour le moment :', error.message);
      return false; // pas d'Internet : on s'arrête, on réessaiera plus tard
    }

    queue.shift(); // envoyé avec succès -> on l'enlève de la file
    await saveQueue(queue);
  }

  return true;
}

// ---------- Les 4 fonctions utilisées par l'application ----------

// Lire les tâches
export async function getTasks() {
  // 1. On envoie d'abord nos changements en attente
  const allSent = await syncNow();

  // 2. Si tout est envoyé, on récupère la liste à jour depuis le serveur
  //    (elle peut contenir des tâches ajoutées depuis un autre téléphone)
  if (allSent) {
    try {
      const serverTasks = await api.getTasks();
      await local.saveTasks(serverTasks); // copie locale à jour
      return serverTasks;
    } catch (error) {
      console.log('Serveur injoignable, on utilise les données locales.');
    }
  }

  // 3. Sinon : on utilise la copie locale
  return await local.getTasks();
}

export async function addTask(task) {
  await local.addTask(task); // 1. sur le téléphone
  await addToQueue({ type: 'add', task: task }); // 2. dans la file
  syncNow(); // 3. on essaie d'envoyer (sans attendre la réponse)
}

export async function updateTask(task) {
  await local.updateTask(task);
  await addToQueue({ type: 'update', task: task });
  syncNow();
}

export async function deleteTask(id) {
  await local.deleteTask(id);
  await addToQueue({ type: 'delete', id: id });
  syncNow();
}
