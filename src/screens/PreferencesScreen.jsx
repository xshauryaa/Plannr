import React, { useState } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Switch, Pressable } from 'react-native'
import { useAppState } from '../context/AppStateContext.js'
import DateTimePicker from '@react-native-community/datetimepicker'

const PreferencesScreen = () => {
    const { appState, setAppState } = useAppState();
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Preferences</Text>
            <ScrollView style={styles.subContainer}>
                <Text style={styles.subHeading}>Your Name</Text>
                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        value={appState.name}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setAppState({ ...appState, name: nativeEvent.text })
                        } }
                    />
                </View>
                <Text style={styles.subHeading}>App Theme</Text>
                <View style={{ ...styles.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity 
                            style={(appState.userPreferences.theme == 'light') ? styles.uiModeButtonSelected : styles.uiModeButtonDefault}
                            onPress={() => setAppState({ ...appState, userPreferences: { ...appState.userPreferences, theme: 'light' }})}
                        >
                            <View>
                                <Image 
                                    source={(appState.userPreferences.theme == 'light') ? require('../../assets/images/LightMode-Selected.png') : require('../../assets/images/LightMode.png')} 
                                    style={{ width: 32, height: 32, marginBottom: 4 }}
                                    />
                                <Text style={{ fontFamily: 'AlbertSans' }}>Light</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={(appState.userPreferences.theme == 'dark') ? styles.uiModeButtonSelected : styles.uiModeButtonDefault}
                            onPress={() => setAppState({ ...appState, userPreferences: { ...appState.userPreferences, theme: 'dark' }})}
                        >
                            <View>
                                <Image 
                                    source={(appState.userPreferences.theme == 'dark') ? require('../../assets/images/DarkMode-Selected.png') : require('../../assets/images/DarkMode.png')} 
                                    style={{ width: 32, height: 32, marginBottom: 4 }}
                                    />
                                <Text style={{ fontFamily: 'AlbertSans' }}>Dark</Text>
                            </View>
                        </TouchableOpacity>
                </View>
                <Text style={styles.subHeading}>Scheduling Strategy</Text>
                <View style={{ ...styles.card, gap: 12 }}>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <Image
                            source={require('../../assets/images/EarliestFitIcon.png')}
                            style={{ width: 20, height: 20 }}
                        />
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (appState.userPreferences.defaultStrategy == 'earliest-fit') ? '#000' : '#F0F0F0'  }}
                            onPress={() => {setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultStrategy: 'earliest-fit' }})}}
                        >
                                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (appState.userPreferences.defaultStrategy == 'earliest-fit') ? '#FFFFFF' : '#000'}}>Earliest Fit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <Image
                            source={require('../../assets/images/BalancedWorkIcon.png')}
                            style={{ width: 20, height: 20 }}
                        />
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (appState.userPreferences.defaultStrategy == 'balanced-work') ? '#000' : '#F0F0F0'  }}
                            onPress={() => {setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultStrategy: 'balanced-work' }})}}
                        >
                                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (appState.userPreferences.defaultStrategy == 'balanced-work') ? '#FFFFFF' : '#000'}}>Balanced Work</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <Image
                            source={require('../../assets/images/DeadlineOrientedIcon.png')}
                            style={{ width: 20, height: 20 }}
                        />
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (appState.userPreferences.defaultStrategy == 'deadline-oriented') ? '#000' : '#F0F0F0'  }}
                            onPress={() => {setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultStrategy: 'deadline-oriented' }})}}
                        >
                                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (appState.userPreferences.defaultStrategy == 'deadline-oriented') ? '#FFFFFF' : '#000'}}>Deadline Oriented</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.subHeading}>Time Constraints</Text>
                <View style={{ ...styles.card, gap: 16}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ width: '50%' }}>
                            <Text style={{ ...styles.subHeading, marginTop: 0, marginBottom: 8 }}>Min. Gap (mins)</Text>
                            <TextInput
                                style={{ ...styles.input, width: '90%' }}
                                value={appState.userPreferences.defaultMinGap}
                                autoCorrect={false}
                                autoCapitalize='words'
                                onChange={ ({ nativeEvent }) => { 
                                    setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultMinGap: nativeEvent.text }})
                                } }
                            />
                        </View>
                        <View style={{ width: '50%' }}>
                            <Text style={{ ...styles.subHeading, marginTop: 0, marginBottom: 8 }}>Max. Working Hours</Text>
                            <TextInput
                                style={{ ...styles.input, width: '90%' }}
                                value={appState.userPreferences.defaultMaxWorkingHours}
                                autoCorrect={false}
                                autoCapitalize='words'
                                onChange={ ({ nativeEvent }) => { 
                                    setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultMaxWorkingHours: nativeEvent.text }})
                                } }
                            />
                        </View>
                    </View>
                </View>
                <Text style={styles.subHeading}>Task Reminders</Text>
                <View style={{ ...styles.card, gap: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: 'rgba(0, 0, 0, 0.5)'}}>{(appState.userPreferences.taskRemindersEnabled) ? 'Enabled' : 'Disabled'}</Text>
                    <Switch
                        trackColor={{ false: '#000000', true: '#4166FB' }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor={'#000000'}
                        onValueChange={() => { 
                            const currPref = appState.userPreferences.taskRemindersEnabled
                            setAppState({ ...appState, userPreferences: {...appState.userPreferences, taskRemindersEnabled: !currPref }}) }}
                        value={appState.userPreferences.taskRemindersEnabled}
                    />
                </View>
                <Text style={styles.subHeading}>Incomplete Task Notification</Text>
                <View style={{ ...styles.card, gap: 12}}>
                    <TouchableOpacity 
                        style={{ ...styles.choiceButton, width: '100%', backgroundColor: (appState.userPreferences.incompleteTaskNotification == 0) ? '#000' : '#F0F0F0', flexDirection: 'row' }}
                        onPress={() => setAppState({ ...appState, userPreferences: { ...appState.userPreferences, incompleteTaskNotification: 0 }})}
                    >
                        <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (appState.userPreferences.incompleteTaskNotification == 0) ? '#FFFFFF' : '#000'}}>Notify 15 minutes after task's end time</Text>
                        {(appState.userPreferences.incompleteTaskNotification == 0) 
                            ? <Image source={require('../../assets/images/CheckIcon.png')} style={{ width: 18, height: 18, position: 'absolute', right: 16, alignSelf: 'center' }}/>
                            : <Image/>}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ ...styles.choiceButton, width: '100%', backgroundColor: (appState.userPreferences.incompleteTaskNotification == 1) ? '#000' : '#F0F0F0', flexDirection: 'row' }}
                        onPress={() => setAppState({ ...appState, userPreferences: { ...appState.userPreferences, incompleteTaskNotification: 1 } })}
                    >
                        <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (appState.userPreferences.incompleteTaskNotification == 1) ? '#FFFFFF' : '#000'}}>Notify at the end of the day of the task</Text>
                        {(appState.userPreferences.incompleteTaskNotification == 1) 
                            ? <Image source={require('../../assets/images/CheckIcon.png')} style={{ width: 18, height: 18, position: 'absolute', right: 16, alignSelf: 'center' }}/>
                            : <Image/>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    subContainer: {
        height: '80%',
        paddingBottom: 32
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: 64,
        marginBottom: 8
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
        marginVertical: 8,
        margin: 8,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    heading: { 
        fontSize: 24, 
        fontFamily: 'PinkSunset',
        marginBottom: 8,
    },
    subHeading: { 
        fontSize: 16, 
        fontFamily: 'AlbertSans',
        marginTop: 16,
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
    uiModeButtonDefault: {
        width: '45%',
        height: 80,
        borderRadius: 12,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    uiModeButtonSelected: {
        width: '45%',
        height: 80,
        borderRadius: 12,
        borderColor: '#000',
        borderWidth: 2,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    choiceButton: {
        width: '92%',
        borderRadius: 12,
        backgroundColor: '#F0F0F0' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    button: {
        width: '92%',
        borderRadius: 12,
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        alignSelf: 'center'
    }
})

export default PreferencesScreen