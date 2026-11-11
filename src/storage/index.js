// Ce fichier choisit la bonne version de stockage selon MODE (voir config.js).
// Les 3 versions ont exactement les mêmes fonctions :
//   getTasks(), addTask(task), updateTask(task), deleteTask(id)
// Donc le reste de l'application n'a pas besoin de savoir laquelle est utilisée !

import { MODE } from '../config';
import * as localStore from './localStore';
import * as apiStore from './apiStore';
import * as syncStore from './syncStore';

let storage;

if (MODE === 'local') {
  storage = localStore; // Version 1
} else if (MODE === 'online') {
  storage = apiStore; // Version 2
} else {
  storage = syncStore; // Version 3
}

export default storage;
