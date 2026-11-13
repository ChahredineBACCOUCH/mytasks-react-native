// =====================================================================
//  VERSION 4 : PRENDRE UNE PHOTO AVEC LA CAMÉRA
// =====================================================================
//  1. On demande la permission d'utiliser la caméra.
//  2. On ouvre la caméra (expo-image-picker).
//  3. On réduit la photo à 400 pixels de large (expo-image-manipulator),
//     sinon elle serait trop lourde à enregistrer et à envoyer au serveur.
//  4. On la transforme en texte "base64" : 'data:image/jpeg;base64,...'
//
//  Pourquoi du texte ? Parce que la tâche est enregistrée en JSON
//  (AsyncStorage + serveur). Une photo en texte se range dans la tâche
//  comme le titre ou la description, et <Image> sait l'afficher.

import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Retourne la photo (texte base64) ou null si l'utilisateur annule.
export async function takePhoto() {
  // 1. Permission
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Caméra', "Autorise l'accès à la caméra pour ajouter une photo.");
    return null;
  }

  // 2. Ouvrir la caméra
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 1,
  });
  if (result.canceled) {
    return null; // l'utilisateur a fermé la caméra
  }

  // 3 + 4. Réduire, compresser et convertir en base64
  const context = ImageManipulator.manipulate(result.assets[0].uri);
  context.resize({ width: 400 }); // la hauteur est calculée automatiquement
  const image = await context.renderAsync();
  const photo = await image.saveAsync({ compress: 0.5, format: SaveFormat.JPEG, base64: true });
  return 'data:image/jpeg;base64,' + photo.base64;
}
