// Champ "Lieu" du formulaire : choisir un lieu sur OpenStreetMap.
// Props : value ({ latitude, longitude, label, radius } ou null), onChange(lieu ou null)
//
// Quand on arrive près de ce lieu, une notification rappelle la tâche
// (voir src/components/Watchers.js).

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapPickerModal from '../MapPickerModal';
import SmallButton from '../SmallButton';
import { COLORS } from '../../theme';

export default function PlaceField({ value, onChange }) {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <View>
      {value && (
        <Text style={styles.value} numberOfLines={2}>
          📍 {value.label} (à moins de {value.radius} m)
        </Text>
      )}

      <View style={styles.row}>
        <SmallButton
          icon="location-outline"
          label={value ? 'Changer le lieu' : 'Choisir un lieu'}
          onPress={() => setMapOpen(true)}
        />
        {value && (
          <SmallButton icon="trash-outline" label="Retirer" color={COLORS.danger} onPress={() => onChange(null)} />
        )}
      </View>

      <MapPickerModal
        visible={mapOpen}
        initial={value}
        onClose={() => setMapOpen(false)}
        onPick={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
