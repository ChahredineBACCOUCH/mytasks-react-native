// Écran 2 : Liste des tâches (recherche + filtres + FlatList)

import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Stats from '../components/Stats';
import TaskCard from '../components/TaskCard';
import { useTasks } from '../context/TasksContext';
import { COLORS } from '../theme';

// Les 3 filtres possibles
const FILTERS = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'a_faire', label: 'À faire' },
  { key: 'terminee', label: 'Terminées' },
];

export default function TaskListScreen({ navigation }) {
  const { tasks, loading, loadTasks } = useTasks();
  const [search, setSearch] = useState(''); // texte de recherche
  const [filter, setFilter] = useState('toutes'); // filtre choisi

  // 1. On garde les tâches qui correspondent au filtre
  // 2. puis celles dont le titre contient le texte recherché
  const visibleTasks = tasks
    .filter((t) => filter === 'toutes' || t.status === filter)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  // Pendant le chargement (Partie 5) : un indicateur qui tourne
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de vos tâches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stats tasks={tasks} />

      {/* Barre de recherche */}
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={COLORS.grey} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une tâche..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Boutons de filtre */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filter, filter === f.key && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* La liste */}
      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('Details', { id: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune tâche</Text>}
        refreshing={loading}
        onRefresh={loadTasks} // tirer la liste vers le bas pour recharger
      />

      {/* Bouton rond "+" */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate('Ajouter')}>
        <Ionicons name="add" size={30} color={COLORS.white} />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.grey,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filter: {
    flex: 1,
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: COLORS.grey,
    marginTop: 30,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
