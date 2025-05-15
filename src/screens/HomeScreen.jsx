import React, { useContext } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import * as Font from 'expo-font';

import UpcomingTasks from '../components/UpcomingTasks';
import Progress from '../components/Progress';
import MenuButton from '../components/MenuButton';

import { AppStateContext } from '../context/AppStateContext.js'
import convertDateToScheduleDate from '../utils/convertDateToScheduleDate.js'

const HomeScreen = ({ navigation }) => {
    const { name, activeSchedule, currentTime } = useContext(AppStateContext)
    
    const [fontsLoaded] = Font.useFonts({
        'PinkSunset': require('../../assets/fonts/PinkSunset-Regular.ttf'),
        'AlbertSans': require('../../assets/fonts/AlbertSans-VariableFont_wght.ttf'),
      });
    
    if (!fontsLoaded) return null;

    const todaysDate = convertDateToScheduleDate(currentTime);
    let todaysTasks = []
    let progress = null

    // Check if the user has an active schedule
    // if (activeSchedule !== null) {
    //     const todaysDay = activeSchedule.getDayFromDate(todaysDate);
    //     const todaysSchedule = activeSchedule.getScheduleForDay(todaysDay);
    //     if (todaysSchedule !== undefined) {
    //         todaysTasks = todaysSchedule.getTimeBlocks();
    //     }
    // }
    
    todaysTasks = activeSchedule.getScheduleForDay('Monday').getTimeBlocks();
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hello {name}</Text>
            <Text style={styles.subHeading}>Here's your day for {todaysDate.getDateString()}</Text>
            <UpcomingTasks tasks={todaysTasks} onClick={() => { navigation.navigate("TodaysTasks") }}/>
            <Progress progress={progress} />
            <Text style={styles.subHeading}>For Your Current Schedule</Text>
            <View style={styles.horizontalGrid}> 
                <MenuButton
                    title="Add New Task to Schedule"
                    icon={require('../../assets/images/PlusIcon.png')}
                />
                <MenuButton
                    title="Mid-Week Strategy Change"
                    icon={require('../../assets/images/SwapIcon.png')}
                />
            </View>
            <Text style={styles.subHeading}>For New Schedules & Preferences</Text>
            <View style={styles.horizontalGrid}> 
                <MenuButton
                    title="Generate New Schedule"
                    icon={require('../../assets/images/CalendarIcon.png')}
                />
                <MenuButton
                    title="Change Preferences"
                    icon={require('../../assets/images/PreferencesIcon.png')}
                />
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
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: 64,
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