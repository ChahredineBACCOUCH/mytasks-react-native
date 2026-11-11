// Point de départ de l'application.
//  - TasksProvider : partage les tâches avec tous les écrans
//  - AppNavigator  : gère les écrans et la navigation

import { StatusBar } from 'expo-status-bar';
import { TasksProvider } from './src/context/TasksContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <TasksProvider>
      <AppNavigator />
      <StatusBar style="dark" />
    </TasksProvider>
  );
}
