import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// import { useUser } from '@clerk/clerk-expo';

import { useAppState } from '../context/AppStateContext';
import LoadingScreen from '../screens/LoadingScreen.jsx';

import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import AppStack from './AppStack';

export default function RootNavigator() {
  // const { isLoaded, isSignedIn } = useUser();
  const { appState } = useAppState();

//   if (!isLoaded) {
//     // Wait for Clerk to hydrate
//     return <LoadingScreen />;
//   }

  return (
    <NavigationContainer>
      { 0==1 ? ( // !isSignedIn ? ( -- Temporary disable auth for testing
        <AuthStack />
      ) : !appState?.onboarded ? (
        <OnboardingStack />
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
}

