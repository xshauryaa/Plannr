import React, { useState } from 'react'
import { View, Image, Text, StyleSheet, TouchableOpacity, Pressable, TextInput, Platform } from 'react-native' 
import { useAppState } from '../context/AppStateContext';
import DateTimePicker from '@react-native-community/datetimepicker'
import convertTimeToTime24 from '../utils/timeConversion';

const FinalCheckView = ({ onNext }) => {
    const { appState } = useAppState();
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [strategy, setStrategy] = useState(appState.userPreferences.defaultStrategy);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const warning = "End time must be after start time";

    return (
        <View style={styles.subContainer}>
            <View>
                <Text style={styles.subHeading}>One more thing - what are the daily time periods and the scheduling strategy you'd like?</Text>
                <Text style={styles.subHeading}>Daily Start & End Time</Text>
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
                    {showWarning && <Text style={styles.warning}>{warning}</Text>}
                </View>
                <Text style={styles.subHeading}>Scheduling Strategy</Text>
                <View style={{ ...styles.card, gap: 12 }}>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <Image
                            source={require('../../assets/images/EarliestFitIcon.png')}
                            style={{ width: 20, height: 20 }}
                        />
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (strategy == 'earliest-fit') ? '#000' : '#F0F0F0'  }}
                            onPress={() => { setStrategy('earliest-fit') }}
                        >
                                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (strategy == 'earliest-fit') ? '#FFFFFF' : '#000'}}>Earliest Fit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <Image
                            source={require('../../assets/images/BalancedWorkIcon.png')}
                            style={{ width: 20, height: 20 }}
                        />
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (strategy == 'balanced-work') ? '#000' : '#F0F0F0'  }}
                            onPress={() => { setStrategy('balanced-work') }}
                        >
                                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (strategy == 'balanced-work') ? '#FFFFFF' : '#000'}}>Balanced Work</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <Image
                            source={require('../../assets/images/DeadlineOrientedIcon.png')}
                            style={{ width: 20, height: 20 }}
                        />
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (strategy == 'deadline-oriented') ? '#000' : '#F0F0F0'  }}
                            onPress={() => { setStrategy('deadline-oriented') }}
                        >
                                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (strategy == 'deadline-oriented') ? '#FFFFFF' : '#000'}}>Deadline Oriented</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const startT = convertTimeToTime24(startTime);
                    const endT = convertTimeToTime24(endTime);
                    if (endT.isBefore(startT) || endT.equals(startT)) {
                        setShowWarning(true);
                    } else {
                        setShowWarning(false);
                        onNext(startT, endT, strategy);
                    }
                }}
            >
                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Generate Schedule</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    subContainer: {
        height: '90%',
        justifyContent: 'space-between',
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginVertical: 8
    },
    card: {
        width: '97%',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
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
        backgroundColor: '#F0F0F0',
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
    },
    choiceButton: {
        width: '92%',
        borderRadius: 12,
        backgroundColor: '#F0F0F0' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    warning: {
        fontSize: 12,
        fontFamily: 'AlbertSans',
        marginBottom: 4,
        color: '#FF0000',
        alignSelf: 'center'
    },
})

export default FinalCheckView