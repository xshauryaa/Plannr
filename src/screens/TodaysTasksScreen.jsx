import React, { useState, useEffect, useContext } from 'react'
import { StyleSheet, View, Text, Image, FlatList } from 'react-native'
import Checkbox from '../components/Checkbox';
import ActivityTypeIcons from '../model/ActivityTypeIcons'
import { useAppState } from '../context/AppStateContext.js'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import useCurrentTime from '../utils/useCurrentTime.js'

const TodaysTasksScreen = () => {
    
    const { appState, setAppState } = useAppState();
    const currentTime = useCurrentTime();

    const todaysDate = convertDateToScheduleDate(currentTime);
    let tasks = []

    // Check if the user has an active schedule
    if (appState.activeSchedule !== null) {
        const todaysDay = appState.activeSchedule.getDayFromDate(todaysDate);
        const todaysSchedule = appState.activeSchedule.getScheduleForDay(todaysDay);
        if (todaysSchedule !== undefined) {
            tasks = todaysSchedule.getTimeBlocks();
        }
    }

    // For testing purposes, we are using a hardcoded schedule - TODO: remove this
    // tasks = appState.activeSchedule.getScheduleForDay('Monday').getTimeBlocks();

    const [taskData, setTaskData] = useState(tasks)
    const [allCompleted, setAllComplete] = useState(false)

    useEffect( () => {
        const check = taskData.every(task => task.isCompleted)
        setAllComplete(check)
    }, [taskData])

    const TasksCompletedView = () => {
        return (
            <View style={styles.completion}>
                <Image style={{ height: 448, width: 448, marginTop: 48 }} source={require("../../assets/images/Celebration.png")}/>
                <Text style={styles.subHeading}>You crushed it today!</Text>
                <Text style={styles.subHeading}>You have completed all your tasks for the day.</Text>
            </View>
        )
    }

    const TaskListView =() => {
        return (
            <FlatList
                data={taskData}
                keyExtractor={(item, index) => index}
                renderItem={({ item, index }) => {
                        return (
                            <View style={styles.card}>
                                <Image source={ActivityTypeIcons[item.activityType]} style={{ height: 40, width: 40 }} />
                                <View>
                                    <Text style={styles.taskName}>{item.name}</Text>
                                    <Text style={styles.time}>{`${item.startTime.hour}:${(item.startTime.minute < 10) ? '0'+item.startTime.minute : item.startTime.minute}`} - {`${item.endTime.hour}:${(item.endTime.minute < 10) ? '0'+item.endTime.minute : item.endTime.minute}`}</Text>
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
                                      
                                        // 2. Update appState.activeSchedule.weekSchedule
                                        const todayStr = appState.activeSchedule.getDayFromDate(todaysDate);
                                        const currentDaySchedule = appState.activeSchedule.getScheduleForDay(todayStr);
                                      
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
                                      
                                        const updatedWeekSchedule = new Map(appState.activeSchedule.weekSchedule);
                                        updatedWeekSchedule.set(todayStr, updatedDaySchedule);
                                      
                                        const updatedSchedule = new appState.activeSchedule.constructor(
                                          appState.activeSchedule.minGap,
                                          appState.activeSchedule.day1Date,
                                          appState.activeSchedule.day1Day,
                                          appState.activeSchedule.workingHoursLimit,
                                          updatedWeekSchedule
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
        <View style={styles.container}>
            <Text style={styles.title}>Today's Tasks</Text>
            <View style={styles.subContainer}>
                <Text style={styles.subHeading}>Here's your day for {todaysDate.getDateString()}</Text>
                { (allCompleted)
                        ? TasksCompletedView()
                        : TaskListView()
                }
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
        height: '85%',
    },
    card: {
        height: 72,
        width: '97%',
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
        gap: 12
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
        color: 'rgba(0, 0, 0, 0.5)',
    },
})

export default TodaysTasksScreen