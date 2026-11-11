// =====================================================================
//  PARTIE LOCALE (même code que la version 1)
// =====================================================================
//  AsyncStorage = un petit "tiroir" sur le téléphone où on range du texte.
//  On y garde toute la liste des tâches sous forme de texte JSON.
//  Les données restent même après fermeture de l'application.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'tasks'; // le nom du "tiroir"

// Lire toutes les tâches
export async function getTasks() {
  const text = await AsyncStorage.getItem(KEY); // texte ou null
  if (text === null) {
    return []; // première ouverture : aucune tâche
  }
  return JSON.parse(text); // texte -> tableau JavaScript
}

// Enregistrer toute la liste (utilisé par les fonctions ci-dessous)
export async function saveTasks(tasks) {
  await AsyncStorage.setItem(KEY, JSON.stringify(tasks)); // tableau -> texte
}

// Ajouter une tâche
export async function addTask(task) {
  const tasks = await getTasks();
  tasks.push(task);
  await saveTasks(tasks);
}

// Modifier une tâche (on remplace celle qui a le même id)
export async function updateTask(task) {
  const tasks = await getTasks();
  const newTasks = tasks.map((t) => (t.id === task.id ? task : t));
  await saveTasks(newTasks);
}

// Supprimer une tâche (on garde toutes les autres)
export async function deleteTask(id) {
  const tasks = await getTasks();
  const newTasks = tasks.filter((t) => t.id !== id);
  await saveTasks(newTasks);
}
