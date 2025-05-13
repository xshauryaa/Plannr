import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from './src/screens/HomeScreen';
import TodaysTasksScreen from './src/screens/TodaysTasksScreen';

const navigator = createStackNavigator(
  {
    Home: HomeScreen,
    TodaysTasks: TodaysTasksScreen,
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      headerShown: false,
    },
  }
);

export default createAppContainer(navigator);
