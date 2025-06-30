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
import { scheduleNotification } from '../notifications/NotificationService.js'

import { lightColor, darkColor } from '../design/colors.js'

import { spacing, padding } from '../design/spacing.js'
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2


const HomeScreen = ({ navigation }) => {
    const { appState, storageLoaded } = useAppState();
    const currentTime = useCurrentTime();

    if (!storageLoaded) { return (<LoadingScreen/>) }

    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    
    const [fontsLoaded] = Font.useFonts({
        'PinkSunset': require('../../assets/fonts/PinkSunset-Regular.ttf'),
        'AlbertSans': require('../../assets/fonts/AlbertSans-VariableFont_wght.ttf'),
      });
    
    if (!fontsLoaded) return null;

    const todaysDate = convertDateToScheduleDate(currentTime);

    const showNotification = async () => {
        scheduleNotification({
            title: 'Test Notification',
            body: 'This is a test notification',
        }, {
            seconds: 10,
        }).then((id) => {
            if (id) {
                console.log(`Test notification scheduled with ID: ${id}`);
            } else {
                console.error('Failed to schedule test notification');
            }
        });
    }
    
    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Hello {appState.name}</Text>
            <View style={{ ...styles.subContainer, backgroundColor: theme.BACKGROUND}}>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Here's your day for {todaysDate.getDateString()}</Text>
                <UpcomingTasks onClick={() => { navigation.navigate("Tasks") }}/>
                <Progress/>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>For Your Scheduling</Text>
                <View style={{ ...styles.horizontalGrid, backgroundColor: theme.BACKGROUND }}>
                    <MenuButton
                        broad={true}
                        title="Plannr Center"
                        icon="Center"
                        navTo={() => { 
                            // navigation.navigate("Center") 
                            showNotification(); // For testing notification scheduling
                        }}
                    />
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>More Options</Text>
                <View style={{ ...styles.horizontalGrid, backgroundColor: theme.BACKGROUND }}> 
                    <MenuButton
                        title="View Your Saved Schedules"
                        icon="Saved"
                        navTo={() => { navigation.navigate("Saved") }}
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
        padding: padding.SCREEN_PADDING,
        height: '100%',
    },
    subContainer: {
        height: '90%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: spacing.SPACING_16,
        marginBottom: SPACE,
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginBottom: SPACE,
    },
    horizontalGrid: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
})

export default HomeScreen