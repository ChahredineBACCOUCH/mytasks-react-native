// =====================================================================
//  CHOISIR UN LIEU SUR OPENSTREETMAP
// =====================================================================
//  - La carte démarre sur le lieu déjà choisi, sinon sur ma position GPS.
//  - On peut toucher la carte OU chercher une adresse (API Nominatim).
//  - "Valider" renvoie { latitude, longitude, label, radius }.
//
//  Props : visible, initial (lieu déjà choisi ou null), onClose(), onPick(lieu)

import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import OsmMap from './OsmMap';
import { placeName, searchPlaces } from '../services/osm';
import { COLORS } from '../theme';

const PARIS = { latitude: 48.8566, longitude: 2.3522 }; // si pas de GPS
const RADIUS = 200; // on rappelle la tâche à moins de 200 m du lieu

export default function MapPickerModal({ visible, initial, onClose, onPick }) {
  const [point, setPoint] = useState(null); // { latitude, longitude, label }
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const webviewRef = useRef(null);

  // À l'ouverture : point de départ = lieu déjà choisi, sinon ma position
  useEffect(() => {
    if (!visible) return;
    setQuery('');
    setResults([]);
    if (initial) {
      setPoint(initial);
    } else {
      setPoint(null);
      startFromMyPosition();
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  async function startFromMyPosition() {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) throw new Error('permission refusée');
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      choose(position.coords.latitude, position.coords.longitude, null, false);
    } catch {
      choose(PARIS.latitude, PARIS.longitude, null, false);
    }
  }

  // Choisir un point (et chercher son nom si on ne le connaît pas)
  async function choose(latitude, longitude, label, moveMap) {
    setPoint({ latitude, longitude, label: label || 'Recherche du nom...' });
    if (moveMap) {
      webviewRef.current?.injectJavaScript(`setMarker(${latitude}, ${longitude}); true;`);
    }
    if (!label) {
      const name = await placeName(latitude, longitude).catch(() => null);
      setPoint({ latitude, longitude, label: name || latitude.toFixed(5) + ', ' + longitude.toFixed(5) });
    }
  }

  async function handleSearch() {
    if (query.trim() === '') return;
    Keyboard.dismiss();
    setSearching(true);
    try {
      setResults(await searchPlaces(query));
    } catch {
      setResults([]);
    }
    setSearching(false);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Barre du haut : fermer + recherche */}
        <View style={styles.searchRow}>
          <Pressable onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher une adresse..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Pressable onPress={handleSearch} style={styles.iconButton}>
            {searching ? <ActivityIndicator /> : <Ionicons name="search" size={22} color={COLORS.primary} />}
          </Pressable>
        </View>

        {/* Résultats de la recherche */}
        {results.length > 0 && (
          <FlatList
            style={styles.results}
            data={results}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.result}
                onPress={() => {
                  setResults([]);
                  choose(item.latitude, item.longitude, item.label, true);
                }}
              >
                <Text numberOfLines={2}>{item.label}</Text>
              </Pressable>
            )}
          />
        )}

        {/* La carte (affichée quand on connaît le point de départ) */}
        {point ? (
          <OsmMap
            webviewRef={webviewRef}
            style={styles.map}
            latitude={point.latitude}
            longitude={point.longitude}
            radius={RADIUS}
            interactive
            onPress={(c) => choose(c.latitude, c.longitude, null, false)}
          />
        ) : (
          <View style={[styles.map, styles.center]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.hint}>Recherche de ta position...</Text>
          </View>
        )}

        {/* Bas : nom du lieu + valider */}
        <View style={styles.footer}>
          <Text style={styles.hint}>Touche la carte pour placer le rappel (zone de {RADIUS} m).</Text>
          {point && <Text style={styles.label} numberOfLines={2}>{point.label}</Text>}
          <Pressable
            style={[styles.validate, !point && { opacity: 0.5 }]}
            disabled={!point}
            onPress={() => {
              onPick({ ...point, radius: RADIUS });
              onClose();
            }}
          >
            <Text style={styles.validateText}>Valider ce lieu</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingTop: 40,
    gap: 6,
    backgroundColor: COLORS.white,
  },
  iconButton: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 8,
  },
  results: {
    maxHeight: 220,
    backgroundColor: COLORS.white,
  },
  result: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  map: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    gap: 8,
    backgroundColor: COLORS.white,
  },
  hint: {
    color: COLORS.grey,
    fontSize: 13,
  },
  label: {
    color: COLORS.text,
    fontWeight: '600',
  },
  validate: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  validateText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
