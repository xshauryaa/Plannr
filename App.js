import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from './src/context/AppStateContext.js';
import TaskCompletionChecker from './src/notifications/TaskCompletionChecker.js';
import NotificationService from './src/notifications/NotificationService.js';
import 'react-native-gesture-handler';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';

import RootNavigator from './src/navigation/RootNavigator.jsx';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

const DismissKeyboardWrapper = ({ children }) => (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={{ flex: 1 }}>{children}</View>
  </TouchableWithoutFeedback>
);

export default function App() {
    NotificationService.requestPermissions();

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
                <View style={{ flex: 1 }}>
                    <AppStateProvider>
                        <TaskCompletionChecker />
                        <SafeAreaProvider>
                            <RootNavigator />
                        </SafeAreaProvider>
                    </AppStateProvider>
                </View>
            </ClerkProvider>
        </TouchableWithoutFeedback>
    );
}
  
