import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import NavigationBar from '../components/NavigationBar.jsx';

import HomeScreen from '../screens/HomeScreen';
import TodaysTasksScreen from '../screens/TodaysTasksScreen';
import UserProfileStack from './UserProfileStack.jsx';
import SavedSchedulesScreen from '../screens/SavedSchedulesScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import SchedulingCenterScreen from '../screens/SchedulingCenterScreen.jsx';
import GenerateScheduleScreen from '../screens/GenerateScheduleScreen.jsx';
import RescheduleScreen from '../screens/RescheduleScreen.jsx';
import ScheduleViewScreen from '../screens/ScheduleViewScreen.jsx';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NavigationBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TodaysTasksScreen} />
      <Tab.Screen name="Center" component={SchedulingCenterScreen} />
      <Tab.Screen name="Profile" component={UserProfileStack} />
      {/* <Tab.Screen name="Saved" component={SavedSchedulesScreen} />
      <Tab.Screen name="Preferences" component={PreferencesScreen} /> */}
    </Tab.Navigator>
  );
};

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="View" component={ScheduleViewScreen} />
      <Stack.Screen name="Generate" component={GenerateScheduleScreen} />
      <Stack.Screen name="Reschedule" component={RescheduleScreen} />
    </Stack.Navigator>
  );
}

