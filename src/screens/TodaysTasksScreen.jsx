import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image, FlatList } from 'react-native'
import Checkbox from '../components/Checkbox';

const TodaysTasksScreen = ({ navigation }) => {
    const tasks = navigation.getParam('taskData', []);
    const [taskData, setTaskData] = useState(tasks)
    const [allCompleted, setAllComplete] = useState(false)

    const checkTasks = () => {
        return taskData.every(task => task.isCompleted)
    }
    

    useEffect( () => {
        const check = taskData.every(task => task.isCompleted)
        setAllComplete(check)
    }, [taskData])

    const TasksCompletedView = () => {
        return (
            <View style={styles.completion}>
                <Image style={{ height: 512, width: 512 }} source={require("../../assets/images/Celebration.png")}/>
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
                                <Image source={item.icon} style={{ height: 40, width: 40 }} />
                                <View>
                                    <Text style={styles.taskName}>{item.name}</Text>
                                    <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
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
            <Text style={styles.subHeading}>Here's your day for 5th May</Text>
            { allCompleted
                ? TasksCompletedView()
                : TaskListView()
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        height: '100%',
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