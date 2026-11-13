// Écran 4 : Formulaire (Partie 3 : ajout ET modification d'une tâche)
//
//  - Ouvert SANS id  -> on AJOUTE une nouvelle tâche
//  - Ouvert AVEC id  -> on MODIFIE la tâche existante

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { takePhoto } from '../camera';
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
  const [image, setImage] = useState(isEdit ? task.image : null); // photo (ou null)
  const [error, setError] = useState('');

  // Version 4 : ouvrir la caméra et garder la photo dans le state
  async function handleTakePhoto() {
    const photo = await takePhoto();
    if (photo) setImage(photo);
  }

  async function handleSave() {
    // Validation : le titre est obligatoire
    if (title.trim() === '') {
      setError('Le titre est obligatoire.');
      return;
    }
    setError('');

    if (isEdit) {
      // MODIFIER : on garde l'ancienne tâche et on change certains champs
      const ok = await updateTask({
        ...task,
        title: title.trim(),
        description: description.trim(),
        priority: priority,
        status: status,
        image: image,
      });
      if (ok) navigation.goBack();
    } else {
      // AJOUTER
      const ok = await addTask(title.trim(), description.trim(), priority, image);
      if (ok) {
        // on vide le formulaire pour la prochaine fois
        setTitle('');
        setDescription('');
        setPriority('moyenne');
        setImage(null);
        navigation.navigate('Tâches');
      }
    }
  }

  return (
    <ScrollView style={styles.container}>
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

      {/* Version 4 : photo prise avec la caméra */}
      <Text style={styles.label}>Photo</Text>
      {image && <Image source={{ uri: image }} style={styles.photo} />}
      <View style={styles.photoButtons}>
        <Pressable style={styles.photoButton} onPress={handleTakePhoto}>
          <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
          <Text style={styles.photoButtonText}>
            {image ? 'Reprendre la photo' : 'Prendre une photo'}
          </Text>
        </Pressable>
        {image && (
          <Pressable style={styles.photoButton} onPress={() => setImage(null)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.photoButtonText, { color: COLORS.danger }]}>Retirer</Text>
          </Pressable>
        )}
      </View>

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
    marginTop: 14,
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
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  photoButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
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
