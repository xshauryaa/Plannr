import React, { useContext, useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, Platform, TouchableOpacity } from 'react-native' 
import DateTimePicker from '@react-native-community/datetimepicker'
import { AppStateContext } from '../context/AppStateContext'

const InfoView = ({ onNext }) => {
    const { appState } = useContext(AppStateContext)
    const [showPicker, setShowPicker] = useState(false)
    const [startDate, setStartDate] = useState(new Date())
    const [minGap, setMinGap] = useState(appState.userPreferences.defaultMinGap)
    const [maxHours, setMaxHours] = useState(appState.userPreferences.defaultMaxWorkingHours)

    return (
        <View style={styles.subContainer}>
            <View>
                <Text style={styles.subHeading}>First, enter some information about what you'd like from the schedule.</Text>
                <Text style={styles.subHeading}>What date would you like to schedule from?</Text>
                <View style={styles.card}>
                    <Pressable onPress={() => setShowPicker(true)}>
                        <TextInput
                            style={styles.input}
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
                <Text style={styles.subHeading}>Minimum gap between scheduled events (in mins)</Text>
                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        value={minGap}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setMinGap(nativeEvent.text)
                        } }
                    />
                </View>
                <Text style={styles.subHeading}>Maximum working hours per day</Text>
                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        value={maxHours}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setMaxHours(nativeEvent.text)
                        } }
                    />
                </View>
            </View>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => onNext(startDate, minGap, maxHours)}
            >
                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Next</Text>
            </TouchableOpacity>
        </View>
    )
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
        width: '92%',
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