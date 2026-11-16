// =====================================================================
//  L'ÉTAT GLOBAL DES TÂCHES (Partie 2 : useState)
// =====================================================================
//  Un "Context" permet de partager les tâches avec TOUS les écrans,
//  sans devoir les passer en props d'écran en écran.
//
//  Dans n'importe quel écran on écrit :
//     const { tasks, addTask } = useTasks();

import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as storage from '../storage/syncStore'; // Version 4 : local + sync (comme la v3)
import { cancelReminder, scheduleReminder, syncReminders } from '../services/notifications';

const TasksContext = createContext();

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]); // la liste des tâches
  const [loading, setLoading] = useState(true); // true pendant le chargement

  // Au démarrage de l'appli : on charge les tâches (une seule fois)
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    try {
      const data = await storage.getTasks();
      setTasks(data);
      syncReminders(data); // Version 4 : programmer les rappels qui manquent
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les tâches.\n' + error.message);
    }
    setLoading(false);
  }

  // Ajouter une tâche. Retourne true si ça a marché.
  // data = { title, description, priority, image, files, reminder, location, observers }
  async function addTask(data) {
    const newTask = {
      id: Date.now().toString(), // un identifiant unique simple
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: 'a_faire',
      createdAt: new Date().toISOString(),
      // ----- Version 4 -----
      image: data.image || null, // photo en base64
      files: data.files || [], // [{ id, name, mimeType, size }] (contenu sur le serveur)
      reminder: data.reminder || null, // date ISO du rappel
      location: data.location || null, // { latitude, longitude, label, radius }
      observers: data.observers || [], // noms des observateurs
    };

    try {
      await storage.addTask(newTask);
      setTasks([...tasks, newTask]); // nouvelle liste = ancienne + nouvelle tâche
      scheduleReminder(newTask); // Version 4 : notification à la date du rappel
      return true;
    } catch (error) {
      Alert.alert('Erreur', "La tâche n'a pas été ajoutée.\n" + error.message);
      return false;
    }
  }

  // Modifier une tâche. Retourne true si ça a marché.
  async function updateTask(task) {
    try {
      await storage.updateTask(task);
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
      scheduleReminder(task); // Version 4 : reprogrammer (ou annuler si terminée)
      return true;
    } catch (error) {
      Alert.alert('Erreur', "La tâche n'a pas été modifiée.\n" + error.message);
      return false;
    }
  }

  // Supprimer une tâche. Retourne true si ça a marché.
  async function deleteTask(id) {
    try {
      await storage.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
      cancelReminder(id); // Version 4 : plus de rappel pour une tâche supprimée
      return true;
    } catch (error) {
      Alert.alert('Erreur', "La tâche n'a pas été supprimée.\n" + error.message);
      return false;
    }
  }

  // Trouver une tâche avec son id
  function getTask(id) {
    return tasks.find((t) => t.id === id);
  }

  return (
    <TasksContext.Provider
      value={{ tasks, loading, loadTasks, addTask, updateTask, deleteTask, getTask }}
    >
      {children}
    </TasksContext.Provider>
  );
}

// Raccourci pour utiliser le Context dans un écran
export function useTasks() {
  return useContext(TasksContext);
}
