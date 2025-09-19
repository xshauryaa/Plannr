import React, { useState, useRef, useEffect } from 'react'
import { Text, View, Animated, Image, StyleSheet, Dimensions, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useAppState } from '../context/AppStateContext';
import { lightColor, darkColor } from '../design/colors.js'
import { spacing, padding } from '../design/spacing.js'
import { typography  } from '../design/typography.js';
import * as Font from 'expo-font';
const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2

const OnboardingScreen = ({ navigation }) => {
    const { setAppState } = useAppState();

    const [fontsLoaded] = Font.useFonts({
            'PinkSunset': require('../../assets/fonts/PinkSunset-Regular.ttf'),
            'AlbertSans': require('../../assets/fonts/AlbertSans-VariableFont_wght.ttf'),
    });

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
    const [currentStep, setCurrentStep] = useState(0);
    const isButtonDisabled = () => {
        if (currentStep === 0) {
            return name.trim() === '';
        } else if (currentStep === 1) {
            return preferredStrategy.trim() === '';
        } else if (currentStep === 2) {
            return false;
        }
    }

    // Y-coordinate for Logo
    const indicatorYLogo = useRef(new Animated.Value(0)).current;

    // Information for Name Card
    const [name, setName] = useState('');
    const indicatorXName = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    

    // Information for Strategy Card
    const [preferredStrategy, setPreferredStrategy] = useState('');
    const indicatorXStrategy = useRef(new Animated.Value(0)).current;

    // Information for Reminders Card
    const [remindersOn, setRemindersOn] = useState(true);
    const indicatorXReminders = useRef(new Animated.Value(0)).current;

    const enterName = (name) => {
        setAppState(prevState => ({
            ...prevState,
            name: name.trim(),
        }));
        Animated.timing(indicatorXName, {
            toValue: -width,
            duration: 500,
            useNativeDriver: true,
        }).start();
        Animated.timing(indicatorXStrategy, {
            toValue: -width,
            duration: 500,
            useNativeDriver: true,
        }).start();
        setCurrentStep(1);
    };

    const enterStrategy = (strategy) => {
        setAppState(prevState => ({
            ...prevState,
            userPreferences: {
                ...prevState.userPreferences,
                defaultStrategy: strategy,
            }
        }));
        Animated.timing(indicatorXStrategy, {
            toValue: -(2*width),
            duration: 500,
            useNativeDriver: true,
        }).start();
        Animated.timing(indicatorXReminders, {
            toValue: -(2*width),
            duration: 500,
            useNativeDriver: true,
        }).start();
        setCurrentStep(2);
    };

    useEffect(() => {
        if (!fontsLoaded) return;
        
        const timeout = setTimeout(() => {
            Animated.timing(indicatorYLogo, {
                toValue: -250,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }, 1000);

        return () => clearTimeout(timeout);
    }, [fontsLoaded, indicatorYLogo, fadeAnim]);
    
    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <Animated.View style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', transform: [{ translateY: indicatorYLogo }] }}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={{ width: 180, height: 180, marginBottom: SPACE, alignSelf: 'center' }}
                />
                <Text style={styles.subHeading}>Welcome to</Text>
                <Text style={styles.title}>Plannr</Text>
            </Animated.View>
            <ScrollView horizontal scrollEnabled={false} style={{ width: '100%' }}>
                <Animated.View style={{ ...styles.card, backgroundColor: lightColor.COMP_COLOR, transform: [{ translateX: indicatorXName }], opacity: fadeAnim }}>
                    <Text style={{ ...styles.subHeading, color: lightColor.FOREGROUND, fontSize: typography.subHeadingSize }}>🙋🏻‍♂️ What's your name, friend?</Text>
                    <TextInput
                        style={{ ...styles.input, backgroundColor: lightColor.INPUT, color: lightColor.FOREGROUND }}
                        value={name}
                        autoCorrect={false}
                        autoCapitalize='words'
                        onChange={ ({ nativeEvent }) => { 
                            setName(nativeEvent.text)
                        } }
                    />
                    <Text style={{ ...styles.subHeading, color: lightColor.FOREGROUND, fontSize: typography.subHeadingSize - 2, marginBottom: 0, marginTop: SPACE }}>You can change this later, don't worry</Text>
                </Animated.View>
                <Animated.View style={{ ...styles.card, backgroundColor: lightColor.COMP_COLOR, transform: [{ translateX: indicatorXStrategy }] }}>
                    <Text style={{ ...styles.subHeading, color: lightColor.FOREGROUND, fontSize: typography.subHeadingSize }}>How do you like to get your work done?</Text>
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between' }}>
                        <TouchableOpacity 
                            style={{ ...styles.choiceButton, backgroundColor: (preferredStrategy == 'earliest-fit') ? '#000' : lightColor.INPUT, marginBottom: 0, width: (width - padding.SCREEN_PADDING * 2) / 3 - 20 }}
                            onPress={() => { setPreferredStrategy('earliest-fit') }}
                        >
                            <Text style={{ ...styles.subHeading, marginBottom: 0, textAlign: 'center' }}>⚡</Text>
                            <Text style={{ ...styles.subHeading, fontSize: typography.subHeadingSize * 0.8, marginBottom: 0, textAlign: 'center', color: (preferredStrategy == 'earliest-fit') ? '#FFF' : '#000' }}>Get it done early</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{ ...styles.choiceButton, backgroundColor: (preferredStrategy == 'balanced-work') ? '#000' : lightColor.INPUT, marginBottom: 0, width: (width - padding.SCREEN_PADDING * 2) / 3 - 20 }}
                            onPress={() => { setPreferredStrategy('balanced-work') }}
                        >
                            <Text style={{ ...styles.subHeading, marginBottom: 0, textAlign: 'center' }}>⚖️</Text>
                            <Text style={{ ...styles.subHeading, fontSize: typography.subHeadingSize * 0.8, marginBottom: 0, textAlign: 'center', color: (preferredStrategy == 'balanced-work') ? '#FFF' : '#000' }}>Spread my work out</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{ ...styles.choiceButton, backgroundColor: (preferredStrategy == 'deadline-oriented') ? '#000' : lightColor.INPUT, marginBottom: 0, width: (width - padding.SCREEN_PADDING * 2) / 3 - 20 }}
                            onPress={() => { setPreferredStrategy('deadline-oriented') }}
                        >
                            <Text style={{ ...styles.subHeading, marginBottom: 0, textAlign: 'center' }}>🚨</Text>
                            <Text style={{ ...styles.subHeading, fontSize: typography.subHeadingSize * 0.8, marginBottom: 0, textAlign: 'center', color: (preferredStrategy == 'deadline-oriented') ? '#FFF' : '#000' }}>Deadlines get me going</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ ...styles.subHeading, color: lightColor.FOREGROUND, fontSize: typography.subHeadingSize - 2, marginBottom: 0, marginTop: SPACE }}>You can change this later, don't worry</Text>
                </Animated.View>
                <Animated.View style={{ ...styles.card, backgroundColor: lightColor.COMP_COLOR, transform: [{ translateX: indicatorXStrategy }] }}>
                    <Text style={{ ...styles.subHeading, color: lightColor.FOREGROUND, fontSize: typography.subHeadingSize }}>Would you like task reminders?</Text>
                        <TouchableOpacity 
                            style={{ ...styles.choiceButton, backgroundColor: (remindersOn == true) ? '#000' : lightColor.INPUT }}
                            onPress={() => { setRemindersOn(true); }}
                        >
                            <Text style={{ ...styles.subHeading, fontSize: typography.subHeadingSize, marginBottom: 0, textAlign: 'center', color: (remindersOn == true) ? '#FFF' : '#000' }}>⏰ Yes! I'd like reminders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{ ...styles.choiceButton, backgroundColor: (remindersOn == false) ? '#000' : lightColor.INPUT, marginBottom: 0 }}
                            onPress={() => { setRemindersOn(false); }}
                        >
                            <Text style={{ ...styles.subHeading, fontSize: typography.subHeadingSize * 0.8, marginBottom: 0, textAlign: 'center', color: (remindersOn == false) ? '#FFF' : '#000' }}>👎 No</Text>
                        </TouchableOpacity>
                    <Text style={{ ...styles.subHeading, color: lightColor.FOREGROUND, fontSize: typography.subHeadingSize - 2, marginBottom: 0, marginTop: SPACE }}>You can change this later, don't worry</Text>
                </Animated.View>
            </ScrollView>
            <AnimatedTouchable
                style={{ 
                    ...styles.button, 
                    opacity: fadeAnim,
                    backgroundColor: isButtonDisabled() ? '#888' : '#000'
                }}
                onPress={() => {
                    if (currentStep === 0) {
                        enterName(name)
                    } else if (currentStep === 1) {
                        enterStrategy(preferredStrategy)
                    } else if (currentStep === 2) {
                        setAppState(prevState => ({
                            ...prevState,
                            userPreferences: {
                                ...prevState.userPreferences,
                                taskRemindersEnabled: remindersOn,
                            }
                        }));
                        navigation.replace('Walkthrough');
                    }
                }}
                disabled={isButtonDisabled()}
            >
                <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Next</Text>
            </AnimatedTouchable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: padding.SCREEN_PADDING,
        backgroundColor: lightColor.BACKGROUND,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: typography.titleSize * 1.5,
        fontFamily: 'PinkSunset',
        marginBottom: SPACE,
        alignSelf: 'center',
    },
    subHeading: {
        fontSize: typography.subHeadingSize * 1.5,
        fontFamily: 'AlbertSans',
        marginBottom: SPACE,
        alignSelf: 'center',
    },
    card: {
        width: width - padding.SCREEN_PADDING * 2,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        padding: 16,
        marginHorizontal: padding.SCREEN_PADDING,
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
    button: {
        width: '90%',
        borderRadius: 12,
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16,
        gap: 12,
        position: 'absolute',
        bottom: 32,
    },
    choiceButton: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#F0F0F0' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
});

export default OnboardingScreen;