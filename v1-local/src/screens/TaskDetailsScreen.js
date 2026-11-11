// Écran 3 : Détails d'une tâche (infos + modifier + supprimer)

import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import { useTasks } from '../context/TasksContext';
import { COLORS, PRIORITIES, STATUSES } from '../theme';

export default function TaskDetailsScreen({ route, navigation }) {
  const { id } = route.params; // l'id envoyé par l'écran Liste
  const { getTask, deleteTask } = useTasks();
  const task = getTask(id);

  // La tâche vient d'être supprimée : rien à afficher
  if (!task) {
    return null;
  }

  const priority = PRIORITIES[task.priority];
  const status = STATUSES[task.status];
  const date = new Date(task.createdAt).toLocaleDateString('fr-FR');

  // Demander confirmation avant de supprimer
  function confirmDelete() {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer cette tâche ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteTask(task.id);
          if (ok) navigation.goBack();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderLeftColor: priority.color }]}>
        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.row}>
          <Badge label={priority.label} color={priority.color} bg={priority.bg} />
          <Badge label={status.label} color={status.color} bg={status.bg} />
        </View>

        <Text style={styles.description}>
          {task.description ? task.description : 'Pas de description.'}
        </Text>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.grey} />
          <Text style={styles.date}>Créée le {date}</Text>
        </View>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: COLORS.primary }]}
        onPress={() => navigation.navigate('Modifier', { id: task.id })}
      >
        <Text style={styles.buttonText}>Modifier</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: COLORS.danger }]}
        onPress={confirmDelete}
      >
        <Text style={styles.buttonText}>Supprimer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderLeftWidth: 5,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  description: {
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    color: COLORS.grey,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
