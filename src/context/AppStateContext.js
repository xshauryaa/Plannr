import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import initialAppState from './initialAppState';

export const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
    
    const [appState, setAppState] = useState(initialAppState)
    const [storageLoaded, setStorageLoaded] = useState(false);

    useEffect(() => {
        const loadAppState = async () => {
            try {
                const raw = await AsyncStorage.getItem('appState');
                if (raw) {
                    setAppState(JSON.parse(raw));
                }
            } catch (e) {
                console.error('Failed to load app state from storage', e);
            } finally {
                setStorageLoaded(true);
            }
        };

        loadAppState();
    }, []);

    useEffect(() => {
        if (storageLoaded) {
            AsyncStorage.setItem('appState', JSON.stringify(appState));
        }
    }, [appState]);

    return (
        <AppStateContext.Provider value={{ appState, setAppState }}>
          {children}
        </AppStateContext.Provider>
      )
}
