import { useSignUp, useClerk, useSSO } from "@clerk/clerk-expo";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, TextInput, Text, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { TokenCacheUtils } from '../../cache.js';
import { spacing, padding } from "../design/spacing.js";
import { typography } from "../design/typography.js";
import { lightColor } from "../design/colors.js";
import { EyeIcon, EyeClosedIcon } from "lucide-react-native";
const { width, height } = Dimensions.get('window');
import Google from '../../assets/auth/Google.svg';
import Apple from '../../assets/auth/Apple.svg';
import VerificationBottomSheet from '../components/VerificationBottomSheet.jsx';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()


const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2

const SignUpScreen = ({ navigation }) => {
    useWarmUpBrowser();

    const { signUp, setActive, isLoaded } = useSignUp();
    const clerk = useClerk();
    const { startSSOFlow } = useSSO();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const verificationBottomSheetRef = useRef(null);



    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert("Please enter both email and password.");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Password must be at least 8 characters long.");
            return;
        }

        if (!isLoaded) return;

        setLoading(true);

        try {
            const signUpAttempt = await signUp.create({
                emailAddress: email,
                password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            setPendingVerification(true)

            // Show verification bottom sheet
            verificationBottomSheetRef.current?.show();
        } catch (err) {
            Alert.alert("Error signing up. Please check your details and try again.");
            console.error(JSON.stringify(err, null, 2));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (code) => {
        if (!isLoaded || !pendingVerification) return;

        setVerifying(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                verificationBottomSheetRef.current?.hide();
                
                // Log successful authentication
                if (__DEV__) {
                    console.log("User successfully signed up and verified");
                    await TokenCacheUtils.getDebugInfo();
                }
                // User is now signed up and signed in
            } else {
                Alert.alert("Verification failed. Please check the code and try again.");
                console.error(JSON.stringify(completeSignUp, null, 2));
            }
        } catch (err) {
            Alert.alert("Invalid verification code. Please try again.");
            console.error(JSON.stringify(err, null, 2));
        } finally {
            setVerifying(false);
        }
    };

    const handleGoogleSignUp = useCallback(async () => {
        if (loading) return; // Prevent multiple simultaneous requests
        
        setLoading(true);
        
        try {
            // Start the authentication process by calling `startSSOFlow()`
            const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
                strategy: 'oauth_google'
            });

            // If sign in was successful, set the active session
            if (createdSessionId) {
                await setActive({
                    session: createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            console.log("Session task found:", session?.currentTask);
                            return;
                        }
                        
                        // Log successful authentication
                        if (__DEV__) {
                            console.log("User successfully signed up/in with Google");
                            await TokenCacheUtils.getDebugInfo();
                        }
                    },
                });
            } else {
                console.log("Google Sign-In completed but no session created. Missing requirements may need to be handled.");
                Alert.alert(
                    "Additional Setup Required", 
                    "Please complete your account setup to continue."
                );
            }
        } catch (err) {
            console.error("Google Sign-In Error:", JSON.stringify(err, null, 2));
            
            // Handle specific error cases
            if (err.errors && err.errors.length > 0) {
                const errorCode = err.errors[0]?.code;
                const errorMessage = err.errors[0]?.message;
                
                switch (errorCode) {
                    case 'form_identifier_exists':
                        Alert.alert(
                            "Account Exists", 
                            "An account with this Google account already exists. Please sign in instead."
                        );
                        break;
                    case 'oauth_access_denied':
                        console.log("User cancelled Google Sign-In");
                        break;
                    case 'clerk_network_error':
                        Alert.alert(
                            "Network Error", 
                            "Please check your internet connection and try again."
                        );
                        break;
                    default:
                        Alert.alert(
                            "Sign-In Error", 
                            errorMessage || "Something went wrong with Google Sign-In. Please try again."
                        );
                }
            } else {
                Alert.alert(
                    "Sign-In Error", 
                    "Something went wrong with Google Sign-In. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    }, [loading, startSSOFlow]);

    const handleAppleSignUp = useCallback(async () => {
        if (loading) return; // Prevent multiple simultaneous requests
        
        setLoading(true);
        
        try {
            // Start the authentication process by calling `startSSOFlow()`
            const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
                strategy: 'oauth_apple'
            });

            // If sign in was successful, set the active session
            if (createdSessionId) {
                await setActive({
                    session: createdSessionId,
                    // Check for session tasks and navigate to custom UI to help users resolve them
                    // See https://clerk.com/docs/guides/development/custom-flows/overview#session-tasks
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            console.log("Session task found:", session?.currentTask);
                            // Handle any additional session tasks if needed
                            // For most cases, this can be left as is
                            return;
                        }
                        
                        // Log successful authentication
                        if (__DEV__) {
                            console.log("User successfully signed up/in with Apple");
                            await TokenCacheUtils.getDebugInfo();
                        }
                    },
                });
            } else {
                // If there is no `createdSessionId`,
                // there are missing requirements, such as MFA
                // See https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections#handle-missing-requirements
                console.log("Apple Sign-In completed but no session created. Missing requirements may need to be handled.");
                Alert.alert(
                    "Additional Setup Required", 
                    "Please complete your account setup to continue."
                );
            }
        } catch (err) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error("Apple Sign-In Error:", JSON.stringify(err, null, 2));
            
            // Handle specific error cases
            if (err.errors && err.errors.length > 0) {
                const errorCode = err.errors[0]?.code;
                const errorMessage = err.errors[0]?.message;
                
                switch (errorCode) {
                    case 'form_identifier_exists':
                        Alert.alert(
                            "Account Exists", 
                            "An account with this Apple ID already exists. Please sign in instead."
                        );
                        break;
                    case 'oauth_access_denied':
                        // User cancelled the Apple Sign-In process
                        console.log("User cancelled Apple Sign-In");
                        break;
                    case 'clerk_network_error':
                        Alert.alert(
                            "Network Error", 
                            "Please check your internet connection and try again."
                        );
                        break;
                    default:
                        Alert.alert(
                            "Sign-In Error", 
                            errorMessage || "Something went wrong with Apple Sign-In. Please try again."
                        );
                }
            } else {
                // Generic error handling
                Alert.alert(
                    "Sign-In Error", 
                    "Something went wrong with Apple Sign-In. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    }, [loading, startSSOFlow]);

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
                <ScrollView contentContainerStyle={styles.scrollContent} showVerticalScrollIndicator={false} >
                    <Image source={require('../../assets/background.png')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width, height, opacity: 0.8 }} />
                    <View style={{ ...styles.card, backgroundColor: lightColor.COMP_COLOR }}>
                        <Text style={styles.title}>Welcome to Plannr 📆</Text>
                        <Text style={styles.subHeading}>Sign up to continue</Text>
                        <TextInput
                            style={{ ...styles.input, backgroundColor: lightColor.INPUT, color: lightColor.FOREGROUND }}
                            placeholder="Email"
                            placeholderTextColor="#888"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextInput
                            style={{ ...styles.input, backgroundColor: lightColor.INPUT, color: lightColor.FOREGROUND }}
                            placeholder="Password"
                            placeholderTextColor="#888"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACE, gap: 8 }}>
                            {showPassword ? <EyeClosedIcon color="#888" height={20} width={20} /> : <EyeIcon color="#888" height={20} width={20} />}
                            <Text style={{ ...styles.subHeading, color: '#888', marginBottom: 0, fontSize: typography.subHeadingSize * 0.8 }}>{showPassword ? "Hide" : "Show"} Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => handleSignUp()} disabled={loading}>
                            <Text style={{ ...styles.subHeading, color: '#FFF', marginBottom: 0 }}>{loading ? "Creating Account..." : "Create Account"}</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: SPACE }} />
                            <Text style={{ marginHorizontal: 8, color: '#888', fontSize: typography.subHeadingSize * 0.8, marginBottom: SPACE }}>OR</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: SPACE }} />
                        </View>
                        <TouchableOpacity style={styles.button} onPress={handleGoogleSignUp} disabled={loading}>
                            <Google width={20} height={20} />
                            <Text style={{ ...styles.subHeading, color: '#FFF', marginBottom: 0 }}>{loading ? "Loading..." : "Sign Up with Google"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleAppleSignUp} disabled={loading}>
                            <Apple width={20} height={20} color="#FFF" />
                            <Text style={{ ...styles.subHeading, color: '#FFF', marginBottom: 0 }}>{loading ? "Loading..." : "Sign Up with Apple"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { navigation.replace('SignIn') }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ ...styles.subHeading * 0.8, color: '#888', marginBottom: 0, textDecorationLine: 'underline' }}>Already have an account?</Text>
                            <Text style={{ ...styles.subHeading * 0.8, color: '#000', marginBottom: 0, textDecorationLine: 'underline' }}> Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <VerificationBottomSheet
                ref={verificationBottomSheetRef}
                onVerifyCode={handleVerifyCode}
                email={email}
                loading={verifying}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    card: {
        width: width - padding.SCREEN_PADDING * 2,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        padding: 24,
        marginHorizontal: padding.SCREEN_PADDING,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: typography.titleSize,
        fontFamily: 'PinkSunset',
        marginBottom: SPACE,
        alignSelf: 'center',
    },
    subHeading: {
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        marginBottom: SPACE,
        alignSelf: 'center',
    },
    input: {
        height: 40,
        borderRadius: 12,
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: SPACE,
    },
    button: {
        width: '90%',
        borderRadius: 12,
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACE,
        gap: 12,
        alignSelf: 'center',
    },
});

export default SignUpScreen;
