import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';

import { useAppState } from '../context/AppStateContext';
import LoadingScreen from '../screens/LoadingScreen.jsx';

import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import AppStack from './AppStack';

export default function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const { appState, storageLoaded } = useAppState();

  if (!isLoaded || !storageLoaded) {
    // Wait for Clerk to hydrate and storage to load
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      { !isSignedIn ? (
        <AuthStack />
      ) : !appState?.onboarded ? (
        <OnboardingStack />
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
}

