// =====================================================================
//  NOTIFICATIONS LOCALES (expo-notifications)
// =====================================================================
//  - notifyNow()        : affiche une notification tout de suite
//                         (arrivée sur un lieu, nouveau commentaire)
//  - scheduleReminder() : programme le rappel date/heure d'une tâche
//  - cancelReminder()   : annule ce rappel
//
//  Les notifications programmées sont propres à CE téléphone. On garde
//  donc, sur le téléphone, la correspondance tâche -> notification :
//     { "17315...": { notificationId: "abc", date: "2026-11-20T08:00..." } }

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const KEY = 'scheduledReminders';
const CHANNEL = 'rappels'; // Android : catégorie de notifications

// Que faire quand une notification arrive alors que l'appli est ouverte :
// on l'affiche quand même (bannière + son).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Demande la permission (une seule fois) et crée la catégorie Android.
export async function askPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Rappels des tâches',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

// Notification immédiate. data.taskId permet d'ouvrir la tâche au clic.
export async function notifyNow(title, body, taskId) {
  if (!(await askPermission())) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { taskId } },
    trigger: null, // null = tout de suite
  });
}

// ---------- Rappel à une date et une heure ----------

async function getMap() {
  const text = await AsyncStorage.getItem(KEY);
  return text === null ? {} : JSON.parse(text);
}

async function saveMap(map) {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

export async function cancelReminder(taskId) {
  const map = await getMap();
  if (map[taskId]) {
    await Notifications.cancelScheduledNotificationAsync(map[taskId].notificationId);
    delete map[taskId];
    await saveMap(map);
  }
}

// Programme (ou reprogramme) le rappel d'une tâche.
export async function scheduleReminder(task) {
  try {
    await cancelReminder(task.id);

    // Pas de rappel, tâche terminée ou date passée : rien à programmer
    if (!task.reminder || task.status === 'terminee') return;
    const date = new Date(task.reminder);
    if (date <= new Date()) return;

    if (!(await askPermission())) return;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Rappel : ' + task.title,
        body: task.description || "C'est l'heure de cette tâche.",
        data: { taskId: task.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: date,
        channelId: CHANNEL,
      },
    });

    const map = await getMap();
    map[task.id] = { notificationId, date: task.reminder };
    await saveMap(map);
  } catch (error) {
    console.log('Rappel non programmé :', error.message);
  }
}

// Après un chargement (les tâches peuvent venir d'un autre téléphone) :
// on programme les rappels qui manquent ou qui ont changé.
export async function syncReminders(tasks) {
  const map = await getMap();
  for (const task of tasks) {
    const saved = map[task.id];
    if (task.reminder && (!saved || saved.date !== task.reminder)) {
      await scheduleReminder(task);
    }
  }
}
