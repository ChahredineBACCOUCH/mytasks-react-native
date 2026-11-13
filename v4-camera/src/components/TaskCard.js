import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import { COLORS, PRIORITIES, STATUSES } from '../theme';

// Carte qui affiche une tâche (Partie 1 : composant + props + styles)
// Props :
//   - task    : l'objet tâche à afficher
//   - onPress : fonction appelée quand on touche la carte
export default function TaskCard({ task, onPress }) {
  const priority = PRIORITIES[task.priority];
  const status = STATUSES[task.status];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { borderLeftColor: priority.color }]}
    >
      {/* Version 4 : petite photo à gauche, s'il y en a une */}
      {task.image && <Image source={{ uri: task.image }} style={styles.thumb} />}

      <View style={styles.content}>
        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.row}>
          <Badge label={priority.label} color={priority.color} bg={priority.bg} />
          <Badge label={status.label} color={status.color} bg={status.bg} />
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderLeftWidth: 5,
    padding: 14,
    marginBottom: 10,
    // Ombre (iOS + Android)
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 10,
  },
});
