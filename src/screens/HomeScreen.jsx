import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import * as Font from 'expo-font';
import UpcomingTasks from '../components/UpcomingTasks';
import Progress from '../components/Progress';
import MenuButton from '../components/MenuButton';

const HomeScreen = ({ navigation }) => {
    const [fontsLoaded] = Font.useFonts({
        'PinkSunset': require('../../assets/fonts/PinkSunset-Regular.ttf'),
        'AlbertSans': require('../../assets/fonts/AlbertSans-VariableFont_wght.ttf'),
      });
    
    if (!fontsLoaded) return null;

    let tasks = [
        { name: 'Morning Run', date: '2025-05-05', icon: require('../../assets/icons/recreational.png'), startTime: 800, endTime: 830, duration: 30, isCompleted: true, type: 'flexible' },
        { name: 'Sunday Yoga', date: '2025-05-05', icon: require('../../assets/icons/recreational.png'), startTime: 900, endTime: 1000, duration: 60, isCompleted: true, type: 'flexible' },
        { name: 'Study AI Concepts', date: '2025-05-05', icon: require('../../assets/icons/education.png'), startTime: 1030, endTime: 1200, duration: 90, isCompleted: true, type: 'flexible' },
        { name: 'Meditation Session', date: '2025-05-05', icon: require('../../assets/icons/personal.png'), startTime: 1230, endTime: 1300, duration: 30, isCompleted: true, type: 'flexible' },
        { name: 'Email Professors', date: '2025-05-05', icon: require('../../assets/icons/education.png'), startTime: 1330, endTime: 1400, duration: 30, isCompleted: false, type: 'flexible' },
        { name: 'Study Math Chapters', date: '2025-05-05', icon: require('../../assets/icons/education.png'), startTime: 1430, endTime: 1600, duration: 90, isCompleted: false, type: 'flexible' },
        { name: 'Mood Journal', date: '2025-05-05', icon: require('../../assets/icons/personal.png'), startTime: 1630, endTime: 1650, duration: 20, isCompleted: false, type: 'flexible' },
        { name: 'Break', date: '2025-05-05', icon: require('../../assets/icons/break.png'), startTime: 1730, endTime: 1800, duration: 30, isCompleted: false, type: 'break' },
        { name: 'Mood Journal 2', date: '2025-05-05', icon: require('../../assets/icons/personal.png'), startTime: 1630, endTime: 1650, duration: 20, isCompleted: false, type: 'flexible' },
        { name: 'Mood Journal 3', date: '2025-05-05', icon: require('../../assets/icons/personal.png'), startTime: 1630, endTime: 1650, duration: 20, isCompleted: false, type: 'flexible' },
        { name: 'Mood Journal 4', date: '2025-05-05', icon: require('../../assets/icons/personal.png'), startTime: 1630, endTime: 1650, duration: 20, isCompleted: false, type: 'flexible' },
    ]
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hello Shaurya</Text>
            <Text style={styles.subHeading}>Here's your day for 5th May</Text>
            <UpcomingTasks tasks={tasks} onClick={() => { navigation.navigate("TodaysTasks", {taskData: tasks}) }}/>
            <Progress progress={60} />
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