// Écran 3 : Détails d'une tâche (infos + modifier + supprimer)
//
// Version 4 : photo, rappel, lieu sur la carte, fichiers à télécharger,
// observateurs (bouton "Suivre") et commentaires.

import { useEffect, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import CommentsSection from '../components/CommentsSection';
import FileList from '../components/FileList';
import OsmMap from '../components/OsmMap';
import { useTasks } from '../context/TasksContext';
import { osmLink } from '../services/osm';
import { getUserName, sameName } from '../services/user';
import { COLORS, PRIORITIES, STATUSES } from '../theme';
import { formatDateTime } from '../utils';

export default function TaskDetailsScreen({ route, navigation }) {
  const { id } = route.params; // l'id envoyé par l'écran Liste
  const { getTask, deleteTask, updateTask } = useTasks();
  const task = getTask(id);
  const [me, setMe] = useState(''); // mon nom (écran Profil)

  // Les hooks doivent être appelés AVANT le "return null" ci-dessous
  useEffect(() => {
    getUserName().then(setMe);
  }, []);

  // La tâche vient d'être supprimée : rien à afficher
  if (!task) {
    return null;
  }

  const priority = PRIORITIES[task.priority];
  const status = STATUSES[task.status];
  const date = new Date(task.createdAt).toLocaleDateString('fr-FR');
  const observers = task.observers || [];
  const files = task.files || [];
  const iFollow = me !== '' && observers.some((n) => sameName(n, me));

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

  // Version 4 : devenir (ou ne plus être) observateur de la tâche
  async function toggleFollow() {
    if (me === '') {
      Alert.alert('Ton nom', "Écris d'abord ton nom dans l'onglet Profil.");
      return;
    }
    const newObservers = iFollow ? observers.filter((n) => !sameName(n, me)) : [...observers, me];
    await updateTask({ ...task, observers: newObservers });
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={[styles.card, { borderLeftColor: priority.color }]}>
        {/* Version 4 : la photo de la tâche, s'il y en a une */}
        {task.image && <Image source={{ uri: task.image }} style={styles.photo} />}

        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.row}>
          <Badge label={priority.label} color={priority.color} bg={priority.bg} />
          <Badge label={status.label} color={status.color} bg={status.bg} />
        </View>

        <Text style={styles.description}>
          {task.description ? task.description : 'Pas de description.'}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.grey} />
          <Text style={styles.info}>Créée le {date}</Text>
        </View>

        {/* Version 4 : rappel à une date et une heure */}
        {task.reminder && (
          <View style={styles.infoRow}>
            <Ionicons name="alarm-outline" size={18} color={COLORS.primary} />
            <Text style={styles.info}>Rappel le {formatDateTime(task.reminder)}</Text>
          </View>
        )}
      </View>

      {/* Version 4 : rappel à un lieu (carte OpenStreetMap) */}
      {task.location && (
        <Section icon="location-outline" title="Lieu du rappel">
          {/* pointerEvents="none" : la carte ne bloque pas le défilement */}
          <View pointerEvents="none" style={styles.mapBox}>
            <OsmMap
              key={task.location.latitude + ',' + task.location.longitude}
              style={styles.map}
              latitude={task.location.latitude}
              longitude={task.location.longitude}
              radius={task.location.radius}
            />
          </View>
          <Text style={styles.info}>{task.location.label}</Text>
          <Pressable onPress={() => Linking.openURL(osmLink(task.location.latitude, task.location.longitude))}>
            <Text style={styles.link}>Ouvrir dans OpenStreetMap</Text>
          </Pressable>
        </Section>
      )}

      {/* Version 4 : fichiers (toucher = récupérer depuis l'API) */}
      {files.length > 0 && (
        <Section icon="attach-outline" title={'Fichiers (' + files.length + ')'}>
          <FileList files={files} />
        </Section>
      )}

      {/* Version 4 : observateurs */}
      <Section icon="eye-outline" title="Observateurs">
        <Text style={styles.info}>
          {observers.length > 0 ? observers.join(', ') : 'Personne ne suit cette tâche.'}
        </Text>
        <Pressable style={styles.follow} onPress={toggleFollow}>
          <Ionicons name={iFollow ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.primary} />
          <Text style={styles.followText}>{iFollow ? 'Ne plus suivre' : 'Suivre cette tâche'}</Text>
        </Pressable>
      </Section>

      {/* Version 4 : commentaires */}
      <Section icon="chatbubbles-outline" title="Commentaires">
        <CommentsSection taskId={task.id} />
      </Section>

      <Pressable
        style={[styles.button, { backgroundColor: COLORS.primary }]}
        onPress={() => navigation.navigate('Modifier', { id: task.id })}
      >
        <Text style={styles.buttonText}>Modifier</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: COLORS.danger, marginBottom: 40 }]}
        onPress={confirmDelete}
      >
        <Text style={styles.buttonText}>Supprimer</Text>
      </Pressable>
    </ScrollView>
  );
}

// Un bloc blanc avec un titre et une icône
function Section({ icon, title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={COLORS.text} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
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
    marginBottom: 14,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 14,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  info: {
    color: COLORS.grey,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 16,
  },
  mapBox: {
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    flex: 1,
  },
  link: {
    color: COLORS.primary,
    marginTop: 6,
    fontWeight: '600',
  },
  follow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  followText: {
    color: COLORS.primary,
    fontWeight: '600',
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
