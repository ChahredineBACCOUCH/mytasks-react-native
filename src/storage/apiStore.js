// =====================================================================
//  VERSION 2 : STOCKAGE EN LIGNE (API REST)
// =====================================================================
//  Les tâches sont sur un serveur. On lui parle avec fetch() :
//
//    GET    /tasks       -> lire toutes les tâches
//    POST   /tasks       -> ajouter une tâche
//    PUT    /tasks/:id   -> modifier une tâche
//    DELETE /tasks/:id   -> supprimer une tâche
//
//  Sans Internet (ou si le serveur est éteint), rien ne marche :
//  c'est la limite de cette version.

import { API_URL } from '../config';

// Petite fonction d'aide : appelle le serveur et vérifie la réponse.
// Si le serveur ne répond pas en 5 secondes, on abandonne.
async function request(path, method = 'GET', body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

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
