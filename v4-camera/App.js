// Point de départ de l'application.
//  - TasksProvider : partage les tâches avec tous les écrans
//  - AppNavigator  : gère les écrans et la navigation
//  - Watchers      : (version 4) rappels de lieu, nouveaux commentaires,
//                    clic sur une notification

import { StatusBar } from 'expo-status-bar';
import Watchers from './src/components/Watchers';
import { TasksProvider } from './src/context/TasksContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <TasksProvider>
      <AppNavigator />
      <Watchers />
      <StatusBar style="dark" />
    </TasksProvider>
  );
}
