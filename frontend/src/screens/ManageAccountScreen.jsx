import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TextInput } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import LoadingScreen from './LoadingScreen.jsx';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing, padding } from '../design/spacing.js';
import { typography } from '../design/typography.js';
import convertDateToScheduleDate from '../utils/dateConversion.js';
import useCurrentTime from '../utils/useCurrentTime.js';

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;

const ManageAccountScreen = () => {
    const { appState } = useAppState();
    const theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const [userFirstName, setUserFirstName] = useState(appState.name);
    const [userLastName, setUserLastName] = useState(appState.name);
    // const [userEmail, setUserEmail] = useState(appState.email);

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Your Account</Text>
            <ScrollView style={{ ...styles.subContainer, backgroundColor: theme.BACKGROUND}}>
                {/* First and Last Name */}
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Your Name</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <Text style={{ ...styles.subHeading, marginBottom: 8, color: theme.FOREGROUND }}>First Name</Text>
                    <TextInput
                        style={{ ...styles.input, color: theme.FOREGROUND, backgroundColor: theme.INPUT }}
                        value={userFirstName}
                        onChangeText={setUserFirstName}
                    />
                    <Text style={{ ...styles.subHeading, marginVertical: 8, color: theme.FOREGROUND }}>Last Name</Text>
                    <TextInput
                        style={{ ...styles.input, color: theme.FOREGROUND, backgroundColor: theme.INPUT }}
                        value={userLastName}
                        onChangeText={setUserLastName}
                    />
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
});

export default ManageAccountScreen;