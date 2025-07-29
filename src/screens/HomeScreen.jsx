import React, { useEffect } from 'react'
import { Text, View, StyleSheet, ScrollView } from 'react-native'
import * as Font from 'expo-font';

import LoadingScreen from './LoadingScreen.jsx';
import UpcomingTasks from '../components/UpcomingTasks.jsx';
import Progress from '../components/Progress.jsx';
import MenuButton from '../components/MenuButton.jsx';

import { useAppState } from '../context/AppStateContext.js'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import useCurrentTime from '../utils/useCurrentTime.js'

import { lightColor, darkColor } from '../design/colors.js'
import { spacing, padding } from '../design/spacing.js'
import { typography  } from '../design/typography.js';
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
    
    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Hello {appState.name}</Text>
            <ScrollView style={{ ...styles.subContainer, backgroundColor: theme.BACKGROUND}}>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Here's your day for {todaysDate.getDateString()}</Text>
                <UpcomingTasks onClick={() => { navigation.navigate("Tasks") }}/>
                <Progress/>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>For Your Scheduling</Text>
                <View style={{ ...styles.horizontalGrid, backgroundColor: theme.BACKGROUND }}>
                    <MenuButton
                        broad={true}
                        title="Plannr Center"
                        icon="Center"
                        navTo={() => { navigation.navigate("Center") }}
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
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: padding.SCREEN_PADDING,
        height: '100%',
    },
    subContainer: {
        height: width,
        alignSelf: 'center',
        alignContent: 'center',
        paddingHorizontal: padding.SCREEN_PADDING,
    },
    title: {
        fontSize: typography.titleSize,
        fontFamily: 'PinkSunset',
        marginTop: spacing.SPACING_16,
        marginBottom: SPACE,
        marginLeft: padding.SCREEN_PADDING,
    },
    subHeading: {
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        marginBottom: SPACE,
    },
    horizontalGrid: {
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
})

export default HomeScreen