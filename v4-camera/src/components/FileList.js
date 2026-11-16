// Liste des fichiers d'une tâche (écran Détails).
// Toucher un fichier = appeler l'API pour le récupérer, puis l'ouvrir.
// Props : files (liste [{ id, name, mimeType, size }])

import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { downloadAndOpenFile } from '../services/files';
import { formatSize } from '../utils';
import { COLORS } from '../theme';

export default function FileList({ files }) {
  const [loadingId, setLoadingId] = useState(null); // fichier en cours de téléchargement

  async function handleOpen(file) {
    setLoadingId(file.id);
    try {
      await downloadAndOpenFile(file);
    } catch (error) {
      Alert.alert('Fichier', "Impossible de récupérer le fichier.\n" + error.message);
    }
    setLoadingId(null);
  }

  return (
    <View>
      {files.map((file) => (
        <Pressable key={file.id} style={styles.file} onPress={() => handleOpen(file)}>
          <Ionicons name="document-text-outline" size={22} color={COLORS.primary} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{file.name}</Text>
            <Text style={styles.size}>{formatSize(file.size)}</Text>
          </View>
          {loadingId === file.id ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Ionicons name="download-outline" size={22} color={COLORS.primary} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontWeight: '600',
  },
  size: {
    color: COLORS.grey,
    fontSize: 12,
  },
});
