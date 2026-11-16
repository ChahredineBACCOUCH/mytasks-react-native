// Champ "Photo" du formulaire : ouvre la caméra (CameraModal).
// Props : value (photo base64 ou null), onChange(nouvellePhoto)

import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import CameraModal from '../CameraModal';
import SmallButton from '../SmallButton';
import { COLORS } from '../../theme';

export default function PhotoField({ value, onChange }) {
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <View>
      {value && <Image source={{ uri: value }} style={styles.photo} />}
      <View style={styles.row}>
        <SmallButton
          icon="camera-outline"
          label={value ? 'Reprendre la photo' : 'Prendre une photo'}
          onPress={() => setCameraOpen(true)}
        />
        {value && (
          <SmallButton icon="trash-outline" label="Retirer" color={COLORS.danger} onPress={() => onChange(null)} />
        )}
      </View>

      <CameraModal visible={cameraOpen} onClose={() => setCameraOpen(false)} onPhoto={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
