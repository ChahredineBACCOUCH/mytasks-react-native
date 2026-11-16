// =====================================================================
//  COMMUNIQUER AVEC LA CAMÉRA (expo-camera)
// =====================================================================
//  1. useCameraPermissions() : demande la permission au téléphone.
//  2. <CameraView ref={cameraRef} /> : affiche en direct l'image de la caméra.
//  3. cameraRef.current.takePictureAsync() : on "parle" à la caméra
//     grâce à la ref pour lui demander de prendre la photo.
//  4. facing = 'back' ou 'front' : choisir la caméra arrière ou avant.
//
//  Props : visible, onClose(), onPhoto(photoBase64)

import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { resizeToBase64 } from '../services/photo';
import { COLORS } from '../theme';

export default function CameraModal({ visible, onClose, onPhoto }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null); // pour parler à la caméra
  const [facing, setFacing] = useState('back');
  const [busy, setBusy] = useState(false);

  async function handleCapture() {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      const photo = await resizeToBase64(picture.uri); // photo légère en texte
      onPhoto(photo);
      onClose();
    } catch (error) {
      Alert.alert('Caméra', 'La photo a échoué.\n' + error.message);
    }
    setBusy(false);
  }

  function flipCamera() {
    setFacing(facing === 'back' ? 'front' : 'back');
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {!permission ? (
        <View style={styles.center} /> // permission en cours de lecture
      ) : !permission.granted ? (
        // Pas encore de permission : on explique et on la demande
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={48} color={COLORS.grey} />
          <Text style={styles.message}>MyTasks a besoin de la caméra pour prendre une photo.</Text>
          <Pressable style={styles.allow} onPress={requestPermission}>
            <Text style={styles.allowText}>Autoriser la caméra</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>Annuler</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.container}>
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

          {/* Les boutons sont posés par-dessus l'image de la caméra */}
          <View style={styles.controls}>
            <Pressable style={styles.round} onPress={onClose}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </Pressable>

            <Pressable style={styles.shutter} onPress={handleCapture}>
              {busy && <ActivityIndicator color={COLORS.primary} />}
            </Pressable>

            <Pressable style={styles.round} onPress={flipCamera}>
              <Ionicons name="camera-reverse-outline" size={28} color={COLORS.white} />
            </Pressable>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  round: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.white,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 16,
    backgroundColor: COLORS.background,
  },
  message: {
    textAlign: 'center',
    color: COLORS.text,
  },
  allow: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  allowText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  cancel: {
    color: COLORS.grey,
  },
});
