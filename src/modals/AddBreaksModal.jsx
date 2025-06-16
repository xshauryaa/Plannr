import React, { useState } from 'react' 
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Pressable, Platform } from 'react-native'
import Modal from 'react-native-modal'

import DateTimePicker from '@react-native-community/datetimepicker'
import convertTimeToTime24 from '../utils/timeConversion.js'

import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'

import Checked from '../../assets/system-icons/Checked.svg'
import Unchecked from '../../assets/system-icons/Unchecked.svg'

const AddBreaksModal = ({ isVisible, onClick, minDate, numDays }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const [startTime, setStartTime] = useState(new Date())
    const [endTime, setEndTime] = useState(new Date())
    const [dateOfBreak, setDateOfBreak] = useState(new Date())
    const [repeated, setRepeated] = useState(false)
    const [showStartPicker, setShowStartPicker] = useState(false)
    const [showEndPicker, setShowEndPicker] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showWarning, setShowWarning] = useState(false)

    const maxDate = new Date()
    maxDate.setDate(minDate.getDate() + (numDays - 1))

    const warning = "End time must be after start time"

    const setToDefaults = () => {
        setStartTime(new Date())
        setEndTime(new Date())
        setDateOfBreak(new Date())
        setRepeated(false)
        setShowStartPicker(false)
        setShowEndPicker(false)
        setShowDatePicker(false)
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
                {/* Start Time & End Time inputs + their respective time pickers */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ width: '50%' }}>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Start Time</Text>
                        <Pressable onPress={() => { setShowEndPicker(false); setShowStartPicker(true); setShowDatePicker(false); }}>
                            <TextInput
                                style={{ ...styles.input, width: '90%', backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                                pointerEvents="none"
                                value={startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                editable={false}
                            />
                        </Pressable>
                    </View>
                    <View style={{ width: '50%' }}>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>End Time</Text>
                        <Pressable onPress={() => { setShowEndPicker(true); setShowStartPicker(false); setShowDatePicker(false); }}>
                            <TextInput
                                style={{ ...styles.input, width: '90%', backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                                pointerEvents="none"
                                value={endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                editable={false}
                            />
                        </Pressable>
                    </View>
                </View>
                {showStartPicker && (
                    <View>
                        <DateTimePicker
                            value={startTime}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, time) => {
                                if (time) setStartTime(time);
                            }}
                            themeVariant={appState.userPreferences.theme}
                        />
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={() => setShowStartPicker(false)}
                        >
                            <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {showEndPicker && (
                    <View>
                        <DateTimePicker
                            value={endTime}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, time) => {
                                if (time) setEndTime(time);
                            }}
                            themeVariant={appState.userPreferences.theme}
                        />
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={() => setShowEndPicker(false)}
                        >
                            <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Day input + day picker */}
                {(!repeated)  
                ? <View>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Date</Text>
                        <Pressable onPress={() => { setShowStartPicker(false); setShowEndPicker(false); setShowDatePicker(true) }}>
                            <TextInput
                                style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND}}
                                pointerEvents="none"
                                value={dateOfBreak.toLocaleDateString()}
                                editable={false}
                            />
                        </Pressable>
                        {showDatePicker && (
                            <View>
                                <DateTimePicker
                                    value={dateOfBreak}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, date) => {
                                        if (date) setDateOfBreak(date);
                                    }}
                                    minimumDate={minDate}
                                    maximumDate={maxDate}
                                    themeVariant={appState.userPreferences.theme}
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
                        const endT = convertTimeToTime24(endTime)
                        const startT = convertTimeToTime24(startTime)
                        if ((endT.isBefore(startT)) || endT.equals(startT)) {
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
        padding: 24,
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginBottom: 8
    },
    input: {
        height: 40,
        borderRadius: 12, 
        fontSize: 16,
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
        fontSize: 12,
        fontFamily: 'AlbertSans',
        marginBottom: 12,
        color: '#FF0000',
        alignSelf: 'center'
    },
})

export default AddBreaksModal