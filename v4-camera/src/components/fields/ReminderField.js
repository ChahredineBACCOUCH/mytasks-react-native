// Champ "Rappel" du formulaire : choisir une date et une heure.
// Props : value (date ISO ou null), onChange(nouvelleDate ou null)
//
//  - Android : deux fenêtres l'une après l'autre (date, puis heure)
//    avec DateTimePickerAndroid.open().
//  - iOS : un sélecteur "date + heure" affiché sous le bouton.
//  La notification est programmée à l'enregistrement de la tâche
//  (voir src/services/notifications.js).

import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import SmallButton from '../SmallButton';
import { formatDateTime } from '../../utils';
import { COLORS } from '../../theme';

// Valeur proposée par défaut : dans une heure, minutes à 0
function inOneHour() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
}

export default function ReminderField({ value, onChange }) {
  const [iosOpen, setIosOpen] = useState(false);
  const current = value ? new Date(value) : inOneHour();

  function openPicker() {
    if (Platform.OS === 'ios') {
      setIosOpen(true);
      if (!value) onChange(current.toISOString());
      return;
    }

    // Android : d'abord la date...
    DateTimePickerAndroid.open({
      value: current,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, date) => {
        if (event.type !== 'set' || !date) return;
        // ... puis l'heure
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          is24Hour: true,
          onChange: (event2, time) => {
            if (event2.type !== 'set' || !time) return;
            const chosen = new Date(date);
            chosen.setHours(time.getHours(), time.getMinutes(), 0, 0);
            onChange(chosen.toISOString());
          },
        });
      },
    });
  }

  const isPast = value && new Date(value) <= new Date();

  return (
    <View>
      {value && (
        <Text style={[styles.value, isPast && { color: COLORS.danger }]}>
          ⏰ {formatDateTime(value)} {isPast ? '(date passée)' : ''}
        </Text>
      )}

      {iosOpen && (
        <DateTimePicker
          value={current}
          mode="datetime"
          display="inline"
          minimumDate={new Date()}
          onChange={(event, date) => date && onChange(date.toISOString())}
        />
      )}

      <View style={styles.row}>
        <SmallButton
          icon="alarm-outline"
          label={iosOpen ? 'OK' : value ? 'Changer le rappel' : 'Ajouter un rappel'}
          onPress={iosOpen ? () => setIosOpen(false) : openPicker}
        />
        {value && (
          <SmallButton
            icon="trash-outline"
            label="Retirer"
            color={COLORS.danger}
            onPress={() => {
              setIosOpen(false);
              onChange(null);
            }}
          />
        )}
      </View>
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
