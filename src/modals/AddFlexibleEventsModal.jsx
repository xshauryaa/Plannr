import React, { useState } from 'react' 
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Pressable, Platform } from 'react-native'
import Modal from 'react-native-modal'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'

import ActivityType from '../model/ActivityType.js'
import Priority from '../model/Priority.js'

import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'

const AddFlexibleEventsModal = ({ isVisible, onClick, minDate, numDays }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const maxDate = new Date()
    maxDate.setDate(minDate.getDate() + (numDays - 1))
    
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
                    <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Name</Text>
                    <TextInput
                        style={{ ...styles.input, width: '90%', backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                        value={name}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setName(nativeEvent.text)
                        } }
                    />
                </View>
                <View style={{ width: '50%' }}>
                    <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Type</Text>
                    <Pressable onPress={() => { setShowTypePicker(true); setShowPriorityPicker(false); setShowDatePicker(false); }}>
                        <TextInput
                            style={{ ...styles.input, width: '90%', backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
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
                    <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Duration (est.)</Text>
                    <TextInput
                        style={{ ...styles.input, width: '90%', backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                        value={duration}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setDuration(nativeEvent.text)
                        } }
                    />
                </View>
                <View style={{ width: '50%' }}>
                    <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Priority</Text>
                    <Pressable onPress={() => { setShowTypePicker(false); setShowPriorityPicker(true); setShowDatePicker(false); }}>
                        <TextInput
                            style={{ ...styles.input, width: '90%', backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                            pointerEvents="none"
                            value={getPriorityLabel(priority)}
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
        setDuration('0')
        setPriority(Priority.MEDIUM)
        setDeadline(maxDate)
        setShowDatePicker(false)
        setShowTypePicker(false)
        setShowPriorityPicker(false)
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
            <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                {/* Panel 1 - Name + Activity Type */}
                {Panel1()}

                {/* Panel 2 - Duration + Priority */}
                {Panel2()}

                {/* Panel 3 - Date Picker */}
                <View>
                    <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Date</Text>
                    <Pressable onPress={() => { setShowTypePicker(false); setShowPriorityPicker(false); setShowDatePicker(true); }}>
                        <TextInput
                            style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
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

                {/* Activity Type Picker */}
                {showTypePicker && 
                    <View>
                        <Picker
                            selectedValue={type}
                            onValueChange={(itemValue) => setType(itemValue)}
                            themeVariant={appState.userPreferences.theme}
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
                            themeVariant={appState.userPreferences.theme}
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
                        } else if (parseInt(duration) == 0) {
                            setWarning("Duration of event cannot be 0")
                            setShowWarning(true)
                        } else {
                            setShowWarning(false)
                            onClick(name, type, duration, priority, deadline)
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

export default AddFlexibleEventsModal