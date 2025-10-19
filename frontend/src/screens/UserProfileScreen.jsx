import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { useAuthenticatedAPI } from '../utils/authenticatedAPI.js';
import LoadingScreen from './LoadingScreen.jsx';
import MenuButton from '../components/MenuButton.jsx';
import LightMode from '../../assets/system-icons/LightMode.svg';
import DarkMode from '../../assets/system-icons/DarkMode.svg';
import Link from '../../assets/system-icons/Link.svg';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing, padding } from '../design/spacing.js';
import { typography } from '../design/typography.js';
import convertDateToScheduleDate from '../utils/dateConversion.js';
import useCurrentTime from '../utils/useCurrentTime.js';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;

const UserProfileScreen = ({ navigation }) => {
    const { appState, setAppState, storageLoaded } = useAppState();
    const currentTime = useCurrentTime();
    const { getUserProfile } = useAuthenticatedAPI();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Early return if storage not loaded
    if (!storageLoaded) {
        return <LoadingScreen />;
    }

    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    const todaysDate = convertDateToScheduleDate(currentTime);

    // Fetch user profile data including avatar
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                console.log('🔄 Starting to fetch user profile...');
                const profileData = await getUserProfile();
                console.log('📦 Raw profile data received:', JSON.stringify(profileData, null, 2));
                
                if (profileData.success) {
                    setUserProfile(profileData.data);
                    console.log('✅ User profile set:', JSON.stringify(profileData.data, null, 2));
                    console.log('🖼️ Avatar URL specifically:', profileData.data?.avatarUrl);
                } else {
                    console.log('❌ Profile fetch failed:', profileData);
                }
            } catch (error) {
                console.error('💥 Failed to fetch user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    // Debug userProfile changes
    useEffect(() => {
        console.log('🔍 UserProfile state changed:', userProfile);
        console.log('🖼️ Current avatarUrl:', userProfile?.avatarUrl);
    }, [userProfile]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Hey, {appState.name}!</Text>
            <ScrollView style={{ ...styles.subContainer, backgroundColor: theme.BACKGROUND}}>
                {/* Avatar Container */}
                <View style={{ height: 164, width: 164, alignSelf: 'center', marginBottom: 2*SPACE }}>
                    <LinearGradient style={{ height: 164, width: 164, alignSelf: 'center', borderRadius: 120 }} colors={[theme.GRADIENT_START, theme.GRADIENT_END]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                    <View style={{ height: 156, width: 156, borderRadius: 120, backgroundColor: theme.BACKGROUND, zIndex: 1, position: 'absolute', top: 4, left: 4 }}/>
                    <View style={{ height: 148, width: 148, borderRadius: 120, backgroundColor: theme.FOREGROUND, zIndex: 2, position: 'absolute', top: 8, left: 8, overflow: 'hidden' }}>
                        {userProfile?.avatarUrl ? (
                            <Image 
                                source={{ uri: userProfile.avatarUrl }} 
                                style={{ width: '100%', height: '100%', borderRadius: 120 }}
                                resizeMode="cover"
                                onLoad={() => console.log('🖼️ Image loaded successfully:', userProfile.avatarUrl)}
                                onError={(error) => {
                                    console.error('💥 Image load error:', error.nativeEvent.error);
                                    console.error('🔗 Failed URL:', userProfile.avatarUrl);
                                    console.error('🔍 URL Analysis:');
                                    console.log('  - Is HTTPS:', userProfile.avatarUrl.startsWith('https://'));
                                    console.log('  - Has file extension:', /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(userProfile.avatarUrl));
                                    console.log('  - Is Imgur:', userProfile.avatarUrl.includes('imgur.com'));
                                }}
                                onLoadStart={() => console.log('🔄 Image load started:', userProfile.avatarUrl)}
                                defaultSource={require('../../assets/images/light/NoTasks.png')}
                            />
                        ) : (
                            <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: theme.BACKGROUND, fontSize: 48, fontFamily: 'PinkSunset' }}>
                                    {appState.name ? appState.name.charAt(0).toUpperCase() : '?'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                <MenuButton
                    broad={true}
                    title="Manage Your Account"
                    icon="Profile"
                    navTo={() => { navigation.navigate("ManageAccount") }}
                />
                <View style={{ ...styles.horizontalGrid, backgroundColor: theme.BACKGROUND }}>
                    <MenuButton
                        broad={false}
                        title="Archived Schedules"
                        icon="Saved"
                        navTo={() => { navigation.navigate("SavedSchedules") }}
                    />
                    <MenuButton
                        broad={false}
                        title="Your Productivity Analytics"
                        icon="Productivity"
                        navTo={() => { navigation.navigate("ProductivityAnalytics") }}
                    />
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Settings</Text>
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
                <View style={{ ...styles.card, gap: 16, backgroundColor: theme.COMP_COLOR }}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={{ fontSize: typography.subHeadingSize, fontFamily: 'AlbertSans', color: theme.FOREGROUND, opacity: 0.5 }}>Task Reminders {(appState.userPreferences.taskRemindersEnabled) ? 'Enabled' : 'Disabled'}</Text>
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
                                />
                                <Text style={{ ...styles.subHeading, marginTop: 4, marginBottom: 4, color: theme.FOREGROUND }}>minutes earlier</Text>
                            </View>
                        </View>
                    )}
                </View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, marginTop: 16 }}>Support & Community</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>About Plannr</Text>
                        <Link width={24} height={24} style={{ marginRight: 8 }} color={'#000000'} opacity={0.5} />
                    </TouchableOpacity>
                    <View style={{ ...styles.divider, backgroundColor: theme.FOREGROUND }} />
                    <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Support & FAQs</Text>
                        <Link width={24} height={24} style={{ marginRight: 8 }} color={'#000000'} opacity={0.5} />
                    </TouchableOpacity>
                    <View style={{ ...styles.divider, backgroundColor: theme.FOREGROUND }} />
                    <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Request a Feature</Text>
                        <Link width={24} height={24} style={{ marginRight: 8 }} color={'#000000'} opacity={0.5} />
                    </TouchableOpacity>
                    <View style={{ ...styles.divider, backgroundColor: theme.FOREGROUND }} />
                    <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Join Beta</Text>
                        <Link width={24} height={24} style={{ marginRight: 8 }} color={'#000000'} opacity={0.5} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: padding.SCREEN_PADDING,
        height: '100%',
    },
    subContainer: {
        width: width,
        alignSelf: 'center',
        alignContent: 'center',
        paddingHorizontal: padding.SCREEN_PADDING,
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
    title: {
        fontSize: typography.titleSize,
        fontFamily: 'PinkSunset',
        marginTop: spacing.SPACING_16,
        marginBottom: SPACE,
        alignSelf: 'center'
    },
    subHeading: {
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
    },
    horizontalGrid: {
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACE
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
    input: {
        height: 40,
        borderRadius: 12, 
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    divider: {
        height: 1,
        opacity: 0.1,
        marginVertical: 12,
        marginHorizontal: 4,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',   
    }
});

export default UserProfileScreen;