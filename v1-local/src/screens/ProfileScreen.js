// Écran Profil : informations sur la version de l'application.

import { StyleSheet, Text, View } from 'react-native';
import { useTasks } from '../context/TasksContext';
import { COLORS } from '../theme';

export default function ProfileScreen() {
  const { tasks } = useTasks();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Stockage utilisé</Text>
      <Text style={styles.value}>Version 1 : Local (AsyncStorage)</Text>

      <Text style={styles.label}>Nombre de tâches</Text>
      <Text style={styles.value}>{tasks.length}</Text>

      <Text style={styles.info}>
        Les tâches sont enregistrées sur ce téléphone. Elles restent même après
        la fermeture de l'application, mais ne sont pas partagées avec d'autres appareils.
      </Text>
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
  info: {
    color: COLORS.grey,
    marginTop: 30,
    lineHeight: 20,
  },
});
