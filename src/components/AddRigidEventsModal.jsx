import React, { useState } from 'react' 
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Pressable, Platform } from 'react-native'
import Modal from 'react-native-modal'

import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import ActivityType from '../model/ActivityType.js'
import convertTimeToTime24 from '../utils/timeConversion.js'

const AddRigidEventsModal = ({ isVisible, onClick, minDate, numDays }) => {
    const [name, setName] = useState('')
    const [type, setType] = useState(ActivityType.PERSONAL)
    const [startTime, setStartTime] = useState(new Date())
    const [endTime, setEndTime] = useState(new Date())
    const [dateOfEvent, setDateOfEvent] = useState(new Date())
    const [showStartPicker, setShowStartPicker] = useState(false)
    const [showEndPicker, setShowEndPicker] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTypePicker, setShowTypePicker] = useState(false)
    const [warning, setWarning] = useState('')
    const [showWarning, setShowWarning] = useState(false)

    const maxDate = new Date()
    maxDate.setDate(minDate.getDate() + (numDays - 1))

    const getActivityLabel = (activityType) => {
        const labelMap = {
          [ActivityType.PERSONAL]: 'Personal',
          [ActivityType.MEETING]: 'Meeting',
          [ActivityType.WORK]: 'Work',
          [ActivityType.EVENT]: 'Event',
          [ActivityType.EDUCATION]: 'Education',
          [ActivityType.TRAVEL]: 'Travel',
          [ActivityType.RECREATIONAL]: 'Recreational',
          [ActivityType.ERRAND]: 'Errand',
          [ActivityType.OTHER]: 'Other',
        };
      
        return labelMap[activityType] || 'Unknown';
    }      

    {/* Name & Activity Type inputs */}
    const Panel1 = () => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ width: '50%' }}>
                    <Text style={styles.subHeading}>Name</Text>
                    <TextInput
                        style={{ ...styles.input, width: '90%' }}
                        value={name}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setName(nativeEvent.text)
                        } }
                    />
                </View>
                <View style={{ width: '50%' }}>
                    <Text style={styles.subHeading}>Type</Text>
                    <Pressable onPress={() => setShowTypePicker(true)}>
                        <TextInput
                            style={{ ...styles.input, width: '90%' }}
                            pointerEvents="none"
                            value={getActivityLabel(type)}
                            editable={false}
                        />
                    </Pressable>
                </View>
            </View>
        )
    }

    {/* Start Time & End Time inputs + their respective time pickers */}
    const Panel2 = () => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ width: '50%' }}>
                    <Text style={styles.subHeading}>Start Time</Text>
                    <Pressable onPress={() => { setShowEndPicker(false); setShowStartPicker(true); setShowDatePicker(false); }}>
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
                    <Pressable onPress={() => { setShowEndPicker(true); setShowStartPicker(false); setShowDatePicker(false); }}>
                        <TextInput
                            style={{ ...styles.input, width: '90%' }}
                            pointerEvents="none"
                            value={endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            editable={false}
                        />
                    </Pressable>
                </View>
            </View>
        )
    }

    const setToDefaults = () => {
        setName('')
        setType(ActivityType.PERSONAL)
        setStartTime(new Date())
        setEndTime(new Date())
        setDateOfEvent(new Date())
        setShowStartPicker(false)
        setShowEndPicker(false)
        setShowDatePicker(false)
        setShowTypePicker(false)
        setWarning('')
        setShowWarning(false)
    }

    return (
        <Modal
            isVisible={isVisible} 
            style={{ justifyContent: 'center', alignItems: 'center' }}
            animationInTiming={500}
            animationOutTiming={500}
        >
            <View style={styles.card}>
                {/* Panel 1 - Name + Activity Type */}
                {Panel1()}

                {/* Panel 2 - Start Time + End Time */}
                {Panel2()}
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

                {/* Panel 3 - Date Picker */}
                <View>
                    <Text style={styles.subHeading}>Date</Text>
                    <Pressable onPress={() => { setShowEndPicker(false); setShowStartPicker(false); setShowDatePicker(true); }}>
                        <TextInput
                            style={styles.input}
                            pointerEvents="none"
                            value={dateOfEvent.toLocaleDateString()}
                            editable={false}
                        />
                    </Pressable>
                    {showDatePicker && (
                        <View>
                            <DateTimePicker
                                value={dateOfEvent}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => {
                                    if (date) setDateOfEvent(date);
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

                {/* Activity Type Picker */}
                {showTypePicker && 
                    <View>
                        <Picker
                            selectedValue={type}
                            onValueChange={(itemValue) => setType(itemValue)}
                        >
                            <Picker.Item label="Personal" value={ActivityType.PERSONAL} />
                            <Picker.Item label="Meeting" value={ActivityType.MEETING} />
                            <Picker.Item label="Work" value={ActivityType.WORK} />
                            <Picker.Item label="Event" value={ActivityType.EVENT} />
                            <Picker.Item label="Education" value={ActivityType.EDUCATION} />
                            <Picker.Item label="Travel" value={ActivityType.TRAVEL} />
                            <Picker.Item label="Recreational" value={ActivityType.RECREATIONAL} />
                            <Picker.Item label="Errand" value={ActivityType.ERRAND} />
                            <Picker.Item label="Other" value={ActivityType.OTHER} />
                        </Picker>
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={() => setShowTypePicker(false)}
                        >
                            <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                }

                {showWarning && <Text style={styles.warning}>{warning}</Text>}

                { /* Add Rigid Event Button */ }
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => {
                        const endT = convertTimeToTime24(endTime)
                        const startT = convertTimeToTime24(startTime)
                        if (name.length == 0) {
                            setWarning("Name of event cannot be empty")
                            setShowWarning(true)
                        } else if ((endT.isBefore(startT)) || endT.equals(startT)) {
                            setWarning("End time must be after start time")
                            setShowWarning(true)
                        } else {
                            setShowWarning(false)
                            onClick(name, type, dateOfEvent, startTime, endTime)
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

export default AddRigidEventsModal