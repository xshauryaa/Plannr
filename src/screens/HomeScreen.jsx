import React, { useEffect } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import * as Font from 'expo-font';

import LoadingScreen from './LoadingScreen.jsx';
import UpcomingTasks from '../components/UpcomingTasks.jsx';
import Progress from '../components/Progress.jsx';
import MenuButton from '../components/MenuButton.jsx';

import { useAppState } from '../context/AppStateContext.js'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import useCurrentTime from '../utils/useCurrentTime.js'

import { lightColor, darkColor } from '../design/colors.js'


const HomeScreen = ({ navigation }) => {
    const { appState, storageLoaded } = useAppState();
    const currentTime = useCurrentTime();

    if (!storageLoaded) { return (<LoadingScreen/>) }

    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    useEffect(() => {
        const timer = setInterval(() => {
            theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
        }, 1000);
    
        return () => clearInterval(timer);
    }, []);
    
    const [fontsLoaded] = Font.useFonts({
        'PinkSunset': require('../../assets/fonts/PinkSunset-Regular.ttf'),
        'AlbertSans': require('../../assets/fonts/AlbertSans-VariableFont_wght.ttf'),
      });
    
    if (!fontsLoaded) return null;

    const todaysDate = convertDateToScheduleDate(currentTime);
    
    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Hello {appState.name}</Text>
            <View style={{ ...styles.subContainer, backgroundColor: theme.BACKGROUND}}>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Here's your day for {todaysDate.getDateString()}</Text>
                <UpcomingTasks onClick={() => { navigation.navigate("Tasks") }}/>
                <Progress/>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>For Your Existing Schedule</Text>
                <View style={{ ...styles.horizontalGrid, backgroundColor: theme.BACKGROUND }}>
                    <MenuButton
                        broad={true}
                        title="View Your Saved Schedules"
                        icon="Saved"
                        navTo={() => { navigation.navigate("Saved") }}
                    />
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>For New Schedules & Preferences</Text>
                <View style={{ ...styles.horizontalGrid, backgroundColor: theme.BACKGROUND }}> 
                    <MenuButton
                        title="Generate New Schedule"
                        icon="Generate"
                        navTo={() => { navigation.navigate("Generate") }}
                    />
                    <MenuButton
                        title="Change Preferences"
                        icon="Preferences"
                        navTo={() => { navigation.navigate("Preferences") }}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        height: '100%',
    },
    subContainer: {
        height: '90%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: 64,
        marginBottom: 8,
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginBottom: 16,
    },
    horizontalGrid: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    }
})

export default HomeScreen