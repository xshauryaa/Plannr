import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AppStateProvider } from './src/context/AppStateContext.js';
import TaskCompletionChecker from './src/notifications/TaskCompletionChecker.js';

import HomeScreen from './src/screens/HomeScreen';
import TodaysTasksScreen from './src/screens/TodaysTasksScreen';
import SavedSchedulesScreen from './src/screens/SavedSchedulesScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';
import GenerateScheduleScreen from './src/screens/GenerateScheduleScreen.jsx';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
      <AppStateProvider>
        <TaskCompletionChecker />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{ headerShown: false }}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Tasks" component={TodaysTasksScreen} />
            <Tab.Screen name="Generate" component={GenerateScheduleScreen}/>
            <Tab.Screen name="Saved" component={SavedSchedulesScreen} />
            <Tab.Screen name="Preferences" component={PreferencesScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    );
  }
  