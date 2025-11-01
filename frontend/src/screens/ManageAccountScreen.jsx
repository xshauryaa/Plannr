import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TextInput, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useAppState } from '../context/AppStateContext.js';
import { useUser } from '@clerk/clerk-expo';
import { useAuthenticatedAPI } from '../utils/authenticatedAPI.js';
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
    
    // Profile picture state
    const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    // Birth date state
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Check if user has social login (SSO) enabled
    const hasSocialLogin = user?.externalAccounts && user.externalAccounts.length > 0;

    // Upload image to server
    const uploadProfileImage = async (imageUri) => {
        try {
            setUploadingImage(true);
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('profileImage', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'profile.jpg',
            });

            console.log('📤 Uploading profile image...');
            
            const response = await authenticatedAPI.makeAuthenticatedRequest('/api/users/upload-avatar', {
                method: 'POST',
                headers: {
                    // Don't set Content-Type for multipart/form-data - let fetch set it automatically
                    // 'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (response.success) {
                console.log('✅ Profile image uploaded successfully');
                console.log('🔗 New avatar URL:', response.data.avatarUrl);
                
                // Update local state with new image URL
                setProfileImage(response.data.avatarUrl);
                
                // Optionally update app state if you store user data there
                // if (appState.userProfile) {
                //     setAppState({
                //         ...appState,
                //         userProfile: {
                //             ...appState.userProfile,
                //             avatarUrl: response.data.avatarUrl
                //         }
                //     });
                // }
                
                Alert.alert('Success', 'Profile picture updated successfully!');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error) {
            console.error('💥 Error uploading profile image:', error);
            Alert.alert(
                'Upload Failed', 
                'Failed to upload your profile picture. Please try again.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Revert to previous image
                            setProfileImage(user?.imageUrl || null);
                        }
                    }
                ]
            );
        } finally {
            setUploadingImage(false);
        }
    };

    // Profile picture picker
    const pickImage = async () => {
        // Request permissions first
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'We need camera roll permissions to change your profile picture.');
            return;
        }

        // Show action sheet to choose between camera and gallery
        Alert.alert(
            'Select Profile Picture',
            'Choose how you would like to select your new profile picture',
            [
                {
                    text: 'Camera',
                    onPress: () => openCamera(),
                },
                {
                    text: 'Photo Library',
                    onPress: () => openImageLibrary(),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'We need camera permissions to take a photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            // Immediately show the new image
            setProfileImage(result.assets[0].uri);
            // Upload to server
            await uploadProfileImage(result.assets[0].uri);
        }
    };

    const openImageLibrary = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            // Immediately show the new image
            setProfileImage(result.assets[0].uri);
            // Upload to server
            await uploadProfileImage(result.assets[0].uri);
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
                {/* Profile Picture */}
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, marginBottom: 0 }}>Your Profile Picture</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR, alignItems: 'center' }}>
                    <TouchableOpacity 
                        style={styles.profileImageContainer}
                        onPress={pickImage}
                    >
                        {profileImage ? (
                            <Image 
                                source={{ uri: profileImage }} 
                                style={styles.profileImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={{ ...styles.profileImagePlaceholder, backgroundColor: theme.INPUT }}>
                                <Text style={{ ...styles.profileImagePlaceholderText, color: theme.FOREGROUND }}>
                                    {appState.name ? appState.name.charAt(0).toUpperCase() : '+'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.editIconOverlay}>
                            <Text style={styles.editIconText}>✏️</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={{ ...styles.profileImageHint, color: theme.FOREGROUND }}>
                        Tap to change your profile picture
                    </Text>
                </View>

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
});

export default ManageAccountScreen;