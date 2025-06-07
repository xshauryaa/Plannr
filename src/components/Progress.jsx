import React, { useEffect, useState } from 'react' 
import { Text, View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import GoIcon from '../../assets/system-icons/GoIcon.svg';
import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'

import { spacing, padding } from '../design/spacing.js'
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const WIDTH = width - (padding.SCREEN_PADDING * 2);
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2

const Progress = () => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let totalTasks = 0;
        let completedTasks = 0;
        if (appState.activeSchedule) {
            const datesList = appState.activeSchedule.getAllDatesInOrder();
            
            for (const date of datesList) {
                const schedule = appState.activeSchedule.getScheduleForDate(date);
                totalTasks += schedule.timeBlocks.length;
                completedTasks += schedule.timeBlocks.filter(tb => tb.completed).length;
            }
        }
        const newProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        setProgress(newProgress);
    }, [appState]);

    const NoScheduleView = () => {
        return (
            <View style={{ ...styles.card, justifyContent: 'center', backgroundColor: theme.COMP_COLOR }}>
                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', alignSelf: 'center', color: theme.FOREGROUND }}>No schedule to track progress.</Text>
            </View>
        )
    }

    const ScheduleView = () => {
        return (
            <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                <Text style={{ ...styles.topText, color: theme.FOREGROUND }}>You've completed {Math.round(progress)}% of this week's tasks!</Text>
                <View style={styles.progressBarBack}>
                    <LinearGradient
                        colors={[theme.GRADIENT_START, theme.GRADIENT_END]}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={{ ...styles.progressBarFront, width: `${progress}%` }}
                    />
                </View>
                <View style={{ ...styles.horizontalGrid, backgroundColor: theme.COMP_COLOR }}>
                    <Text style={{ ...styles.bottomText, color: theme.FOREGROUND }}>View your current week's schedule</Text>
                    <GoIcon style={styles.icon} width={18} height={18} color={theme.FOREGROUND} />
                </View>
            </View>
        )
    }

    return (
        (progress === null) 
        ? NoScheduleView()
        : ScheduleView()
    )
}

const styles = StyleSheet.create({
    card: {
        width: WIDTH,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        padding: 16,
        marginBottom: SPACE
    },
    topText: {
        fontSize: 12,
        fontFamily: 'AlbertSans',
        marginBottom: 8,
    },
    progressBarBack: {
        height: 10,
        borderRadius: 16,
        backgroundColor: '#EAEAEA',
        marginBottom: 8,
    },
    progressBarFront: {
        height: 10,
        borderRadius: 16,
    },
    horizontalGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bottomText: {
        fontSize: 12,
        fontFamily: 'AlbertSans',
        alignSelf: 'flex-start',
    },
    icon: {
        width: 18,
        height: 18,
        alignSelf: 'flex-end',
    }
})

export default Progress