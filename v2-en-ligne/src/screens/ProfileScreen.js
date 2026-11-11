// Écran Profil : informations sur la version de l'application.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../config';
import { useTasks } from '../context/TasksContext';
import { COLORS } from '../theme';

export default function ProfileScreen() {
  const { tasks, loadTasks } = useTasks();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Stockage utilisé</Text>
      <Text style={styles.value}>Version 2 : En ligne (API)</Text>

      <Text style={styles.label}>Serveur</Text>
      <Text style={styles.value}>{API_URL}</Text>

      <Text style={styles.label}>Nombre de tâches</Text>
      <Text style={styles.value}>{tasks.length}</Text>

      <Pressable style={styles.button} onPress={loadTasks}>
        <Text style={styles.buttonText}>Recharger depuis le serveur</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  label: {
    color: COLORS.grey,
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
