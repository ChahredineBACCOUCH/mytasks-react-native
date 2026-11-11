// =====================================================================
//  NAVIGATION (Partie 4)
// =====================================================================
//  - En bas : 4 onglets (Accueil, Tâches, Ajouter, Profil)
//  - Par-dessus les onglets : les écrans "Details" et "Modifier"

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Icône de chaque onglet
const ICONS = {
  Accueil: 'home',
  Tâches: 'list',
  Ajouter: 'add-circle-outline',
  Profil: 'person-outline',
};

// Les onglets du bas
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.primary,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Tâches" component={TaskListScreen} options={{ title: 'Mes tâches' }} />
      <Tab.Screen name="Ajouter" component={TaskFormScreen} options={{ title: 'Ajouter une tâche' }} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Onglets" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={TaskDetailsScreen} options={{ title: "Détails d'une tâche" }} />
        <Stack.Screen name="Modifier" component={TaskFormScreen} options={{ title: 'Modifier la tâche' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
