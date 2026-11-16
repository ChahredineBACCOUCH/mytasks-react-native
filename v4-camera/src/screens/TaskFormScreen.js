// Écran 4 : Formulaire (Partie 3 : ajout ET modification d'une tâche)
//
//  - Ouvert SANS id  -> on AJOUTE une nouvelle tâche
//  - Ouvert AVEC id  -> on MODIFIE la tâche existante
//
//  Version 4 : chaque nouveauté est un composant dans src/components/fields/
//    PhotoField (caméra), FilesField (fichiers), ReminderField (date/heure),
//    PlaceField (lieu OpenStreetMap), ObserversField (observateurs)

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import FilesField from '../components/fields/FilesField';
import ObserversField from '../components/fields/ObserversField';
import PhotoField from '../components/fields/PhotoField';
import PlaceField from '../components/fields/PlaceField';
import ReminderField from '../components/fields/ReminderField';
import { useTasks } from '../context/TasksContext';
import { COLORS, PRIORITIES, STATUSES } from '../theme';

export default function TaskFormScreen({ route, navigation }) {
  const { addTask, updateTask, getTask } = useTasks();

  // Est-ce qu'on modifie une tâche existante ?
  const id = route.params?.id;
  const task = id ? getTask(id) : null;
  const isEdit = task != null;

  // Les champs du formulaire (pré-remplis si on modifie)
  const [title, setTitle] = useState(isEdit ? task.title : '');
  const [description, setDescription] = useState(isEdit ? task.description : '');
  const [priority, setPriority] = useState(isEdit ? task.priority : 'moyenne');
  const [status, setStatus] = useState(isEdit ? task.status : 'a_faire');
  const [error, setError] = useState('');

  // ----- Version 4 -----
  const [image, setImage] = useState(isEdit ? task.image || null : null);
  const [files, setFiles] = useState(isEdit ? task.files || [] : []);
  const [reminder, setReminder] = useState(isEdit ? task.reminder || null : null);
  const [location, setLocation] = useState(isEdit ? task.location || null : null);
  const [observers, setObservers] = useState(isEdit ? task.observers || [] : []);

  // Remet le formulaire à zéro (après un ajout)
  function resetForm() {
    setTitle('');
    setDescription('');
    setPriority('moyenne');
    setImage(null);
    setFiles([]);
    setReminder(null);
    setLocation(null);
    setObservers([]);
  }

  async function handleSave() {
    // Validation : le titre est obligatoire
    if (title.trim() === '') {
      setError('Le titre est obligatoire.');
      return;
    }
    setError('');

    const fields = {
      title: title.trim(),
      description: description.trim(),
      priority,
      image,
      files,
      reminder,
      location,
      observers,
    };

    if (isEdit) {
      // MODIFIER : on garde l'ancienne tâche et on change certains champs
      const ok = await updateTask({ ...task, ...fields, status });
      if (ok) navigation.goBack();
    } else {
      // AJOUTER
      const ok = await addTask(fields);
      if (ok) {
        resetForm(); // on vide le formulaire pour la prochaine fois
        navigation.navigate('Tâches');
      }
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Titre *</Text>
      <TextInput
        style={[styles.input, error !== '' && { borderColor: COLORS.danger }]}
        placeholder="Ex. Préparer la présentation"
        value={title}
        onChangeText={setTitle}
      />
      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Détails de la tâche..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Priorité</Text>
      <Choices options={PRIORITIES} value={priority} onChange={setPriority} />

      {/* Le statut n'apparaît que pour la modification */}
      {isEdit && (
        <>
          <Text style={styles.label}>Statut</Text>
          <Choices options={STATUSES} value={status} onChange={setStatus} />
        </>
      )}

      {/* ----- Version 4 ----- */}
      <Text style={styles.label}>Photo</Text>
      <PhotoField value={image} onChange={setImage} />

      <Text style={styles.label}>Fichiers</Text>
      <FilesField value={files} onChange={setFiles} />

      <Text style={styles.label}>Rappel (date et heure)</Text>
      <ReminderField value={reminder} onChange={setReminder} />

      <Text style={styles.label}>Rappel à un lieu</Text>
      <PlaceField value={location} onChange={setLocation} />

      <Text style={styles.label}>Observateurs</Text>
      <ObserversField value={observers} onChange={setObservers} />

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </Pressable>
    </ScrollView>
  );
}

// Une rangée de boutons pour choisir une option (priorité ou statut)
// Props : options (objet PRIORITIES ou STATUSES), value (choix actuel), onChange
function Choices({ options, value, onChange }) {
  return (
    <View style={styles.choices}>
      {Object.keys(options).map((key) => {
        const option = options[key];
        const selected = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[
              styles.choice,
              { backgroundColor: option.bg },
              selected && { borderColor: option.color, borderWidth: 2 },
            ]}
          >
            <Text style={{ color: option.color, fontWeight: selected ? 'bold' : 'normal' }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  label: {
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 18,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: COLORS.danger,
    marginTop: 4,
  },
  choices: {
    flexDirection: 'row',
    gap: 8,
  },
  choice: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
