import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { Animated, Dimensions, PanResponder, View, Pressable, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { spacing } from '../design/spacing.js';
import { typography } from '../design/typography.js';
import { lightColor } from '../design/colors.js';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_TRANSLATE_Y = SCREEN_HEIGHT * 0.5;

const SPACE = (SCREEN_HEIGHT > 900) ? spacing.SPACING_4 : (SCREEN_HEIGHT > 800) ? spacing.SPACING_3 : spacing.SPACING_2

const VerificationBottomSheet = forwardRef(({ onVerifyCode, email, loading }, ref) => {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const inputRefs = useRef([]);

    // Initialize input refs
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
            onPanResponderMove: (_, gestureState) => {
                const newY = Math.max(0, gestureState.dy);
                translateY.setValue(newY);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 80) {
                    hide();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const show = () => {
        // Reset code when showing
        setCode(['', '', '', '', '', '']);
        setFocusedIndex(0);
        
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Focus first input after animation
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        });
    };

    const hide = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleCodeChange = (text, index) => {
        // Only allow single digit
        const digit = text.slice(-1);
        
        const newCode = [...code];
        newCode[index] = digit;
        setCode(newCode);

        // Move to next input if digit entered
        if (digit && index < 5) {
            setFocusedIndex(index + 1);
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (index === 5 && digit) {
            const fullCode = newCode.join('');
            if (fullCode.length === 6) {
                setTimeout(() => handleVerify(fullCode), 100);
            }
        }
    };

    const handleKeyPress = (e, index) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            setFocusedIndex(index - 1);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = (verificationCode = null) => {
        const fullCode = verificationCode || code.join('');
        if (fullCode.length === 6) {
            onVerifyCode(fullCode);
        }
    };

    const isCodeComplete = code.every(digit => digit !== '');

    useImperativeHandle(ref, () => ({
        show,
        hide,
    }));

    return (
        <>
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#000000' + '99',
                    opacity: backdropOpacity,
                }}
            >
                <Pressable style={{ flex: 1 }} onPress={hide} />
            </Animated.View>

            <Animated.View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateY }],
                    backgroundColor: lightColor.BACKGROUND,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    paddingBottom: 16,
                    paddingHorizontal: 16,
                    maxHeight: MAX_TRANSLATE_Y,
                }}
            >
                <View
                    {...panResponder.panHandlers}
                    style={{
                        width: '100%',
                        alignItems: 'center',
                        paddingVertical: 10,
                    }}
                >
                    <View style={{ height: 8, width: 40, backgroundColor: lightColor.INPUT, marginBottom: SPACE, alignSelf: 'center', borderRadius: 12 }} />
                    
                    <Text style={{ fontSize: typography.headingSize, fontFamily: 'AlbertSans', color: lightColor.FOREGROUND, marginBottom: SPACE/2, alignSelf: 'center' }}>Verify Your Email</Text>
                    <Text style={{ fontSize: typography.bodySize, fontFamily: 'AlbertSans', color: lightColor.FOREGROUND + '80', marginBottom: SPACE, alignSelf: 'center', textAlign: 'center' }}>
                        We sent a 6-digit code to {email}
                    </Text>
                </View>
                
                {/* Code Input Fields */}
                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(el) => inputRefs.current[index] = el}
                            style={[
                                styles.codeInput,
                                { 
                                    backgroundColor: lightColor.INPUT,
                                    color: lightColor.FOREGROUND,
                                    borderColor: focusedIndex === index ? '#000' : 'transparent',
                                    borderWidth: focusedIndex === index ? 2 : 0,
                                }
                            ]}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            onFocus={() => setFocusedIndex(index)}
                            keyboardType="numeric"
                            maxLength={1}
                            textAlign="center"
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: isCodeComplete ? '#000' : '#888' }
                    ]}
                    onPress={() => handleVerify()}
                    disabled={!isCodeComplete || loading}
                >
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>
                        {loading ? "Verifying..." : "Verify Code"}
                    </Text>
                </TouchableOpacity>

                {/* Resend Code */}
                <TouchableOpacity
                    style={styles.resendButton}
                    onPress={() => {
                        // TODO: Add resend functionality
                        console.log("Resend code");
                    }}
                >
                    <Text style={{ color: lightColor.FOREGROUND + '80', fontFamily: 'AlbertSans', fontSize: typography.bodySize, textDecorationLine: 'underline' }}>
                        Didn't receive the code? Resend
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </>
    );
});

const styles = StyleSheet.create({
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACE * 1.5,
        paddingHorizontal: 20,
    },
    codeInput: {
        width: 45,
        height: 55,
        borderRadius: 12,
        fontSize: typography.headingSize,
        fontFamily: 'AlbertSans',
        fontWeight: 'bold',
    },
    button: {
        width: '100%',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACE,
    },
    resendButton: {
        alignSelf: 'center',
        paddingVertical: 8,
    }
});

export default VerificationBottomSheet;
