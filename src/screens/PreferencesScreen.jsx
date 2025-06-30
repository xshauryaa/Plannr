import React from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native'
import { useAppState } from '../context/AppStateContext.js'
import EarliestFitIcon from '../../assets/strategy-icons/EarliestFitIcon.svg'
import BalancedWorkIcon from '../../assets/strategy-icons/BalancedWorkIcon.svg'
import DeadlineOrientedIcon from '../../assets/strategy-icons/DeadlineOrientedIcon.svg'
import LightMode from '../../assets/system-icons/LightMode.svg'
import DarkMode from '../../assets/system-icons/DarkMode.svg'
import { lightColor, darkColor } from '../design/colors.js'

const PreferencesScreen = () => {
    const { appState, setAppState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    
    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Preferences</Text>
            <ScrollView style={styles.subContainer}>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Your Name</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <TextInput
                        style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                        value={appState.name}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setAppState({ ...appState, name: nativeEvent.text })
                        } }
                    />
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>App Theme</Text>
                <View style={{ ...styles.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.COMP_COLOR }}>
                        <TouchableOpacity 
                            style={(appState.userPreferences.theme == 'light') ? { ...styles.uiModeButtonSelected, borderColor: theme.FOREGROUND} : { ...styles.uiModeButtonDefault, borderColor: (theme.FOREGROUND + '1A')}}
                            onPress={() => setAppState({ ...appState, userPreferences: { ...appState.userPreferences, theme: 'light' }})}
                        >
                            <View>
                                <LightMode width={32} height={32} style={{ marginBottom: 4 }} color={(appState.userPreferences.theme == 'light') ? '#E3CD00' : theme.FOREGROUND}/>
                                <Text style={{ fontFamily: 'AlbertSans', color: theme.FOREGROUND }}>Light</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={(appState.userPreferences.theme == 'dark') ? { ...styles.uiModeButtonSelected, borderColor: theme.FOREGROUND} : { ...styles.uiModeButtonDefault, borderColor: (theme.FOREGROUND + '1A')}}
                            onPress={() => setAppState({ ...appState, userPreferences: { ...appState.userPreferences, theme: 'dark' }})}
                        >
                            <View>
                                <DarkMode width={32} height={32} style={{ marginBottom: 4 }} color={(appState.userPreferences.theme == 'dark') ? '#8C84E5' : theme.FOREGROUND }/>
                                <Text style={{ fontFamily: 'AlbertSans', color: theme.FOREGROUND }}>Dark</Text>
                            </View>
                        </TouchableOpacity>
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Scheduling Strategy</Text>
                <View style={{ ...styles.card, gap: 12, backgroundColor: theme.COMP_COLOR }}>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <EarliestFitIcon width={20} height={20}/>
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (appState.userPreferences.defaultStrategy == 'earliest-fit') ? theme.SELECTION : theme.INPUT  }}
                            onPress={() => {setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultStrategy: 'earliest-fit' }})}}
                        >
                                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (appState.userPreferences.defaultStrategy == 'earliest-fit') ? theme.SELECTED_TEXT : theme.FOREGROUND }}>Earliest Fit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <BalancedWorkIcon width={20} height={20}/>
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (appState.userPreferences.defaultStrategy == 'balanced-work') ? theme.SELECTION : theme.INPUT }}
                            onPress={() => {setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultStrategy: 'balanced-work' }})}}
                        >
                                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (appState.userPreferences.defaultStrategy == 'balanced-work') ? theme.SELECTED_TEXT : theme.FOREGROUND }}>Balanced Work</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <DeadlineOrientedIcon width={20} height={20}/>
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (appState.userPreferences.defaultStrategy == 'deadline-oriented') ? theme.SELECTION : theme.INPUT }}
                            onPress={() => {setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultStrategy: 'deadline-oriented' }})}}
                        >
                                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: (appState.userPreferences.defaultStrategy == 'deadline-oriented') ? theme.SELECTED_TEXT : theme.FOREGROUND }}>Deadline Oriented</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Time Constraints</Text>
                <View style={{ ...styles.card, gap: 16, backgroundColor: theme.COMP_COLOR }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ width: '50%' }}>
                            <Text style={{ ...styles.subHeading, marginTop: 0, marginBottom: 8, color: theme.FOREGROUND }}>Min. Gap (mins)</Text>
                            <TextInput
                                style={{ ...styles.input, width: '90%', backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                                value={appState.userPreferences.defaultMinGap}
                                autoCorrect={false}
                                autoCapitalize='words'
                                onChange={ ({ nativeEvent }) => { 
                                    setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultMinGap: nativeEvent.text }})
                                } }
                            />
                        </View>
                        <View style={{ width: '50%' }}>
                            <Text style={{ ...styles.subHeading, marginTop: 0, marginBottom: 8, color: theme.FOREGROUND }}>Max. Working Hours</Text>
                            <TextInput
                                style={{ ...styles.input, width: '90%', backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
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
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Task Reminders</Text>
                <View style={{ ...styles.card, gap: 16, backgroundColor: theme.COMP_COLOR }}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', color: theme.FOREGROUND, opacity: 0.5 }}>{(appState.userPreferences.taskRemindersEnabled) ? 'Enabled' : 'Disabled'}</Text>
                        <Switch
                            trackColor={{ false: '#000000', true: '#4166FB' }}
                            thumbColor={'#FFFFFF'}
                            ios_backgroundColor={'#C0C0C0'}
                            onValueChange={() => { 
                                const currPref = appState.userPreferences.taskRemindersEnabled
                                setAppState({ ...appState, userPreferences: {...appState.userPreferences, taskRemindersEnabled: !currPref }}) }}
                            value={appState.userPreferences.taskRemindersEnabled}
                        />
                    </View>
                    {appState.userPreferences.taskRemindersEnabled && (
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8}}>
                            <Text style={{ ...styles.subHeading, marginTop: 4, marginBottom: 4, color: theme.FOREGROUND }}>Remind me</Text>
                            <TextInput
                                style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                                value={appState.userPreferences.leadMinutes}
                                autoCorrect={false}
                                autoCapitalize='words'
                                onChange={ ({ nativeEvent }) => { 
                                    setAppState({ ...appState, userPreferences: { ...appState.userPreferences, leadMinutes: nativeEvent.text } })
                                } }
                            />
                            <Text style={{ ...styles.subHeading, marginTop: 4, marginBottom: 4, color: theme.FOREGROUND }}>minutes before a task</Text>
                        </View>
                    )}
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
    },
    uiModeButtonDefault: {
        width: '45%',
        height: 80,
        borderRadius: 12,
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