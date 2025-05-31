import React, { useState, useEffect } from 'react' 
import { Text, View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native'
import ActivityTypeIcons from '../model/ActivityTypeIcons'
import { useAppState } from '../context/AppStateContext.js'
import convertTimeToTime24 from '../utils/timeConversion.js'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import useCurrentTime from '../utils/useCurrentTime.js'
import Expand from '../../assets/system-icons/Expand.svg'
import Other from '../../assets/type-icons/Other.svg'

const UpcomingTasks = ({ onClick }) => {
    const { appState } = useAppState();
    const currentTime = useCurrentTime();

    const todaysDate = convertDateToScheduleDate(currentTime);
    let todaysTasks = []

    const loadTodaysTasks = () => {
        // Check if the user has an active schedule
        if (appState.activeSchedule !== null) {
            const todaysSchedule = appState.activeSchedule.getScheduleForDate(todaysDate.getId());
            if (todaysSchedule !== undefined) {
                todaysTasks = todaysSchedule.getTimeBlocks();
            }
        }
    }

    loadTodaysTasks()
    
    // For testing purposes, we are using a hardcoded schedule - TODO: remove this
    // let todaysTasks = appState.activeSchedule.getScheduleForDate(new ScheduleDate(23, 5, 2025)).getTimeBlocks();

    const [upcomingTasks, setUpcomingTasks] = useState([])
    const [allCompleted, setAllComplete] = useState(false)

    useEffect( () => {
        const timer = setInterval(() => {
            loadTodaysTasks()
            const check = todaysTasks.every(task => task.isCompleted)
            setAllComplete(check)
            const tasksLeft = todaysTasks.filter(task => {
                let curr = convertTimeToTime24(currentTime)
                return curr.isBefore(task.endTime)
            })
            setUpcomingTasks(tasksLeft)
          }, 1000);
      
        return () => clearInterval(timer);
        }, [todaysTasks])

    const NoUpcomingTasksView = () => {
        return (
            <View style={styles.card}>
                <Image source={require('../../assets/images/NoUpcomingTasks.png')} style={{ width: 192, height: 192, alignSelf: 'center' }} />
                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', alignSelf: 'center' }}>You have no upcoming tasks for today!</Text>
            </View>
        )
    }

    const NoTasksView = () => {
        return (
            <View style={{ ...styles.card, justifyContent: 'center' }}>
                <Image source={require('../../assets/images/NoTasks.png')} style={{ width: 192, height: 192, alignSelf: 'center' }} />
                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', alignSelf: 'center' }}>You have no tasks due for today!</Text>
            </View>
        )
    }

    const TasksView = () => {
        return (
            <View style={styles.card}>
                <FlatList
                    data={upcomingTasks.slice(0, 3)}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => {
                        const ICON = ActivityTypeIcons[item.activityType] || Other; 
                        return (
                            <View style={ { height: 64, marginBottom: 4 } }>
                                <View style={styles.taskCard}>
                                    <ICON width={36} height={36} />
                                    <View>
                                        <Text style={styles.taskName}>{item.name}</Text>
                                        <Text style={styles.time}>{`${item.startTime.hour}:${(item.startTime.minute < 10) ? '0'+item.startTime.minute : item.startTime.minute}`} - {`${item.endTime.hour}:${(item.endTime.minute < 10) ? '0'+item.endTime.minute : item.endTime.minute}`}</Text>
                                    </View>
                                </View>
                                <View style={styles.divider}></View>
                            </View>
                        )
                    }}
                />
                <View style={styles.horizontalGrid}>
                    <Text style={{ fontSize: 12, fontFamily: 'AlbertSans'}}>Expand to view all of today's tasks</Text>
                    <TouchableOpacity onPress={onClick}>
                        <Expand width={18} height={18} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const CompletedTasksView = () => {
        return (
            <View style={styles.card}>
                <Image source={require('../../assets/images/Celebration.png')} style={{ width: 192, height: 192, alignSelf: 'center' }} />
                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', alignSelf: 'center' }}>You have completed all your tasks for today!</Text>
            </View>
        )
    }

    return (
        (todaysTasks.length == 0) 
        ? NoTasksView() 
        : (allCompleted) 
            ? CompletedTasksView() 
            : (upcomingTasks.length == 0)
                ? NoUpcomingTasksView()
                : TasksView() 
    )
}

const styles = StyleSheet.create({
    card: {
        height: 262,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        marginVertical: 16,
        padding: 16,
    },
    taskCard: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    taskName: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        fontFamily: 'AlbertSans',
        color: 'rgba(0, 0, 0, 0.5)',
    },
    horizontalGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        marginVertical: 8,
    },
    centralText: {
        fontSize: 20,
        fontFamily: 'PinkSunset',
        textAlign: 'center',
        marginTop: 16,
    }
})

export default UpcomingTasks