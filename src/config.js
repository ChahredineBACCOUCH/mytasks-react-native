// =====================================================================
//  CONFIGURATION DE L'APPLICATION
// =====================================================================
//
//  Choisis ici la version de persistance (stockage des données) :
//
//    'local'  -> Version 1 : les tâches sont gardées sur le téléphone (AsyncStorage)
//    'online' -> Version 2 : les tâches sont gardées sur un serveur (API REST)
//    'sync'   -> Version 3 : sur le téléphone + synchronisées avec le serveur
//
//  Change juste cette ligne, puis relance l'application.
export const MODE = 'local';

//  Adresse du serveur API (utilisée par les versions 2 et 3).
//
//  ⚠️ Sur un vrai téléphone, "localhost" ne marche pas !
//  Mets l'adresse IP de ton ordinateur, par exemple : 'http://192.168.1.15:3000'
//  (Sur Windows, tape "ipconfig" dans un terminal pour la trouver.)
export const API_URL = 'http://192.168.1.15:3000';
