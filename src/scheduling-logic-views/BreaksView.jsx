import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native' 
import convertTimeToTime24 from '../utils/timeConversion.js'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'

import Break from '../model/Break'
import AddIcon from '../../assets/system-icons/AddIcon.svg'
import CrossIcon from '../../assets/system-icons/CrossIcon.svg';

import AddBreaksModal from '../components/AddBreaksModal'
import { Dimensions} from 'react-native';
const { width, height } = Dimensions.get('window');
const CARDHEIGHT = (height > 900) ? 180 : (height > 800) ? 150 : 120;

const BreaksView = ({ onNext, minDate, numDays, onBack, breaksInput, repeatedBreaksInput }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    
    const [breaks, setBreaks] = useState(breaksInput)
    const [repBreaks, setRepBreaks] = useState(repeatedBreaksInput)
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
            <View style={{ ...styles.breakCard, backgroundColor: theme.INPUT }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ ...styles.subHeading, fontSize: 12, color: theme.FOREGROUND }}>Break  |  {breakObj[0].getDateString()}  |  {breakObj[1].startTime.to12HourString()} - {breakObj[1].endTime.to12HourString()}</Text>
                </View>
                <TouchableOpacity onPress={() => { setBreaks(prev => prev.filter((_, i) => i !== indexToRemove)) }}>
                    <CrossIcon width={24} height={24} color={theme.FOREGROUND} />
                </TouchableOpacity>
            </View>
        )
    }

    const repBreakCardRender = (breakObj, indexToRemove) => {
        return (
            <View style={{ ...styles.breakCard, backgroundColor: theme.INPUT }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ ...styles.subHeading, fontSize: 12, color: theme.FOREGROUND }}>Break  |  Everyday |  {breakObj.startTime.to12HourString()} - {breakObj.endTime.to12HourString()}</Text>
                </View>
                <TouchableOpacity onPress={() => { setRepBreaks(prev => prev.filter((_, i) => i !== indexToRemove)) }}>
                    <CrossIcon width={24} height={24} color={theme.FOREGROUND} />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.subContainer}>
            <View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Tell us the times where you'd like absolutely nothing scheduled!</Text>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => setShowModal(true)}
                >
                    <AddIcon width={18} height={18} />
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Add Break</Text>
                </TouchableOpacity>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Everyday Breaks</Text>
                <View style={{ ...styles.card, height: CARDHEIGHT, backgroundColor: theme.COMP_COLOR }}>
                    <FlatList
                        data={repBreaks}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={({ item, index }) => index}
                        renderItem={({ item, index }) => repBreakCardRender(item, index)}
                    />
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Single Breaks</Text>
                <View style={{ ...styles.card, height: CARDHEIGHT, backgroundColor: theme.COMP_COLOR }}>
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
        width: '99%',
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
        height: '87.5%',
        justifyContent: 'space-between'
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginVertical: 8
    },
    breakCard: {
        height: 40,
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