import React, { useState } from 'react'
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native' 
import RigidEvent from '../model/RigidEvent'
import AddRigidEventsModal from '../components/AddRigidEventsModal'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import convertTimeToTime24 from '../utils/timeConversion.js'

const RigidEventsView = ({ onNext, minDate, numDays, onBack }) => {
    const [rigidEvents, setRigidEvents] = useState([])
    const [showModal, setShowModal] = useState(false)

    const addRigidEvent = (name, type, date, startTime, endTime) => {
        const eventDate = convertDateToScheduleDate(date)
        const start = convertTimeToTime24(startTime)
        const end = convertTimeToTime24(endTime)
        const duration = (end.hour * 60 + end.minute) - (start.hour * 60 + start.minute);
        const newEvent = new RigidEvent(name, type, duration, eventDate, start.toInt(), end.toInt())

        setRigidEvents([...rigidEvents, newEvent])
        setShowModal(false)
    }

    const eventRender = (eventObj, indexToRemove) => {
        return (
            <View style={styles.eventCard}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ ...styles.subHeading, fontSize: 12 }}>{eventObj.name}  |  {eventObj.date.getDateString()}  |  {eventObj.startTime.to12HourString()} - {eventObj.endTime.to12HourString()}</Text>
                </View>
                <TouchableOpacity onPress={() => { setRigidEvents(prev => prev.filter((_, i) => i !== indexToRemove)) }}>
                    <Image source={require('../../assets/images/CrossIcon.png')} style={{ width: 24, height: 24 }}/>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.subContainer}>
            <View>
                <Text style={styles.subHeading}>Rigid events are ones that have fixed timings - such as meetings, classes, etc.</Text>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => setShowModal(true)}
                >
                    <Image source={require('../../assets/nav-icons/GenerateIcon.png')} style={{ width: 18, height: 18 }}/>
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Add Event</Text>
                </TouchableOpacity>
                <Text style={styles.subHeading}>Events</Text>
                <View style={{ ...styles.card, height: '60%' }}>
                    <FlatList
                        data={rigidEvents}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={({ item, index }) => index}
                        renderItem={({ item, index }) => eventRender(item, index)}
                    />
                </View>
            </View>
            <View style={styles.horizontalGrid}>
                <TouchableOpacity 
                    style={{ ...styles.button, marginVertical: 0, width: '48%' }}
                    onPress={() => onBack()}
                >
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{ ...styles.button, marginVertical: 0, width: '48%' }}
                    onPress={() => onNext(rigidEvents)}
                >
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Next</Text>
                </TouchableOpacity>
            </View>
            <AddRigidEventsModal
                isVisible={showModal}
                onClick={addRigidEvent}
                minDate={minDate}
                numDays={numDays}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    subContainer: {
        height: '90%',
        justifyContent: 'space-between'
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
    horizontalGrid: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    button: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16,
        gap: 12
    }
})

export default RigidEventsView