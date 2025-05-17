import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AppStateProvider } from './src/context/AppStateContext.js';

import HomeScreen from './src/screens/HomeScreen';
import TodaysTasksScreen from './src/screens/TodaysTasksScreen';
import SavedSchedulesScreen from './src/screens/SavedSchedulesScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
      <AppStateProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                height: 70,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: 10,
                paddingTop: 10,
                backgroundColor: '#000',
              },
            }}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Tasks" component={TodaysTasksScreen} />
            <Tab.Screen name="Saved" component={SavedSchedulesScreen} />
            <Tab.Screen name="Prefs" component={PreferencesScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    );
  }
  