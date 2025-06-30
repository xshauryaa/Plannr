import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NavigationBar from './src/components/NavigationBar.jsx';
import { AppStateProvider } from './src/context/AppStateContext.js';
// import TaskCompletionChecker from './src/notifications/TaskCompletionChecker.js';
import { initializeNotificationService, scheduleNotification } from './src/notifications/NotificationService.js';

import HomeScreen from './src/screens/HomeScreen';
import TodaysTasksScreen from './src/screens/TodaysTasksScreen';
import SavedSchedulesScreen from './src/screens/SavedSchedulesScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';
import SchedulingCenterScreen from './src/screens/SchedulingCenterScreen.jsx';
import GenerateScheduleScreen from './src/screens/GenerateScheduleScreen.jsx';
import RescheduleScreen from './src/screens/RescheduleScreen.jsx';
import ScheduleViewScreen from './src/screens/ScheduleViewScreen.jsx';

const AppStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <NavigationBar {...props} />}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Tasks" component={TodaysTasksScreen} />
            <Tab.Screen name="Center" component={SchedulingCenterScreen}/>
            <Tab.Screen name="Saved" component={SavedSchedulesScreen} />
            <Tab.Screen name="Preferences" component={PreferencesScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    // Initialize notification service
    initializeNotificationService().then((status) => {
        if (status) {
            console.log('Notification service initialized successfully');
        } else {
            console.warn('Notification service initialization failed');
        }
    });
    return (
        <AppStateProvider>
            {/* <TaskCompletionChecker /> */}
            <SafeAreaProvider>
                <NavigationContainer>
                    <AppStack.Navigator screenOptions={{ headerShown: false }}>
                        <AppStack.Screen name="MainTabs" component={MainTabs} />
                        <AppStack.Screen name="View" component={ScheduleViewScreen} />
                        <AppStack.Screen name="Generate" component={GenerateScheduleScreen} />
                        <AppStack.Screen name="Reschedule" component={RescheduleScreen} />
                    </AppStack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </AppStateProvider>
    );
  }
  