// =====================================================================
//  PARTIE EN LIGNE (même code que la version 2)
// =====================================================================
//  Les tâches sont sur un serveur. On lui parle avec fetch() :
//
//    GET    /tasks       -> lire toutes les tâches
//    POST   /tasks       -> ajouter une tâche
//    PUT    /tasks/:id   -> modifier une tâche
//    DELETE /tasks/:id   -> supprimer une tâche
//
//  Ici, ces fonctions sont utilisées par syncStore.js pour envoyer
//  les changements au serveur.

import { API_URL } from '../config';

// Petite fonction d'aide : appelle le serveur et vérifie la réponse.
// Si le serveur ne répond pas à temps (5 secondes par défaut), on abandonne.
async function request(path, method = 'GET', body, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(API_URL + path, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('Erreur du serveur : ' + response.status);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// Lire toutes les tâches
export async function getTasks() {
  return await request('/tasks');
}

// Ajouter une tâche
export async function addTask(task) {
  await request('/tasks', 'POST', task);
}

// Modifier une tâche
export async function updateTask(task) {
  await request('/tasks/' + task.id, 'PUT', task);
}

// Supprimer une tâche
export async function deleteTask(id) {
  await request('/tasks/' + id, 'DELETE');
}

// =====================================================================
//  VERSION 4 : FICHIERS ET COMMENTAIRES (seulement en ligne)
// =====================================================================

// Envoyer un fichier : { id, name, mimeType, size, data (base64) }
// 30 secondes maximum, car un fichier peut être plus long à envoyer.
export async function uploadFile(file) {
  await request('/files', 'POST', file, 30000);
}

// L'adresse qui renvoie le VRAI fichier (voir server/download.js)
export function fileUrl(id) {
  return API_URL + '/download/' + id;
}

// Les commentaires d'une tâche, du plus ancien au plus récent
export async function getComments(taskId) {
  return await request('/comments?task=' + taskId + '&_sort=createdAt&_order=asc');
}

// Tous les commentaires (pour savoir s'il y en a de nouveaux)
export async function getAllComments() {
  return await request('/comments');
}

// Ajouter un commentaire : { id, task, author, text, createdAt }
export async function addComment(comment) {
  await request('/comments', 'POST', comment);
}
