import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { lightColor, darkColor } from '../design/colors.js';
import { typography } from '../design/typography.js';
import { spacing, padding } from '../design/spacing.js';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ message = "Loading..." }) => {
    const { appState } = useAppState();
    const theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const dotAnimations = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0)
    ]).current;

    useEffect(() => {
        // Initial fade in and scale animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();

        // Continuous rotation animation for the loader
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation for the app name
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Animated dots
        const animateDots = () => {
            const animations = dotAnimations.map((dotAnim, index) => 
                Animated.sequence([
                    Animated.delay(index * 200),
                    Animated.loop(
                        Animated.sequence([
                            Animated.timing(dotAnim, {
                                toValue: 1,
                                duration: 600,
                                easing: Easing.inOut(Easing.quad),
                                useNativeDriver: true,
                            }),
                            Animated.timing(dotAnim, {
                                toValue: 0,
                                duration: 600,
                                easing: Easing.inOut(Easing.quad),
                                useNativeDriver: true,
                            })
                        ])
                    )
                ])
            );
            Animated.parallel(animations).start();
        };

        animateDots();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.BACKGROUND }]}>
            <Animated.View 
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                {/* App Logo/Icon */}
                <Animated.View 
                    style={[
                        styles.logoContainer,
                        {
                            transform: [{ scale: pulseAnim }]
                        }
                    ]}
                >
                    <View style={[styles.logo, { backgroundColor: theme.COMP_COLOR }]}>
                        <Text style={[styles.logoText, { color: theme.FOREGROUND }]}>P</Text>
                    </View>
                </Animated.View>

                {/* App Name */}
                <Animated.Text 
                    style={[
                        styles.appName, 
                        { color: theme.FOREGROUND }
                    ]}
                >
                    Plannr
                </Animated.Text>

                {/* Loading Spinner */}
                <View style={styles.loaderContainer}>
                    <Animated.View 
                        style={[
                            styles.spinner,
                            { borderTopColor: theme.FOREGROUND },
                            { transform: [{ rotate: spin }] }
                        ]} 
                    />
                </View>

                {/* Loading Text with Animated Dots */}
                <View style={styles.loadingTextContainer}>
                    <Text style={[styles.loadingText, { color: theme.FOREGROUND_SECONDARY }]}>
                        {message.replace('...', '')}
                    </Text>
                    <View style={styles.dotsContainer}>
                        {dotAnimations.map((dotAnim, index) => (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.dot,
                                    { backgroundColor: theme.FOREGROUND_SECONDARY },
                                    {
                                        opacity: dotAnim,
                                        transform: [{ 
                                            translateY: dotAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -8]
                                            }) 
                                        }]
                                    }
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarBackground, { backgroundColor: theme.INPUT }]}>
                        <Animated.View 
                            style={[
                                styles.progressBar,
                                { backgroundColor: theme.FOREGROUND },
                                {
                                    transform: [{
                                        translateX: rotateAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-width * 0.6, width * 0.6]
                                        })
                                    }]
                                }
                            ]}
                        />
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: padding.SCREEN_PADDING,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    logoContainer: {
        marginBottom: spacing.SPACING_12,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: 36,
        fontFamily: 'PinkSunset',
        fontWeight: 'bold',
    },
    appName: {
        fontSize: typography.titleSize + 8,
        fontFamily: 'PinkSunset',
        marginBottom: spacing.SPACING_16,
        textAlign: 'center',
    },
    loaderContainer: {
        marginVertical: spacing.SPACING_8,
    },
    spinner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: 'transparent',
        borderStyle: 'solid',
    },
    loadingTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.SPACING_8,
        marginBottom: spacing.SPACING_12,
    },
    loadingText: {
        fontSize: typography.bodySize,
        fontFamily: 'AlbertSans',
        marginRight: spacing.SPACING_1,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 1,
    },
    progressBarContainer: {
        width: '60%',
        marginTop: spacing.SPACING_4,
    },
    progressBarBackground: {
        height: 2,
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    progressBar: {
        position: 'absolute',
        height: '100%',
        width: '30%',
        borderRadius: 1,
    },
});

export default LoadingScreen;