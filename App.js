import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { AppStateProvider } from './src/context/AppStateContext.js';

import HomeScreen from './src/screens/HomeScreen';
import TodaysTasksScreen from './src/screens/TodaysTasksScreen';
import SavedSchedulesAndPreferencesScreen from './src/screens/SavedSchedulesAndPreferencesScreen';

const navigator = createStackNavigator(
  {
    Home: HomeScreen,
    TodaysTasks: TodaysTasksScreen,
    SavedAndPreferences: SavedSchedulesAndPreferencesScreen,
  },
  {
    initialRouteName: 'SavedAndPreferences',
    defaultNavigationOptions: {
      headerShown: false,
    },
  }
);

const AppContainer = createAppContainer(navigator);

export default function App() {
    return (
        <AppStateProvider>
            <AppContainer />
        </AppStateProvider>
    );
}
