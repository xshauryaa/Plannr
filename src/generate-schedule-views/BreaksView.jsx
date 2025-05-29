import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native' 
import convertTimeToTime24 from '../utils/timeConversion.js'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import Break from '../model/Break'

import AddBreaksModal from '../components/AddBreaksModal'

const BreaksView = ({ onNext, minDate, numDays, onBack }) => {
    const [breaks, setBreaks] = useState([])
    const [repBreaks, setRepBreaks] = useState([])
    const [showModal, setShowModal] = useState(false)

    const addBreak = (startTime, endTime, repeated, date) => {
        const start = convertTimeToTime24(startTime)
        const end = convertTimeToTime24(endTime)
        const breakDate = convertDateToScheduleDate(date)
        const duration = (end.hour * 60 + end.minute) - (start.hour * 60 + start.minute);
        const newBreak = new Break(duration, start.toInt(), end.toInt())

        { (repeated)
        ? setRepBreaks([ ...repBreaks, newBreak]) 
        : setBreaks([ ...breaks, [breakDate, newBreak]])}

        setShowModal(false)
    }

    const breakCardRender = (breakObj, indexToRemove) => {
        return (
            <View style={styles.breakCard}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ ...styles.subHeading, fontSize: 12 }}>Break  |  {breakObj[0].getDateString()}  |  {breakObj[1].startTime.to12HourString()} - {breakObj[1].endTime.to12HourString()}</Text>
                </View>
                <TouchableOpacity onPress={() => { setBreaks(prev => prev.filter((_, i) => i !== indexToRemove)) }}>
                    <Image source={require('../../assets/images/CrossIcon.png')} style={{ width: 24, height: 24 }}/>
                </TouchableOpacity>
            </View>
        )
    }

    const repBreakCardRender = (breakObj, indexToRemove) => {
        return (
            <View style={styles.breakCard}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ ...styles.subHeading, fontSize: 12 }}>Break  |  Everyday |  {breakObj.startTime.to12HourString()} - {breakObj.endTime.to12HourString()}</Text>
                </View>
                <TouchableOpacity onPress={() => { setRepBreaks(prev => prev.filter((_, i) => i !== indexToRemove)) }}>
                    <Image source={require('../../assets/images/CrossIcon.png')} style={{ width: 24, height: 24 }}/>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.subContainer}>
            <View>
                <Text style={styles.subHeading}>Tell us the times where you'd like absolutely nothing scheduled!</Text>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => setShowModal(true)}
                >
                    <Image source={require('../../assets/nav-icons/GenerateIcon.png')} style={{ width: 18, height: 18 }}/>
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Add Break</Text>
                </TouchableOpacity>
                <Text style={styles.subHeading}>Everyday Breaks</Text>
                <View style={{ ...styles.card, height: 200 }}>
                    <FlatList
                        data={repBreaks}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={({ item, index }) => index}
                        renderItem={({ item, index }) => repBreakCardRender(item, index)}
                    />
                </View>
                <Text style={styles.subHeading}>Single Breaks</Text>
                <View style={{ ...styles.card, height: 200 }}>
                    <FlatList
                        data={breaks}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={({ item, index }) => index}
                        renderItem={({ item, index }) => breakCardRender(item, index)}
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
                    onPress={() => onNext(breaks, repBreaks)}
                >
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Next</Text>
                </TouchableOpacity>
            </View>
            <AddBreaksModal
                isVisible={showModal}
                onClick={addBreak}
                minDate={minDate}
                numDays={numDays}
            />
        </View>
    )
}

const styles = StyleSheet.create({
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
    subContainer: {
        height: '90%',
        justifyContent: 'space-between'
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginVertical: 8
    },
    breakCard: {
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

export default BreaksView