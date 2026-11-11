import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';

// Affiche les 3 compteurs : Total / Terminées / À faire
// Props : tasks (la liste des tâches)
export default function Stats({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'terminee').length;
  const todo = total - done;

  return (
    <View style={styles.row}>
      <StatBox label="Total" value={total} color={COLORS.primary} bg="#E7F0FD" />
      <StatBox label="Terminées" value={done} color={COLORS.success} bg="#E6F6EB" />
      <StatBox label="À faire" value={todo} color={COLORS.warning} bg="#FFF4E0" />
    </View>
  );
}

// Une seule case de statistique
function StatBox({ label, value, color, bg }) {
  return (
    <View style={[styles.box, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: color }]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  box: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
});
