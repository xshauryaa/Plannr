import React, { useState, useEffect, useContext } from 'react'
import { StyleSheet, View, Text, Image, FlatList } from 'react-native'
import Checkbox from '../components/Checkbox';
import ActivityTypeIcons from '../model/ActivityTypeIcons'
import { AppStateContext } from '../context/AppStateContext.js'
import convertDateToScheduleDate from '../utils/convertDateToScheduleDate.js'

const TodaysTasksScreen = () => {
    
    const { activeSchedule, currentTime } = useContext(AppStateContext)

    const todaysDate = convertDateToScheduleDate(currentTime);
    let tasks = []

    // Check if the user has an active schedule
    // if (activeSchedule !== null) {
    //     const todaysDay = activeSchedule.getDayFromDate(todaysDate);
    //     const todaysSchedule = activeSchedule.getScheduleForDay(todaysDay);
    //     if (todaysSchedule !== undefined) {
    //         tasks = todaysSchedule.getTimeBlocks();
    //     }
    // }

    // For testing purposes, we are using a hardcoded schedule - TODO: remove this
    tasks = activeSchedule.getScheduleForDay('Sunday').getTimeBlocks();

    const [taskData, setTaskData] = useState(tasks)
    const [allCompleted, setAllComplete] = useState(false)
    

    useEffect( () => {
        const check = taskData.every(task => task.isCompleted)
        setAllComplete(check)
    }, [taskData])

    const NoTaskView = () => {
        return (
            <View style={styles.completion}>
                <Image style={{ height: 448, width: 448, marginTop: 48 }} source={require("../../assets/images/NoTasks.png")}/>
                <Text style={styles.subHeading}>There are no tasks scheduled for the day.</Text>
            </View>
        )
    }

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
                                        setTaskData(prevTasks => {prevTasks[index].isCompleted = !prevTasks[index].isCompleted; return [...prevTasks]})
                                    } }
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
                { (taskData.length == 0) 
                    ? NoTaskView()
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
        padding: 16,
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    subContainer: {
        height: '80%',
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