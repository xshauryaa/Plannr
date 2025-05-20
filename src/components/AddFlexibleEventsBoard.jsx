import React, { useState } from 'react' 
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Pressable, Platform } from 'react-native'

import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import ActivityType from '../model/ActivityType.js'
import Priority from '../model/Priority.js'

const AddFlexibleEventsBoard = ({ onClick, minDate }) => {
    const maxDate = new Date()
    maxDate.setDate(minDate.getDate() + 6)

    const [name, setName] = useState('')
    const [type, setType] = useState(ActivityType.PERSONAL)
    const [duration, setDuration] = useState('0')
    const [priority, setPriority] = useState(Priority.MEDIUM)
    const [deadline, setDeadline] = useState(maxDate)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTypePicker, setShowTypePicker] = useState(false)
    const [showPriorityPicker, setShowPriorityPicker] = useState(false)
    const [warning, setWarning] = useState('')
    const [showWarning, setShowWarning] = useState(false)

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
    
    const getPriorityLabel = (priority) => {
        const labelMap = {
          [Priority.LOW]: 'Low',
          [Priority.MEDIUM]: 'Medium',
          [Priority.HIGH]: 'High',
        };
      
        return labelMap[priority] || 'Unknown';
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
                    <Pressable onPress={() => { setShowTypePicker(true); setShowPriorityPicker(false); setShowDatePicker(false); }}>
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

    {/* Event Duration & Priorty inputs */}
    const Panel2 = () => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ width: '50%' }}>
                    <Text style={styles.subHeading}>Duration (est.)</Text>
                    <TextInput
                        style={{ ...styles.input, width: '90%' }}
                        value={duration}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setDuration(nativeEvent.text)
                        } }
                    />
                </View>
                <View style={{ width: '50%' }}>
                    <Text style={styles.subHeading}>Priority</Text>
                    <Pressable onPress={() => { setShowTypePicker(false); setShowPriorityPicker(true); setShowDatePicker(false); }}>
                        <TextInput
                            style={{ ...styles.input, width: '90%' }}
                            pointerEvents="none"
                            value={getPriorityLabel(priority)}
                            editable={false}
                        />
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.card}>
            {/* Panel 1 - Name + Activity Type */}
            {Panel1()}

            {/* Panel 2 - Start Time + End Time */}
            {Panel2()}

            {/* Panel 3 - Date Picker */}
            <View>
                <Text style={styles.subHeading}>Date</Text>
                <Pressable onPress={() => { setShowTypePicker(false); setShowPriorityPicker(false); setShowDatePicker(true); }}>
                    <TextInput
                        style={styles.input}
                        pointerEvents="none"
                        value={deadline.toLocaleDateString()}
                        editable={false}
                    />
                </Pressable>
                {showDatePicker && (
                    <View>
                        <DateTimePicker
                            value={deadline}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, date) => {
                                if (date) setDeadline(date);
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

            {/* Priority Picker */}
            {showPriorityPicker && 
                <View>
                    <Picker
                        selectedValue={priority}
                        onValueChange={(itemValue) => setPriority(itemValue)}
                    >
                        <Picker.Item label="High" value={Priority.HIGH} />
                        <Picker.Item label="Medium" value={Priority.MEDIUM} />
                        <Picker.Item label="Low" value={Priority.LOW} />
                    </Picker>
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={() => setShowPriorityPicker(false)}
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
                    if (name.length == 0) {
                        setWarning("Name of event cannot be empty")
                        setShowWarning(true)
                    } else {
                        setShowWarning(false)
                        onClick(name, type, duration, priority, deadline)
                    }
                }}
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
    },
    warning: {
        fontSize: 12,
        fontFamily: 'AlbertSans',
        marginBottom: 12,
        color: '#FF0000',
        alignSelf: 'center'
    },
})

export default AddFlexibleEventsBoard