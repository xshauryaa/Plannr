import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, Platform, TouchableOpacity, ScrollView } from 'react-native' 
import { useAppState } from '../context/AppStateContext'
import { lightColor, darkColor } from '../design/colors.js'
import { Picker } from '@react-native-picker/picker'
import useCurrentTime from '../utils/useCurrentTime.js';
import convertDateToScheduleDate from '../utils/dateConversion.js';

const RescheduleStartView = ({ onNext, schedule }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    const [rescheduleMethod, setRescheduleMethod] = useState('Missed Task Shifting');
    const [description, setDescription] = useState('Replaces all missed tasks in the schedule with fresh time blocks later in time.');
    const [showPicker, setShowPicker] = useState(false);

    const rescheduleMethods = ['Missed Task Shifting', 'Add New Tasks & Breaks', 'Switch Strategies'];
    const descriptions = [
        'Replaces all missed tasks in the schedule with fresh time blocks later in time.',
        'Integrates newly added events and breaks into the existing schedule without disrupting valid time blocks.',
        'Recalculates the entire schedule using a new scheduling strategy while preserving user constraints.'
    ]

    const time = useCurrentTime();
        const currentDate = convertDateToScheduleDate(time).getId();
        const [missedTasks, setMissedTasks] = useState(0);

    useEffect(() => {
        const datesList = schedule.schedule.getAllDatesInOrder();
        let missingTasks = 0;

        for (const date of datesList) {
            if (date === currentDate) { break; }
            const tasks = schedule.schedule.getScheduleForDate(date).getTimeBlocks();
            missingTasks += tasks.filter(task => !task.completed).length;
        }
        setMissedTasks(missingTasks);
    }, [schedule]);

    return (
        <View style={styles.subContainer}>
            <View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Your currently selected schedule</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <TextInput
                        style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                        value={schedule.name}
                        editable={false}
                        autoCorrect={false}
                    />
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>How would you like to reschedule?</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <Pressable onPress={() => setShowPicker(true)}>
                        <TextInput
                            style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                            pointerEvents="none"
                            value={rescheduleMethod}
                            editable={false}
                        />
                    </Pressable>
                    {showPicker && (
                        <View>
                            <Picker
                                selectedValue={rescheduleMethod}
                                onValueChange={(itemValue) => { setRescheduleMethod(itemValue); setDescription(descriptions[rescheduleMethods.indexOf(itemValue)]); }}
                                themeVariant={appState.userPreferences.theme}
                            >
                                <Picker.Item label={rescheduleMethods[0]} value={rescheduleMethods[0]} />
                                <Picker.Item label={rescheduleMethods[1]} value={rescheduleMethods[1]} />
                                <Picker.Item label={rescheduleMethods[2]} value={rescheduleMethods[2]} />
                            </Picker>
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={() => setShowPicker(false)}
                            >
                                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <Text style={{ color: theme.FOREGROUND, fontFamily: 'AlbertSans', fontSize: 16, marginTop: 16, paddingHorizontal: 2 }}>{description}</Text>
                </View>
            </View>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => onNext()}
            >
                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Next</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    subContainer: {
        height: '87.5%',
        justifyContent: 'space-between',
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginVertical: 8
    },
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
    input: {
        height: 40,
        borderRadius: 12, 
        fontSize: 16,
        fontFamily: 'AlbertSans',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    button: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 16,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12
    }
});

export default RescheduleStartView;