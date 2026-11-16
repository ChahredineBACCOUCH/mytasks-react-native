// Champ "Fichiers" du formulaire : ajouter un fichier (envoyé au serveur).
// Props : value (liste [{ id, name, mimeType, size }]), onChange(nouvelleListe)

import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmallButton from '../SmallButton';
import { pickAndUploadFile } from '../../services/files';
import { formatSize } from '../../utils';
import { COLORS } from '../../theme';

export default function FilesField({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  async function handleAdd() {
    setUploading(true);
    try {
      const file = await pickAndUploadFile();
      if (file) onChange([...value, file]); // nouvelle liste = ancienne + fichier
    } catch (error) {
      Alert.alert('Fichier', "Le fichier n'a pas été envoyé.\n" + error.message);
    }
    setUploading(false);
  }

  return (
    <View>
      {value.map((file) => (
        <View key={file.id} style={styles.file}>
          <Ionicons name="document-attach-outline" size={20} color={COLORS.primary} />
          <Text style={styles.name} numberOfLines={1}>{file.name}</Text>
          <Text style={styles.size}>{formatSize(file.size)}</Text>
          <Pressable onPress={() => onChange(value.filter((f) => f.id !== file.id))}>
            <Ionicons name="close-circle" size={20} color={COLORS.grey} />
          </Pressable>
        </View>
      ))}

      <View style={styles.row}>
        <SmallButton
          icon="attach-outline"
          label={uploading ? 'Envoi en cours...' : 'Ajouter un fichier'}
          loading={uploading}
          onPress={handleAdd}
        />
      </View>
      <Text style={styles.hint}>5 Mo maximum. Il faut être connecté au serveur.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: {
    flex: 1,
    color: COLORS.text,
  },
  size: {
    color: COLORS.grey,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
  },
  hint: {
    color: COLORS.grey,
    fontSize: 12,
    marginTop: 4,
  },
});
