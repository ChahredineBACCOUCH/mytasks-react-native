// =====================================================================
//  PHOTO : réduire une photo et la transformer en texte base64
// =====================================================================
//  Une photo de téléphone pèse plusieurs Mo. On la réduit à 400 pixels
//  de large, puis on la transforme en texte : 'data:image/jpeg;base64,...'
//  Ce texte se range dans la tâche (JSON) et <Image> sait l'afficher.

import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export async function resizeToBase64(uri) {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 400 }); // la hauteur est calculée automatiquement
  const image = await context.renderAsync();
  const photo = await image.saveAsync({ compress: 0.5, format: SaveFormat.JPEG, base64: true });
  return 'data:image/jpeg;base64,' + photo.base64;
}
