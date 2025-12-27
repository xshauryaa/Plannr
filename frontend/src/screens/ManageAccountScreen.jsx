import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TextInput, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppState } from '../context/AppStateContext.js';
import { useUser } from '@clerk/clerk-expo';
import { useAuthenticatedAPI } from '../utils/authenticatedAPI.js';
import { getAvatarList, getAvatarImageSource } from '../utils/avatarUtils.js';
import LoadingScreen from './LoadingScreen.jsx';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing, padding } from '../design/spacing.js';
import { typography } from '../design/typography.js';
import convertDateToScheduleDate from '../utils/dateConversion.js';
import useCurrentTime from '../utils/useCurrentTime.js';

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;

const ManageAccountScreen = () => {
    const { appState, setAppState } = useAppState();
    const { user } = useUser();
    const authenticatedAPI = useAuthenticatedAPI();
    const theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    
    // Debug log to see what's returned
    console.log('🔍 authenticatedAPI:', authenticatedAPI);

    const [userFirstName, setUserFirstName] = useState(appState.name);
    const [userLastName, setUserLastName] = useState(appState.name);
    const [userEmail, setUserEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');
    
    // Avatar selection state
    const [selectedAvatar, setSelectedAvatar] = useState('cat'); // Default avatar
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const avatarList = getAvatarList();
    
    // Load user profile on component mount
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                if (authenticatedAPI?.getUserProfile) {
                    console.log('🔄 Loading user profile for avatar...');
                    const profileData = await authenticatedAPI.getUserProfile();
                    
                    if (profileData.success && profileData.data) {
                        setUserProfile(profileData.data);
                        if (profileData.data.avatarName) {
                            setSelectedAvatar(profileData.data.avatarName);
                            console.log('🐾 Loaded current avatar:', profileData.data.avatarName);
                        }
                    }
                } else {
                    console.warn('⚠️ getUserProfile API not available');
                }
            } catch (error) {
                console.error('💥 Error loading user profile:', error);
            }
        };

        loadUserProfile();
    }, [authenticatedAPI]);
    
    // Birth date state
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Check if user has social login (SSO) enabled
    const hasSocialLogin = user?.externalAccounts && user.externalAccounts.length > 0;

    // Handle avatar selection
    const selectAvatar = async (avatarName) => {
        try {
            setSelectedAvatar(avatarName);
            setShowAvatarPicker(false);
            
            console.log('🐾 Updating avatar to:', avatarName);
            
            if (authenticatedAPI?.updateAvatar) {
                const result = await authenticatedAPI.updateAvatar(avatarName);
                
                if (result.success) {
                    console.log('✅ Avatar updated successfully:', result.data);
                    Alert.alert('Success', 'Avatar updated successfully!');
                } else {
                    console.error('❌ Failed to update avatar:', result);
                    Alert.alert('Error', 'Failed to update avatar. Please try again.');
                }
            } else {
                console.warn('⚠️ updateAvatar API not available');
            }
        } catch (error) {
            console.error('� Error updating avatar:', error);
            Alert.alert('Error', 'Failed to update avatar. Please try again.');
        }
    };

    // Format birth date for display
    const formatBirthDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Handle date picker change
    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || birthDate;
        setShowDatePicker(Platform.OS === 'ios');
        setBirthDate(currentDate);
    };

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Your Account</Text>
            <ScrollView style={{ ...styles.subContainer, backgroundColor: theme.BACKGROUND}}>
                {/* Avatar Selection */}
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, marginBottom: 0 }}>Your Avatar</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR, alignItems: 'center' }}>
                    <TouchableOpacity 
                        style={styles.profileImageContainer}
                        onPress={() => setShowAvatarPicker(true)}
                    >
                        <Image 
                            source={getAvatarImageSource(selectedAvatar)} 
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                        <View style={styles.editIconOverlay}>
                            <Text style={styles.editIconText}>✏️</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={{ ...styles.profileImageHint, color: theme.FOREGROUND }}>
                        Tap to choose your avatar
                    </Text>
                </View>

                {/* Avatar Picker Modal */}
                {showAvatarPicker && (
                    <View style={{ ...styles.avatarPickerModal, backgroundColor: theme.COMP_COLOR }}>
                        <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, textAlign: 'center', marginBottom: 16 }}>
                            Choose Your Avatar
                        </Text>
                        <View style={styles.avatarGrid}>
                            {avatarList.map((avatar) => (
                                <TouchableOpacity
                                    key={avatar.name}
                                    style={[
                                        styles.avatarOption,
                                        selectedAvatar === avatar.name && { ...styles.avatarOptionSelected, borderColor: theme.SELECTION }
                                    ]}
                                    onPress={() => selectAvatar(avatar.name)}
                                >
                                    <Image 
                                        source={avatar.image} 
                                        style={styles.avatarOptionImage}
                                        resizeMode="cover"
                                    />
                                    <Text style={{ ...styles.avatarOptionText, color: theme.FOREGROUND }}>
                                        {avatar.displayName}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={{ ...styles.avatarPickerCloseButton, backgroundColor: theme.INPUT }}
                            onPress={() => setShowAvatarPicker(false)}
                        >
                            <Text style={{ ...styles.avatarPickerCloseText, color: theme.FOREGROUND }}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* First and Last Name */}
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, marginBottom: 0 }}>Your Name</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <Text style={{ ...styles.subHeading, marginBottom: 8, color: theme.FOREGROUND }}>First Name</Text>
                    <TextInput
                        style={{ ...styles.input, color: theme.FOREGROUND, backgroundColor: theme.INPUT, marginBottom: 12 }}
                        value={userFirstName}
                        onChangeText={setUserFirstName}
                    />
                    <Text style={{ ...styles.subHeading, marginBottom: 8, color: theme.FOREGROUND }}>Last Name</Text>
                    <TextInput
                        style={{ ...styles.input, color: theme.FOREGROUND, backgroundColor: theme.INPUT }}
                        value={userLastName}
                        onChangeText={setUserLastName}
                    />
                </View>

                {/* Email */}
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, marginBottom: 0, marginTop: 16 }}>Your Email</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <TextInput
                        style={{ 
                            ...styles.input, 
                            color: theme.FOREGROUND, 
                            opacity: hasSocialLogin ? 0.6 : 1,
                            backgroundColor: theme.INPUT 
                        }}
                        value={userEmail}
                        onChangeText={hasSocialLogin ? undefined : setUserEmail}
                        editable={!hasSocialLogin}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {hasSocialLogin && (
                        <Text style={{ ...styles.disabledText, color: theme.FOREGROUND_SECONDARY }}>
                            You cannot edit your email since you have social login connected to your Plannr account.
                        </Text>
                    )}
                </View>

                {/* Birth Date */}
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, marginBottom: 0, marginTop: 16 }}>Your Birth Date</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <TouchableOpacity 
                        style={{ ...styles.datePickerButton, backgroundColor: theme.INPUT }}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={{ ...styles.datePickerText, color: theme.FOREGROUND }}>
                            {formatBirthDate(birthDate)}
                        </Text>
                    </TouchableOpacity>
                    
                    {showDatePicker && (
                        <View>
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={birthDate}
                                mode="date"
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                maximumDate={new Date()} // Can't select future dates
                                minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
                                themeVariant={appState.userPreferences.theme}
                            />
                            <TouchableOpacity 
                                style={styles.doneButton}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    )}
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
    title: {
        fontSize: typography.titleSize,
        fontFamily: 'PinkSunset',
        marginTop: spacing.SPACING_16,
        marginBottom: SPACE,
        marginLeft: padding.SCREEN_PADDING,
    },
    subHeading: {
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        marginBottom: SPACE,
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
    input: {
        height: 40,
        borderRadius: 12, 
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    disabledText: {
        fontSize: typography.bodySize,
        fontFamily: 'AlbertSans',
        marginTop: 8,
        opacity: 0.6,
        fontStyle: 'italic',
    },
    datePickerButton: {
        height: 40,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    datePickerText: {
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
    },
    doneButton: {
        width: '92%',
        borderRadius: 12,
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        alignSelf: 'center',
        marginTop: 8,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#E0E0E0',
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImagePlaceholderText: {
        fontSize: 48,
        fontFamily: 'PinkSunset',
        fontWeight: 'bold',
    },
    editIconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#000',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    editIconText: {
        fontSize: 16,
    },
    profileImageHint: {
        fontSize: typography.bodySize,
        fontFamily: 'AlbertSans',
        opacity: 0.7,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: typography.subHeadingSize,
        fontFamily: 'PinkSunset',
        marginBottom: 20,
        textAlign: 'center',
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    avatarOption: {
        margin: 8,
        padding: 4,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedAvatarOption: {
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    avatarImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    selectButton: {
        backgroundColor: '#007AFF',
    },
    modalButtonText: {
        fontSize: typography.bodySize,
        fontFamily: 'AlbertSans',
        fontWeight: 'bold',
    },
    cancelButtonText: {
        color: '#333',
    },
    selectButtonText: {
        color: '#FFF',
    },
});

export default ManageAccountScreen;