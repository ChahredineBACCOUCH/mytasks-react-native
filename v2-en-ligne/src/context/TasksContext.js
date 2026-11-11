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
import * as storage from '../storage/apiStore'; // Version 2 : API en ligne

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
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les tâches.\n' + error.message);
    }
    setLoading(false);
  }

  // Ajouter une tâche. Retourne true si ça a marché.
  async function addTask(title, description, priority) {
    const newTask = {
      id: Date.now().toString(), // un identifiant unique simple
      title: title,
      description: description,
      priority: priority,
      status: 'a_faire',
      createdAt: new Date().toISOString(),
    };

    try {
      await storage.addTask(newTask);
      setTasks([...tasks, newTask]); // nouvelle liste = ancienne + nouvelle tâche
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
