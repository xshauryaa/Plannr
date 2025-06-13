import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, Platform, TouchableOpacity, ScrollView } from 'react-native' 
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAppState } from '../context/AppStateContext'
import { lightColor, darkColor } from '../design/colors.js'

const InfoView = ({ onNext }) => {
    const { appState } = useAppState();
    const [showPicker, setShowPicker] = useState(false);
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [numDays, setNumDays] = useState('1');
    const [minGap, setMinGap] = useState(appState.userPreferences.defaultMinGap);
    const [maxHours, setMaxHours] = useState(appState.userPreferences.defaultMaxWorkingHours);

    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    return (
        <View style={styles.subContainer}>
            <ScrollView>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>First, enter some information about what you'd like from the schedule.</Text>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>What's the name of this schedule</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <TextInput
                        style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                        value={name}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setName(nativeEvent.text)
                        } }
                    />
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>What date would you like to schedule from?</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <Pressable onPress={() => setShowPicker(true)}>
                        <TextInput
                            style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                            pointerEvents="none"
                            value={startDate.toLocaleDateString()}
                            editable={false}
                        />
                    </Pressable>
                    {showPicker && (
                        <View>
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => {
                                    setShowPicker(Platform.OS === 'ios'); // keep open for iOS
                                    if (date) setStartDate(date);
                                }}
                                minimumDate={new Date()}
                                themeVariant={appState.userPreferences.theme}
                            />
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={() => setShowPicker(false)}
                            >
                                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>How many days would you like to schedule for?</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <TextInput
                        style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                        value={numDays}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setNumDays(nativeEvent.text)
                        } }
                    />
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Minimum gap between scheduled events (in mins)</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <TextInput
                        style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                        value={minGap}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setMinGap(nativeEvent.text)
                        } }
                    />
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Maximum working hours per day</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <TextInput
                        style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                        value={maxHours}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setMaxHours(nativeEvent.text)
                        } }
                    />
                </View>
            </ScrollView>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => onNext(name, numDays, startDate, minGap, maxHours)}
            >
                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Next</Text>
            </TouchableOpacity>
        </View>
    )
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
})

export default InfoView