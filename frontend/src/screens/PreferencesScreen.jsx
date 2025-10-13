import React, { useState } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native'
import { useClerk } from "@clerk/clerk-expo"
import { TokenCacheUtils } from '../../cache.js'
import { useAppState } from '../context/AppStateContext.js'
import EarliestFitIcon from '../../assets/strategy-icons/EarliestFitIcon.svg'
import BalancedWorkIcon from '../../assets/strategy-icons/BalancedWorkIcon.svg'
import DeadlineOrientedIcon from '../../assets/strategy-icons/DeadlineOrientedIcon.svg'
import LightMode from '../../assets/system-icons/LightMode.svg'
import DarkMode from '../../assets/system-icons/DarkMode.svg'
import { lightColor, darkColor } from '../design/colors.js'
import { typography } from '../design/typography.js'
import { padding } from '../design/spacing.js'

const PreferencesScreen = () => {
    const { appState, setAppState } = useAppState();
    const { signOut } = useClerk();
    const [showNameWarning, setShowNameWarning] = useState(false);
    const [showMinGapWarning, setShowMinGapWarning] = useState(false);
    const [showMaxHoursWarning, setShowMaxHoursWarning] = useState(false);
    const [showLeadMinutesWarning, setShowLeadMinutesWarning] = useState(false);
    
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const handleLogout = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Clear all authentication tokens from secure storage
                            await TokenCacheUtils.clearAllAuthData();
                            
                            // Sign out from Clerk
                            await signOut();
                            
                            console.log("Successfully signed out and cleared all tokens");
                        } catch (error) {
                            console.error("Error signing out:", error);
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const validateAndSave = () => {
        // Reset all warnings
        setShowNameWarning(false);
        setShowMinGapWarning(false);
        setShowMaxHoursWarning(false);
        setShowLeadMinutesWarning(false);

        let hasError = false;

        // Validate name
        if (!appState.name.trim()) {
            setShowNameWarning(true);
            hasError = true;
        }

        // Validate min gap
        const minGapInt = parseInt(appState.userPreferences.defaultMinGap);
        if (isNaN(minGapInt) || minGapInt < 0) {
            setShowMinGapWarning(true);
            hasError = true;
        }

        // Validate max working hours
        const maxHoursFloat = parseFloat(appState.userPreferences.defaultMaxWorkingHours);
        if (isNaN(maxHoursFloat) || maxHoursFloat <= 0 || maxHoursFloat > 24) {
            setShowMaxHoursWarning(true);
            hasError = true;
        }

        // Validate lead minutes (only if task reminders are enabled)
        if (appState.userPreferences.taskRemindersEnabled) {
            const leadMinutesInt = parseInt(appState.userPreferences.leadMinutes);
            if (isNaN(leadMinutesInt) || leadMinutesInt <= 0) {
                setShowLeadMinutesWarning(true);
                hasError = true;
            }
        }

        // Return true if no errors (could be used for saving logic)
        return !hasError;
    };
    
    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Preferences</Text>
            <ScrollView style={styles.subContainer}>
                {/* Logout Button */}
                <TouchableOpacity 
                    style={{ ...styles.logoutButton, backgroundColor: theme.COMP_COLOR, borderColor: '#FF4444' }}
                    onPress={handleLogout}
                >
                    <Text style={{ ...styles.logoutButtonText, color: '#FF4444' }}>Sign Out</Text>
                </TouchableOpacity>
                
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
                        onBlur={validateAndSave}
                    />
                    {showNameWarning && <Text style={styles.warning}>Please enter your name</Text>}
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>App Theme</Text>
                <View style={{ ...styles.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.COMP_COLOR }}>
                        <TouchableOpacity 
                            style={(appState.userPreferences.theme == 'light') ? { ...styles.uiModeButtonSelected, borderColor: theme.FOREGROUND} : { ...styles.uiModeButtonDefault, borderColor: (theme.FOREGROUND + '1A')}}
                            onPress={() => setAppState({ ...appState, userPreferences: { ...appState.userPreferences, theme: 'light' }})}
                        >
                            <View>
                                <LightMode width={32} height={32} style={{ marginBottom: 4 }} color={(appState.userPreferences.theme == 'light') ? '#E3CD00' : theme.FOREGROUND}/>
                                <Text style={{ fontFamily: 'AlbertSans', color: theme.FOREGROUND, fontSize: typography.subHeadingSize }}>Light</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={(appState.userPreferences.theme == 'dark') ? { ...styles.uiModeButtonSelected, borderColor: theme.FOREGROUND} : { ...styles.uiModeButtonDefault, borderColor: (theme.FOREGROUND + '1A')}}
                            onPress={() => setAppState({ ...appState, userPreferences: { ...appState.userPreferences, theme: 'dark' }})}
                        >
                            <View>
                                <DarkMode width={32} height={32} style={{ marginBottom: 4 }} color={(appState.userPreferences.theme == 'dark') ? '#8C84E5' : theme.FOREGROUND }/>
                                <Text style={{ fontFamily: 'AlbertSans', color: theme.FOREGROUND, fontSize: typography.subHeadingSize }}>Dark</Text>
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
                                <Text style={{ fontSize: typography.subHeadingSize, fontFamily: 'AlbertSans', color: (appState.userPreferences.defaultStrategy == 'earliest-fit') ? theme.SELECTED_TEXT : theme.FOREGROUND }}>Earliest Fit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <BalancedWorkIcon width={20} height={20}/>
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (appState.userPreferences.defaultStrategy == 'balanced-work') ? theme.SELECTION : theme.INPUT }}
                            onPress={() => {setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultStrategy: 'balanced-work' }})}}
                        >
                                <Text style={{ fontSize: typography.subHeadingSize, fontFamily: 'AlbertSans', color: (appState.userPreferences.defaultStrategy == 'balanced-work') ? theme.SELECTED_TEXT : theme.FOREGROUND }}>Balanced Work</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row',  alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                        <DeadlineOrientedIcon width={20} height={20}/>
                        <TouchableOpacity
                            style={{ ...styles.choiceButton, backgroundColor: (appState.userPreferences.defaultStrategy == 'deadline-oriented') ? theme.SELECTION : theme.INPUT }}
                            onPress={() => {setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultStrategy: 'deadline-oriented' }})}}
                        >
                                <Text style={{ fontSize: typography.subHeadingSize, fontFamily: 'AlbertSans', color: (appState.userPreferences.defaultStrategy == 'deadline-oriented') ? theme.SELECTED_TEXT : theme.FOREGROUND }}>Deadline Oriented</Text>
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
                                keyboardType='numeric'
                                autoCorrect={false}
                                autoCapitalize='words'
                                onChange={ ({ nativeEvent }) => { 
                                    setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultMinGap: nativeEvent.text }})
                                } }
                                onBlur={validateAndSave}
                            />
                            {showMinGapWarning && <Text style={styles.warning}>Must be non-negative</Text>}
                        </View>
                        <View style={{ width: '50%' }}>
                            <Text style={{ ...styles.subHeading, marginTop: 0, marginBottom: 8, color: theme.FOREGROUND }}>Max. Working Hours</Text>
                            <TextInput
                                style={{ ...styles.input, width: '90%', backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                                value={appState.userPreferences.defaultMaxWorkingHours}
                                keyboardType='numeric'
                                autoCorrect={false}
                                autoCapitalize='words'
                                onChange={ ({ nativeEvent }) => { 
                                    setAppState({ ...appState, userPreferences: { ...appState.userPreferences, defaultMaxWorkingHours: nativeEvent.text }})
                                } }
                                onBlur={validateAndSave}
                            />
                            {showMaxHoursWarning && <Text style={styles.warning}>Must be 0-24</Text>}
                        </View>
                    </View>
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Task Reminders</Text>
                <View style={{ ...styles.card, gap: 16, backgroundColor: theme.COMP_COLOR }}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={{ fontSize: typography.subHeadingSize, fontFamily: 'AlbertSans', color: theme.FOREGROUND, opacity: 0.5 }}>{(appState.userPreferences.taskRemindersEnabled) ? 'Enabled' : 'Disabled'}</Text>
                        <Switch
                            trackColor={{ false: '#000000', true: '#4166FB' }}
                            thumbColor={'#FFFFFF'}
                            ios_backgroundColor={'#C0C0C0'}
                            onValueChange={() => { 
                                const currPref = appState.userPreferences.taskRemindersEnabled;
                                setAppState({ ...appState, userPreferences: {...appState.userPreferences, taskRemindersEnabled: !currPref }}) }}
                            value={appState.userPreferences.taskRemindersEnabled}
                        />
                    </View>
                    {appState.userPreferences.taskRemindersEnabled && (
                        <View>
                            <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8}}>
                                <Text style={{ ...styles.subHeading, marginTop: 4, marginBottom: 4, color: theme.FOREGROUND }}>Remind me</Text>
                                <TextInput
                                    style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                                    value={appState.userPreferences.leadMinutes}
                                    keyboardType='numeric'
                                    autoCorrect={false}
                                    autoCapitalize='words'
                                    onChange={ ({ nativeEvent }) => { 
                                        setAppState({ ...appState, userPreferences: { ...appState.userPreferences, leadMinutes: nativeEvent.text } })
                                    } }
                                    onBlur={validateAndSave}
                                />
                                <Text style={{ ...styles.subHeading, marginTop: 4, marginBottom: 4, color: theme.FOREGROUND }}>minutes earlier</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    subContainer: {
        height: '80%',
        paddingBottom: 32,
        paddingHorizontal: padding.SCREEN_PADDING,
    },
    title: {
        fontSize: typography.titleSize,
        fontFamily: 'PinkSunset',
        marginTop: 64,
        marginBottom: 8,
        marginLeft: padding.SCREEN_PADDING,
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
    subHeading: { 
        fontSize: typography.subHeadingSize, 
        fontFamily: 'AlbertSans',
        marginTop: 16,
    },
    input: {
        height: 40,
        borderRadius: 12, 
        fontSize: typography.subHeadingSize,
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
    },
    warning: {
        fontSize: typography.bodySize,
        fontFamily: 'AlbertSans',
        marginTop: 8,
        color: '#FF0000',
        alignSelf: 'center'
    },
    logoutButton: {
        width: '92%',
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonText: {
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        fontWeight: '600',
    },
})

export default PreferencesScreen