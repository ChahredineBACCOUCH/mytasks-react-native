// Champ "Observateurs" du formulaire : les personnes qui suivent la tâche.
// Elles reçoivent une notification quand quelqu'un commente la tâche.
// Props : value (liste de noms), onChange(nouvelleListe)

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sameName } from '../../services/user';
import { COLORS } from '../../theme';

export default function ObserversField({ value, onChange }) {
  const [name, setName] = useState('');

  function handleAdd() {
    const clean = name.trim();
    if (clean === '') return;
    if (!value.some((n) => sameName(n, clean))) {
      onChange([...value, clean]); // pas de doublon
    }
    setName('');
  }

  return (
    <View>
      <View style={styles.chips}>
        {value.map((observer) => (
          <View key={observer} style={styles.chip}>
            <Ionicons name="eye-outline" size={14} color={COLORS.primary} />
            <Text style={styles.chipText}>{observer}</Text>
            <Pressable onPress={() => onChange(value.filter((n) => n !== observer))}>
              <Ionicons name="close" size={16} color={COLORS.grey} />
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Nom de l'observateur"
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable style={styles.add} onPress={handleAdd}>
          <Ionicons name="person-add-outline" size={20} color={COLORS.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#E7F0FD',
  },
  chipText: {
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
  },
  add: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
});
