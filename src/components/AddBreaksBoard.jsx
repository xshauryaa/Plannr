import React, { useState, useContext } from 'react' 
import { Text, Image, View, StyleSheet, TouchableOpacity, TextInput, Pressable, Platform } from 'react-native'

import { AppStateContext } from '../context/AppStateContext.js'
import DateTimePicker from '@react-native-community/datetimepicker'

const AddBreaksBoard = ({ onClick, minDate }) => {
    const { currentTime } = useContext(AppStateContext)

    const [startTime, setStartTime] = useState(currentTime)
    const [endTime, setEndTime] = useState(currentTime)
    const [dateOfBreak, setDateOfBreak] = useState(currentTime)
    const [repeated, setRepeated] = useState(false)
    const [showStartPicker, setShowStartPicker] = useState(false)
    const [showEndPicker, setShowEndPicker] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)

    const maxDate = new Date()
    maxDate.setDate(minDate.getDate() + 6)

    return (
        <View style={styles.card}>

            {/* Start Time & End Time inputs + their respective time pickers */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ width: '50%' }}>
                    <Text style={styles.subHeading}>Start Time</Text>
                    <Pressable onPress={() => { setShowEndPicker(false); setShowStartPicker(true); }}>
                        <TextInput
                            style={{ ...styles.input, width: '90%' }}
                            pointerEvents="none"
                            value={startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            editable={false}
                        />
                    </Pressable>
                </View>
                <View style={{ width: '50%' }}>
                    <Text style={styles.subHeading}>End Time</Text>
                    <Pressable onPress={() => { setShowEndPicker(true); setShowStartPicker(false); }}>
                        <TextInput
                            style={{ ...styles.input, width: '90%' }}
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
                    <Text style={styles.subHeading}>Date</Text>
                    <Pressable onPress={() => setShowDatePicker(true)}>
                        <TextInput
                            style={styles.input}
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
                        ? <Image style={styles.checkbox} source={require('../../assets/images/Checked.png')}/> 
                        : <Image style={styles.checkbox} source={require('../../assets/images/Unchecked.png')}/> 
                    }
                </TouchableOpacity>
                <Text style={{ ...styles.subHeading, marginBottom: 0 }}>Check this box to add this break on all days</Text>
            </View>

            { /* Add Break Button */ }
            <TouchableOpacity 
                style={styles.button}
                onPress={() => onClick(startTime, endTime, repeated, dateOfBreak)}
            >
                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Add</Text>
            </TouchableOpacity>
        </View>
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
        padding: 16,
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
    checkbox: {
        width: 24,
        height: 24,
    },
    button: {
        width: '92%',
        borderRadius: 12,
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 4,
        alignSelf: 'center'
    }
})

export default AddBreaksBoard