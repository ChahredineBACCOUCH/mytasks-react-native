// Écran Profil : mon nom + changements en attente + bouton pour synchroniser.

import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_URL } from '../config';
import { useTasks } from '../context/TasksContext';
import { notifyNow } from '../services/notifications';
import { getUserName, setUserName } from '../services/user';
import { countPending } from '../storage/syncStore';
import { COLORS } from '../theme';

export default function ProfileScreen({ navigation }) {
  const { tasks, loadTasks } = useTasks();
  const [pending, setPending] = useState(0); // changements pas encore envoyés
  const [name, setName] = useState(''); // Version 4 : mon nom

  // À chaque fois qu'on ouvre cet écran, on recompte les changements en attente
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshPending);
    return unsubscribe;
  }, [navigation]);

  // Au premier affichage : on relit mon nom
  useEffect(() => {
    getUserName().then(setName);
  }, []);

  async function refreshPending() {
    setPending(await countPending());
  }

  async function handleSync() {
    await loadTasks(); // loadTasks envoie les changements puis récupère la liste
    await refreshPending();
  }

  async function handleSaveName() {
    await setUserName(name);
    Alert.alert('Profil', 'Nom enregistré : ' + name.trim());
  }

  return (
    <ScrollView style={styles.container}>
      {/* Version 4 : mon nom (signe les commentaires, sert pour "observateur") */}
      <Text style={styles.label}>Mon nom</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Ex. Sara"
          value={name}
          onChangeText={setName}
        />
        <Pressable style={styles.smallButton} onPress={handleSaveName}>
          <Text style={styles.buttonText}>OK</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Stockage utilisé</Text>
      <Text style={styles.value}>Version 4 : Local + sync + caméra, fichiers, rappels, commentaires</Text>

      <Text style={styles.label}>Serveur</Text>
      <Text style={styles.value}>{API_URL}</Text>

      <Text style={styles.label}>Nombre de tâches</Text>
      <Text style={styles.value}>{tasks.length}</Text>

      <Text style={styles.label}>Changements pas encore envoyés</Text>
      <Text style={styles.value}>{pending}</Text>

      <Pressable style={styles.button} onPress={handleSync}>
        <Text style={styles.buttonText}>Synchroniser maintenant</Text>
      </Pressable>

      {/* Version 4 : vérifier que les notifications marchent */}
      <Pressable
        style={[styles.button, styles.outline]}
        onPress={() => notifyNow('🔔 Test', 'Les notifications de MyTasks marchent !')}
      >
        <Text style={[styles.buttonText, { color: COLORS.primary }]}>Tester une notification</Text>
      </Pressable>
    </ScrollView>
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
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
  },
  smallButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  outline: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 12,
    marginBottom: 40,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
