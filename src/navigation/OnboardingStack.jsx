import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import OnboardingScreen from '../screens/OnboardingScreen.jsx';
import WalkthroughScreen from '../screens/WalkthroughScreen.jsx';

const Stack = createStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />
    </Stack.Navigator>
  );
}

