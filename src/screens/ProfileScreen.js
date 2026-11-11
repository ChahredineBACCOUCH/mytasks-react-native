// Écran Profil : affiche la version de stockage utilisée.
// En version 3 (sync), on peut voir les changements en attente et synchroniser.

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { API_URL, MODE } from '../config';
import { useTasks } from '../context/TasksContext';
import { countPending } from '../storage/syncStore';
import { COLORS } from '../theme';

const MODE_NAMES = {
  local: 'Version 1 : Local (AsyncStorage)',
  online: 'Version 2 : En ligne (API)',
  sync: 'Version 3 : Local + synchronisation en ligne',
};

export default function ProfileScreen({ navigation }) {
  const { tasks, loadTasks } = useTasks();
  const [pending, setPending] = useState(0);

  // À chaque fois qu'on ouvre cet écran, on recompte les changements en attente
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshPending);
    return unsubscribe;
  }, [navigation]);

  async function refreshPending() {
    if (MODE === 'sync') {
      setPending(await countPending());
    }
  }

  async function handleSync() {
    await loadTasks(); // en mode sync, loadTasks envoie puis récupère les données
    await refreshPending();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Stockage utilisé</Text>
      <Text style={styles.value}>{MODE_NAMES[MODE]}</Text>

      {MODE !== 'local' && (
        <>
          <Text style={styles.label}>Serveur</Text>
          <Text style={styles.value}>{API_URL}</Text>
        </>
      )}

      <Text style={styles.label}>Nombre de tâches</Text>
      <Text style={styles.value}>{tasks.length}</Text>

      {MODE === 'sync' && (
        <>
          <Text style={styles.label}>Changements pas encore envoyés</Text>
          <Text style={styles.value}>{pending}</Text>

          <Pressable style={styles.button} onPress={handleSync}>
            <Text style={styles.buttonText}>Synchroniser maintenant</Text>
          </Pressable>
        </>
      )}
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
