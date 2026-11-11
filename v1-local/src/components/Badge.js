import { StyleSheet, Text, View } from 'react-native';

// Petite étiquette colorée (ex : "Élevée", "À faire")
// Props : label, color (couleur du texte), bg (couleur du fond)
export default function Badge({ label, color, bg }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
