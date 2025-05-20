import React, { useState } from 'react'
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity, Pressable } from 'react-native' 
import convertDateToScheduleDate from '../utils/convertDateToScheduleDate'
import FlexibleEvent from '../model/FlexibleEvent'
import AddFlexibleEventsBoard from '../components/AddFlexibleEventsBoard'

const FlexibleEventsView = ({ onNext, minDate}) => {
    const [flexibleEvents, setFlexibleEvents] = useState([])

    const addFlexibleEvent = (name, type, duration, priority, deadline) => {
        const eventDeadline = convertDateToScheduleDate(deadline)
        const newEvent = new FlexibleEvent(name, type, duration, priority, eventDeadline)

        setFlexibleEvents([...flexibleEvents, newEvent])
        console.log(newEvent)
    }

    const eventRender = (eventObj, indexToRemove) => {
        return (
            <View style={styles.eventCard}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ ...styles.subHeading, fontSize: 12 }}>{eventObj.name}  |  {eventObj.duration} mins  |  Before {eventObj.deadline.getDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => { setFlexibleEvents(prev => prev.filter((_, i) => i !== indexToRemove)) }}>
                    <Image source={require('../../assets/images/CrossIcon.png')} style={{ width: 24, height: 24 }}/>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.subContainer}>
            <Text style={styles.subHeading}>Flexible events are ones that have deadlines - such as assignments, pre-requisites, etc.</Text>
            <AddFlexibleEventsBoard
                onClick={addFlexibleEvent}
                minDate={minDate}
            />
            <View style={{ ...styles.card, height: 200 }}>
                <FlatList
                    data={flexibleEvents}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={({ item, index }) => index}
                    renderItem={({ item, index }) => eventRender(item, index)}
                />
            </View>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => onNext(flexibleEvents)}
            >
                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Next</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    subContainer: {
        height: '90%',
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginVertical: 8
    },
    card: {
        width: '95%',
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
        alignSelf: 'center'
    },
    eventCard: {
        height: 40, 
        backgroundColor: "#F0F0F0",
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 12
    },
    button: {
        width: '92%',
        borderRadius: 12,
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 16,
        alignSelf: 'center'
    }
})

export default FlexibleEventsView