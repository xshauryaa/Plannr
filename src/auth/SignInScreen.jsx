import { useSignIn } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { spacing, padding } from "../design/spacing.js";
import { typography } from "../design/typography.js";
import { lightColor } from "../design/colors.js";
import { EyeIcon, EyeClosedIcon } from "lucide-react-native";
const { width, height } = Dimensions.get('window');
import Google from '../../assets/auth/Google.svg';
import Apple from '../../assets/auth/Apple.svg';
import * as Font from 'expo-font';

const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2

const SignInScreen = ({ navigation }) => {

    const [fontsLoaded] = Font.useFonts({
        'PinkSunset': require('../../assets/fonts/PinkSunset-Regular.ttf'),
        'AlbertSans': require('../../assets/fonts/AlbertSans-VariableFont_wght.ttf'),
    });

    const { signIn, setActive, isLoaded } = useSignIn();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert("Please enter both email and password.");
            return;
        }

        if (!isLoaded) return;

        setLoading(true);
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace('/')
            } else {
                Alert.alert("Sign-in not complete. Please try again.");
                console.error(JSON.stringify(signInAttempt.status, null, 2))
            }
        } catch (err) {
            Alert.alert("Error signing in. Please check your credentials and try again.");
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setLoading(false);
        }
    };

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
                <ScrollView contentContainerStyle={styles.scrollContent} showVerticalScrollIndicator={false} >
                    <Image source={require('../../assets/background.png')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width, height, opacity: 0.8 }} />
                    <View style={{ ...styles.card, backgroundColor: lightColor.COMP_COLOR}}>
                        <Text style={styles.title}>Welcome Back 📆</Text>
                        <Text style={styles.subHeading}>Sign in to continue</Text>
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
                        <TouchableOpacity style={styles.button} onPress={() => handleSignIn()} disabled={loading}>
                            <Text style={{ ...styles.subHeading, color: '#FFF', marginBottom: 0 }}>{loading ? "Signing In..." : "Sign In"}</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: SPACE }} />
                            <Text style={{ marginHorizontal: 8, color: '#888', fontSize: typography.subHeadingSize * 0.8, marginBottom: SPACE }}>OR</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: SPACE }} />
                        </View>
                        <TouchableOpacity style={styles.button} onPress={() => console.log("Google Sign-In")} disabled={loading}>
                            <Google width={20} height={20} />
                            <Text style={{ ...styles.subHeading, color: '#FFF', marginBottom: 0 }}>{loading ? "Signing In..." : "Sign In with Google"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => console.log("Apple Sign-In")} disabled={loading}>
                            <Apple width={20} height={20} color="#FFF" />
                            <Text style={{ ...styles.subHeading, color: '#FFF', marginBottom: 0 }}>{loading ? "Signing In..." : "Sign In with Apple"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { navigation.replace('SignUp') }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ ...styles.subHeading * 0.8, color: '#888', marginBottom: 0, textDecorationLine: 'underline' }}>Don't have an account?</Text>
                            <Text style={{ ...styles.subHeading * 0.8, color: '#000', marginBottom: 0, textDecorationLine: 'underline' }}> Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
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
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACE,
        gap: 12,
        alignSelf: 'center',
    },
});

export default SignInScreen;