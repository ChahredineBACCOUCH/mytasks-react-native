// =====================================================================
//  LES "SURVEILLANTS" (tournent tant que l'application est ouverte)
// =====================================================================
//  Ce composant n'affiche rien. Il fait 3 choses :
//
//  1. RAPPEL DE LIEU : il suit la position GPS (expo-location).
//     Si on arrive à moins de "radius" mètres du lieu d'une tâche
//     à faire -> notification "Vous êtes arrivé".
//
//  2. COMMENTAIRES : toutes les 15 secondes, il demande au serveur
//     les commentaires. S'il y en a un nouveau sur une tâche dont JE suis
//     observateur (et que ce n'est pas moi l'auteur) -> notification.
//
//  3. CLIC SUR UNE NOTIFICATION : il ouvre l'écran Détails de la tâche.

import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useTasks } from '../context/TasksContext';
import { navigationRef } from '../navigation/AppNavigator';
import * as api from '../storage/apiStore';
import { notifyNow } from '../services/notifications';
import { getUserName, sameName } from '../services/user';
import { distanceMeters } from '../utils';

const ARRIVED_KEY = 'placeAlerts'; // tâches déjà signalées : { taskId: true }
const SEEN_KEY = 'seenComments'; // ids des commentaires déjà vus
const COMMENTS_EVERY = 15000; // 15 secondes

export default function Watchers() {
  const { tasks } = useTasks();

  // Les fonctions ci-dessous tournent longtemps : elles lisent toujours
  // la liste à jour grâce à cette ref.
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const hasPlaces = tasks.some((t) => t.location && t.status === 'a_faire');

  // ---------- 1. Rappel de lieu ----------
  useEffect(() => {
    if (!hasPlaces) return; // aucune tâche avec un lieu : pas besoin du GPS

    let subscription = null;
    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 30 }, // tous les 30 m
        (position) => checkPlaces(position.coords)
      );
    })();

    return () => subscription?.remove(); // on arrête de suivre le GPS
  }, [hasPlaces]);

  async function checkPlaces(me) {
    const text = await AsyncStorage.getItem(ARRIVED_KEY);
    const alerted = text ? JSON.parse(text) : {};

    for (const task of tasksRef.current) {
      if (!task.location || task.status !== 'a_faire') continue;
      const distance = distanceMeters(me, task.location);

      if (distance <= task.location.radius && !alerted[task.id]) {
        alerted[task.id] = true; // une seule notification par arrivée
        await notifyNow('📍 ' + task.title, 'Vous êtes près de : ' + task.location.label, task.id);
      } else if (distance > task.location.radius * 2 && alerted[task.id]) {
        delete alerted[task.id]; // on est reparti : on pourra prévenir à nouveau
      }
    }
    await AsyncStorage.setItem(ARRIVED_KEY, JSON.stringify(alerted));
  }

  // ---------- 2. Nouveaux commentaires ----------
  useEffect(() => {
    checkComments();
    const timer = setInterval(checkComments, COMMENTS_EVERY);
    return () => clearInterval(timer);
  }, []);

  async function checkComments() {
    try {
      const comments = await api.getAllComments();
      const me = await getUserName();
      const text = await AsyncStorage.getItem(SEEN_KEY);

      if (text !== null && me !== '') {
        const seen = JSON.parse(text);
        for (const c of comments) {
          if (seen.includes(c.id) || sameName(c.author, me)) continue;
          const task = tasksRef.current.find((t) => t.id === c.task);
          const iObserve = task && (task.observers || []).some((n) => sameName(n, me));
          if (iObserve) {
            await notifyNow('💬 ' + c.author + ' sur « ' + task.title + ' »', c.text, task.id);
          }
        }
      }
      // Tous les commentaires actuels sont maintenant "vus"
      // (la première fois, on ne notifie rien : pas d'avalanche)
      await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(comments.map((c) => c.id)));
    } catch {
      // serveur injoignable : on réessaiera dans 15 secondes
    }
  }

  // ---------- 3. Clic sur une notification -> détails de la tâche ----------
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const taskId = response.notification.request.content.data?.taskId;
      if (taskId && navigationRef.isReady()) {
        navigationRef.navigate('Details', { id: taskId });
      }
    });
    return () => subscription.remove();
  }, []);

  return null; // rien à afficher
}
