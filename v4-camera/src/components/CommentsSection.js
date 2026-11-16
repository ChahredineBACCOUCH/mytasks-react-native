// =====================================================================
//  COMMENTAIRES D'UNE TÂCHE (écran Détails)
// =====================================================================
//  Les commentaires sont sur le serveur : GET /comments?task=ID
//  et POST /comments. Les observateurs de la tâche reçoivent une
//  notification quand un nouveau commentaire arrive (voir Watchers.js).
//
//  Props : taskId

import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../storage/apiStore';
import { getUserName } from '../services/user';
import { formatDateTime } from '../utils';
import { COLORS } from '../theme';

export default function CommentsSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadComments();
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadComments() {
    setLoading(true);
    try {
      setComments(await api.getComments(taskId));
      setOffline(false);
    } catch {
      setOffline(true); // serveur injoignable
    }
    setLoading(false);
  }

  async function handleSend() {
    if (text.trim() === '') return;

    const author = await getUserName();
    if (author === '') {
      Alert.alert('Ton nom', "Écris d'abord ton nom dans l'onglet Profil pour signer tes commentaires.");
      return;
    }

    const comment = {
      id: Date.now().toString(),
      task: taskId, // la tâche commentée
      author: author,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setSending(true);
    try {
      await api.addComment(comment);
      setComments([...comments, comment]);
      setText('');
    } catch (error) {
      Alert.alert('Commentaire', "Le commentaire n'a pas été envoyé.\n" + error.message);
    }
    setSending(false);
  }

  return (
    <View>
      {loading && <ActivityIndicator color={COLORS.primary} />}
      {offline && <Text style={styles.hint}>Serveur injoignable : commentaires indisponibles.</Text>}
      {!loading && !offline && comments.length === 0 && (
        <Text style={styles.hint}>Pas encore de commentaire.</Text>
      )}

      {comments.map((c) => (
        <View key={c.id} style={styles.comment}>
          <Text style={styles.author}>
            {c.author} <Text style={styles.date}>· {formatDateTime(c.createdAt)}</Text>
          </Text>
          <Text style={styles.text}>{c.text}</Text>
        </View>
      ))}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un commentaire..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <Pressable style={styles.send} onPress={handleSend} disabled={sending}>
          {sending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Ionicons name="send" size={18} color={COLORS.white} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: COLORS.grey,
    marginBottom: 8,
  },
  comment: {
    padding: 10,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  author: {
    fontWeight: '600',
    color: COLORS.text,
  },
  date: {
    fontWeight: 'normal',
    color: COLORS.grey,
    fontSize: 12,
  },
  text: {
    color: COLORS.text,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
  },
  send: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
