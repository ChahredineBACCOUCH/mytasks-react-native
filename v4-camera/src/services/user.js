// =====================================================================
//  LE NOM DE L'UTILISATEUR (écran Profil)
// =====================================================================
//  Il sert à signer les commentaires et à savoir si "je" suis
//  observateur d'une tâche. Il est gardé sur le téléphone.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'userName';

export async function getUserName() {
  return (await AsyncStorage.getItem(KEY)) || '';
}

export async function setUserName(name) {
  await AsyncStorage.setItem(KEY, name.trim());
}

// Compare deux noms sans tenir compte des majuscules ni des espaces
export function sameName(a, b) {
  return (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
}
