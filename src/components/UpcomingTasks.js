import React, { useState } from 'react' 
import { Text, View, StyleSheet, FlatList, Image } from 'react-native'

const UpcomingTasks = ({ tasks }) => {
    let incompleteTasks = []

    for (let i = 0; i < tasks.length; i++) {
        if (!tasks[i].isCompleted) {
            incompleteTasks.push(tasks[i])
        }
    }

    return (
        <View style={styles.card}>
            <FlatList
                data={incompleteTasks.slice(0, 3)} // Only first 3 items
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => { 
                    return (
                        <View style={ { height: 64, marginBottom: 4 } }>
                            <View style={styles.taskCard}>
                                <Image source={item.icon} style={styles.icon} />
                                <View>
                                    <Text style={styles.taskName}>{item.name}</Text>
                                    <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
                                </View>
                            </View>
                            <View style={styles.divider}></View>
                        </View>
                    )
                }}
            />
            <View style={styles.horizontalGrid}>
                <Text style={{ fontSize: 12, fontFamily: 'AlbertSans'}}>Tap here to view all of today's tasks</Text>
                <Image source={require('../../assets/images/Expand.png')} style={styles.icon} />
            </View>
        </View>
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
        width: 18,
        height: 18,
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
    }
})

export default UpcomingTasks