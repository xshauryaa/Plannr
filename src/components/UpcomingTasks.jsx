import React from 'react' 
import { Text, View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native'
import ActivityTypeIcons from '../model/ActivityTypeIcons'

const UpcomingTasks = ({ tasks, onClick }) => {
    let incompleteTasks = []

    for (let i = 0; i < tasks.length; i++) {
        if (!tasks[i].isCompleted) {
            incompleteTasks.push(tasks[i])
        }
    }

    const NoTasksView = () => {
        return (
            <View style={{ ...styles.card, justifyContent: 'center' }}>
                <Image source={require('../../assets/images/NoTasks.png')} style={{ width: 128, height: 128, alignSelf: 'center' }} />
                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', alignSelf: 'center' }}>You have no tasks due for today!</Text>
            </View>
        )
    }

    const TasksView = () => {
        return (
            <View style={styles.card}>
                <FlatList
                    data={incompleteTasks.slice(0, 3)}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => { 
                        return (
                            <View style={ { height: 64, marginBottom: 4 } }>
                                <View style={styles.taskCard}>
                                    <Image source={ActivityTypeIcons[item.activityType]} style={styles.icon} />
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
                        <Image source={require('../../assets/images/Expand.png')} style={styles.expandButton} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        (tasks.length == 0) 
        ? NoTasksView() 
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
    icon: {
        width: 36,
        height: 36,
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
    expandButton: {
        width: 18,
        height: 18,
    },
    centralText: {
        fontSize: 20,
        fontFamily: 'PinkSunset',
        textAlign: 'center',
        marginTop: 16,
    }
})

export default UpcomingTasks