import React, { useEffect, useState } from 'react' 
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import GoIcon from '../../assets/system-icons/GoIcon.svg';
import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'
import { spacing, padding } from '../design/spacing.js'
import { typography } from '../design/typography.js';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const WIDTH = width - (padding.SCREEN_PADDING * 2);
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2

const Progress = () => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    const [progress, setProgress] = useState(0);
    const navigation = useNavigation();

    useEffect(() => {
        let totalTasks = 0;
        let completedTasks = 0;
        if (appState.activeSchedule) {
            const datesList = appState.activeSchedule.schedule.getAllDatesInOrder();
            
            for (const date of datesList) {
                const schedule = appState.activeSchedule.schedule.getScheduleForDate(date);
                totalTasks += schedule.timeBlocks.length;
                completedTasks += schedule.timeBlocks.filter(tb => tb.completed).length;
            }
        } else {
            setProgress(null);
            return;
        }
        const newProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        setProgress(newProgress);
    }, [appState.activeSchedule]);

    const NoScheduleView = () => {
        return (
            <View style={{ ...styles.card, justifyContent: 'center', backgroundColor: theme.COMP_COLOR }}>
                <Text style={{ fontSize: typography.subHeadingSize, fontFamily: 'AlbertSans', alignSelf: 'center', color: theme.FOREGROUND }}>No schedule to track progress.</Text>
            </View>
        )
    }

    const ScheduleView = () => {
        return (
            <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                <Text style={{ ...styles.topText, color: theme.FOREGROUND }}>You've completed {Math.round(progress)}% of this schedule's tasks!</Text>
                <View style={styles.progressBarBack}>
                    <LinearGradient
                        colors={[theme.GRADIENT_START, theme.GRADIENT_END]}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={{ ...styles.progressBarFront, width: `${progress}%` }}
                    />
                </View>
                <View style={{ ...styles.horizontalGrid, backgroundColor: theme.COMP_COLOR }}>
                    <Text style={{ ...styles.bottomText, color: theme.FOREGROUND }}>View your current schedule</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('View', { schedName: appState.activeSchedule.name })}>
                        <GoIcon style={styles.icon} width={18} height={18} color={theme.FOREGROUND} />
                    </TouchableOpacity>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: SPACE,
        alignSelf: 'center',
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