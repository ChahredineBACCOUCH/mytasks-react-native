// Écran 1 : Accueil (présentation + statistiques)

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Stats from '../components/Stats';
import { useTasks } from '../context/TasksContext';
import { COLORS } from '../theme';

export default function HomeScreen({ navigation }) {
  const { tasks } = useTasks();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyTasks</Text>
      <Text style={styles.subtitle}>Organisez vos tâches, atteignez vos objectifs !</Text>

      <Stats tasks={tasks} />

      <Pressable
        style={[styles.button, { backgroundColor: COLORS.primary }]}
        onPress={() => navigation.navigate('Tâches')}
      >
        <Text style={styles.buttonText}>Mes tâches</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: COLORS.success }]}
        onPress={() => navigation.navigate('Ajouter')}
      >
        <Text style={styles.buttonText}>Ajouter une tâche</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.grey,
    marginTop: 6,
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
