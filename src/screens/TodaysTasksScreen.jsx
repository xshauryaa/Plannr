import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image, FlatList } from 'react-native'
import Checkbox from '../components/Checkbox';
import ActivityTypeIcons from '../model/ActivityTypeIcons'
import { useAppState } from '../context/AppStateContext.js'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import useCurrentTime from '../utils/useCurrentTime.js'
import Other from '../../assets/type-icons/Other.svg'
import { lightColor, darkColor } from '../design/colors.js';

import { spacing, padding } from '../design/spacing.js'
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2

const TodaysTasksScreen = () => {
    
    const { appState, setAppState } = useAppState();
    const currentTime = useCurrentTime();

    const todaysDate = convertDateToScheduleDate(currentTime);
    let tasks = []

    // Check if the user has an active schedule
    if (appState.activeSchedule !== null) {
        const todaysSchedule = appState.activeSchedule.getScheduleForDate(todaysDate.getId());
        if (todaysSchedule !== undefined) {
            tasks = todaysSchedule.getTimeBlocks();
        }
    }

    const [taskData, setTaskData] = useState(tasks)
    const [allCompleted, setAllComplete] = useState(false)

    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    useEffect( () => {
        const check = taskData.every(task => task.isCompleted)
        setAllComplete(check)
    }, [taskData])

    const NoTasksView = () => {
        const imageMap = {
            light: require('../../assets/images/light/NoTasks.png'),
            dark: require('../../assets/images/dark/NoTasks.png'),
        };

        return (
            <View style={{ ...styles.completion, backgroundColor: theme.BACKGROUND }}>
                <Image style={{ height: 448, width: 448, marginTop: 48 }} source={imageMap[appState.userPreferences.theme]}/>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>You have no tasks due for today.</Text>
            </View>
        )
    }

    const TasksCompletedView = () => {
        const imageMap = {
            light: require('../../assets/images/light/Celebration.png'),
            dark: require('../../assets/images/dark/Celebration.png'),
        };

        return (
            <View style={{ ...styles.completion, backgroundColor: theme.BACKGROUND }}>
                <Image style={{ height: 448, width: 448, marginTop: 48 }} source={imageMap[appState.userPreferences.theme]}/>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>You crushed it today!</Text>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>You have completed all your tasks for the day.</Text>
            </View>
        )
    }

    const TaskListView =() => {
        return (
            <FlatList
                data={taskData}
                keyExtractor={(item, index) => index}
                renderItem={({ item, index }) => {
                        const ICON = ActivityTypeIcons[item.activityType] || Other;
                        return (
                            <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                                <ICON width={40} height={40} color={theme.FOREGROUND} />
                                <View>
                                    <Text style={{ ...styles.taskName, color: theme.FOREGROUND }}>{item.name}</Text>
                                    <Text style={{ ...styles.time, color: theme.FOREGROUND }}>{`${item.startTime.hour}:${(item.startTime.minute < 10) ? '0'+item.startTime.minute : item.startTime.minute}`} - {`${item.endTime.hour}:${(item.endTime.minute < 10) ? '0'+item.endTime.minute : item.endTime.minute}`}</Text>
                                </View>
                                <Checkbox 
                                    checked={item.isCompleted}
                                    onChange={() => {
                                        // 1. Update local UI
                                        const updatedTasks = [...taskData];
                                        const updatedTask = { ...updatedTasks[index] };
                                        updatedTask.isCompleted = !updatedTask.isCompleted;
                                        updatedTasks[index] = updatedTask;
                                        setTaskData(updatedTasks);
                                      
                                        // 2. Update appState.activeSchedule.schedule
                                        const currentDaySchedule = appState.activeSchedule.getScheduleForDate(todaysDate.getId());
                                      
                                        const updatedTimeBlocks = [...currentDaySchedule.timeBlocks];
                                        const updatedBlock = { ...updatedTimeBlocks[index] };
                                        updatedBlock.isCompleted = !updatedBlock.isCompleted;
                                        updatedTimeBlocks[index] = updatedBlock;
                                      
                                        const updatedDaySchedule = new currentDaySchedule.constructor(
                                          currentDaySchedule.day,
                                          currentDaySchedule.date,
                                          currentDaySchedule.minGap,
                                          currentDaySchedule.workingHoursLimit,
                                          currentDaySchedule.events,
                                          currentDaySchedule.breaks,
                                          updatedTimeBlocks
                                        );
                                      
                                        const updatedScheduleMap = new Map(appState.activeSchedule.schedule);
                                        updatedScheduleMap.set(todaysDate.getId(), updatedDaySchedule);
                                      
                                        const updatedSchedule = new appState.activeSchedule.constructor(
                                            appState.activeSchedule.numDays,
                                            appState.activeSchedule.minGap,
                                            appState.activeSchedule.day1Date,
                                            appState.activeSchedule.day1Day,
                                            appState.activeSchedule.workingHoursLimit,
                                            appState.activeSchedule.eventDependencies,
                                            updatedScheduleMap
                                        );
                                      
                                        setAppState(prev => ({
                                          ...prev,
                                          activeSchedule: updatedSchedule
                                        }));
                                      }}
                                />
                            </View>
                        )
                    }
                }
                style={styles.list}
                scrollEnabled={true}
            />
        )
    }

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND}}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Today's Tasks</Text>
            <View style={{ ...styles.subContainer, backgroundColor: theme.BACKGROUND}}>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Here's your day for {todaysDate.getDateString()}</Text>
                { (taskData.length == 0)
                    ? NoTasksView()
                    : (allCompleted)
                        ? TasksCompletedView()
                        : TaskListView()
                }
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
        height: '85%',
    },
    card: {
        width: '98%',
        aspectRatio: 398/72,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        padding: 16,
        marginBottom: 8,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
        marginBottom: SPACE
    },
    completion: {
        alignSelf: 'center',
        alignItems: 'center',
    },
    list: {
        height: '100%',
        width: '100%',
        paddingVertical: 16,
        marginBottom: 32
    },
    taskName: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginBottom: 8,
    },
    time: {
        fontSize: 12,
        fontFamily: 'AlbertSans',
        opacity: 0.5
    },
})

export default TodaysTasksScreen