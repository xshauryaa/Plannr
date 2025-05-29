import React, { useContext, useEffect } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import * as Font from 'expo-font';

import LoadingScreen from './LoadingScreen';
import UpcomingTasks from '../components/UpcomingTasks';
import Progress from '../components/Progress';
import MenuButton from '../components/MenuButton';

import { useAppState } from '../context/AppStateContext.js'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import useCurrentTime from '../utils/useCurrentTime.js'
import NotificationService from '../notifications/NotificationService.js';

const HomeScreen = ({ navigation }) => {
    const { appState, storageLoaded } = useAppState();
    const currentTime = useCurrentTime();

    if (!storageLoaded) { return (<LoadingScreen/>) }
    
    const [fontsLoaded] = Font.useFonts({
        'PinkSunset': require('../../assets/fonts/PinkSunset-Regular.ttf'),
        'AlbertSans': require('../../assets/fonts/AlbertSans-VariableFont_wght.ttf'),
      });
    
    if (!fontsLoaded) return null;

    const todaysDate = convertDateToScheduleDate(currentTime);

    let progress = null

    // Check if the user has an active schedule, and return progress if true
    // if (activeSchedule !== null) {
    //     const todaysSchedule = activeSchedule.getScheduleForDate(todaysDate);
    //     if (todaysSchedule !== undefined) {
    //         todaysTasks = todaysSchedule.getTimeBlocks();
    //     }
    // }
    
    // For testing purposes, we are using a hardcoded schedule - TODO: remove this
    // todaysTasks = activeSchedule.getScheduleForDate(new ScheduleDate(23, 5, 2025)).getTimeBlocks();
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hello {appState.name}</Text>
            <View style={styles.subContainer}>
                <Text style={styles.subHeading}>Here's your day for {todaysDate.getDateString()}</Text>
                <UpcomingTasks onClick={() => { navigation.navigate("Tasks") }}/>
                <Progress progress={progress} />
                <Text style={styles.subHeading}>For Your Existing Schedule</Text>
                <View style={styles.horizontalGrid}>
                    <MenuButton
                        broad={true}
                        title="View Your Saved Schedules"
                        icon={require('../../assets/images/CalendarIcon.png')}
                        navTo={() => { navigation.navigate("Saved") }}
                    />
                </View>
                <Text style={styles.subHeading}>For New Schedules & Preferences</Text>
                <View style={styles.horizontalGrid}> 
                    <MenuButton
                        title="Generate New Schedule"
                        icon={require('../../assets/images/PlusIcon.png')}
                        navTo={() => { navigation.navigate("Generate") }}
                    />
                    <MenuButton
                        title="Change Preferences"
                        icon={require('../../assets/images/PreferencesIcon.png')}
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
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    subContainer: {
        height: '90%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: 64,
        marginBottom: 8
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginBottom: 16
    },
    horizontalGrid: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    }
})

export default HomeScreen