import React, { useState } from 'react' 
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Pressable, Platform } from 'react-native'
import Modal from 'react-native-modal'

import DatePicker from '../components/DatePicker.jsx'
import TimePicker from '../components/TimePicker.jsx'
import convertTimeToTime24 from '../utils/timeConversion.js'
import convertDateToScheduleDate from '../utils/dateConversion.js'

import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'
import { typography } from '../design/typography.js'

import Checked from '../../assets/system-icons/Checked.svg'
import Unchecked from '../../assets/system-icons/Unchecked.svg'

const AddBreaksModal = ({ isVisible, onClick, minDate, numDays }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const [startTime, setStartTime] = useState(convertTimeToTime24(new Date()))
    const [endTime, setEndTime] = useState(convertTimeToTime24(new Date()))
    const [dateOfBreak, setDateOfBreak] = useState(minDate);
    const [repeated, setRepeated] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    let maxDate = new Date()
    maxDate.setDate(minDate.getDate() + (numDays - 1))
    maxDate = convertDateToScheduleDate(maxDate);

    const warning = "End time must be after start time"

    const setToDefaults = () => {
        setStartTime(convertTimeToTime24(new Date()))
        setEndTime(convertTimeToTime24(new Date()))
        setDateOfBreak(minDate)
        setRepeated(false)
        setShowWarning(false)
    }

    return (
        <Modal
            isVisible={isVisible} 
            style={{ justifyContent: 'center', alignItems: 'center' }}
            animationInTiming={500}
            animationOutTiming={500}
        >
            <View style={{ ...styles.card, backgroundColor: theme.BACKGROUND }}>
                {/* Time Inputs */}
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR, gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Start Time</Text>
                        <TimePicker value={startTime} onChange={(time) => { setStartTime(time); }} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>End Time</Text>
                        <TimePicker value={endTime} onChange={(time) => { setEndTime(time); }} />
                    </View>
                    {showWarning && <Text style={styles.warning}>{warning}</Text>}
                </View>

                {/* Date input */}
                {(!repeated)  
                ? <View>
                    <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Date</Text>
                    <Pressable onPress={() => { setShowDatePicker(true) }}>
                        <TextInput
                            style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND}}
                            pointerEvents="none"
                            value={dateOfBreak.getDateString()}
                            editable={false}
                        />
                    </Pressable>
                    {showDatePicker && (
                        <View>
                            <DatePicker
                                mode="date"
                                onChange={(date) => {
                                    setDateOfBreak(date);
                                }}
                                minimumDate={minDate}
                                maximumDate={maxDate}
                            />
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                : null
                }

                {/* Checkbox for repeated */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                    <TouchableOpacity style={styles.checkbox} onPress={() => setRepeated(!repeated)}>
                        { repeated 
                            ? <Checked width={24} height={24} color={theme.FOREGROUND} /> 
                            : <Unchecked width={24} height={24}color={theme.FOREGROUND} />
                        }
                    </TouchableOpacity>
                    <Text style={{ ...styles.subHeading, marginBottom: 0, color: theme.FOREGROUND }}>Check this box to add this break on all days</Text>
                </View>

                {/* Warning message */}
                {showWarning && <Text style={styles.warning}>{warning}</Text>}

                { /* Add Break Button */ }
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => {
                        console.log(`Adding break from ${startTime.to12HourString()} to ${endTime.to12HourString()} on ${dateOfBreak.getDateString()}`);
                        if ((endTime.isBefore(startTime)) || endTime.equals(startTime)) {
                            setShowWarning(true)
                        } else {
                            setShowWarning(false)
                            onClick(startTime, endTime, repeated, dateOfBreak)
                            setToDefaults();
                        }
                    }}
                >
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Add</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    card: {
        width: '99%',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        padding: 16,
        marginTop: 4,
        marginBottom: 16,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    subHeading: {
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        marginBottom: 8
    },
    input: {
        height: 40,
        borderRadius: 12, 
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F0F0F0',
        marginBottom: 16
    },
    button: {
        width: '92%',
        borderRadius: 12,
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        alignSelf: 'center'
    },
    warning: {
        fontSize: typography.bodySize,
        fontFamily: 'AlbertSans',
        marginBottom: 12,
        color: '#FF0000',
        alignSelf: 'center'
    },
})

export default AddBreaksModal