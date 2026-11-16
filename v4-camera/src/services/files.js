// =====================================================================
//  FICHIERS : ajouter un fichier à une tâche, puis le récupérer
// =====================================================================
//  ENVOI (ajouter un fichier) :
//    1. DocumentPicker ouvre le sélecteur de fichiers du téléphone.
//    2. On lit le fichier en base64 (expo-file-system).
//    3. On l'envoie au serveur : POST /files   (apiStore.uploadFile)
//    4. La tâche garde seulement les infos : { id, name, mimeType, size }
//
//  RÉCUPÉRATION (appeler une API pour récupérer un fichier) :
//    1. On télécharge le vrai fichier : GET /download/:id
//       (File.downloadFileAsync l'enregistre dans le cache du téléphone)
//    2. On l'ouvre avec une autre appli (expo-sharing).

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as api from '../storage/apiStore';

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo maximum

// Choisir un fichier et l'envoyer au serveur.
// Retourne { id, name, mimeType, size }, ou null si l'utilisateur annule.
export async function pickAndUploadFile() {
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (asset.size && asset.size > MAX_SIZE) {
    throw new Error('Fichier trop gros (5 Mo maximum).');
  }

  const data = await new File(asset.uri).base64(); // contenu du fichier en texte
  const info = {
    id: Date.now().toString(),
    name: asset.name,
    mimeType: asset.mimeType || 'application/octet-stream',
    size: asset.size || 0,
  };

  await api.uploadFile({ ...info, data }); // le contenu va sur le serveur
  return info; // la tâche ne garde que les infos (pas le contenu)
}

// Télécharger un fichier depuis l'API puis l'ouvrir.
export async function downloadAndOpenFile(info) {
  const safeName = info.name.replace(/[\\/:*?"<>|]/g, '_');
  const destination = new File(Paths.cache, safeName);

  // Appel de l'API : GET /download/:id -> le fichier est écrit dans le cache
  const file = await File.downloadFileAsync(api.fileUrl(info.id), destination, {
    idempotent: true, // remplace le fichier s'il existe déjà
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: info.mimeType, dialogTitle: info.name });
  }
}
