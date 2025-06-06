import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing, padding } from '../design/spacing.js';

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;

const RescheduleScreen = () => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Reschedule Tasks</Text>
            <View style={{ ...styles.subContainer, backgroundColor: theme.BACKGROUND }}>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Feature under development</Text>
                {/* Rescheduling functionality will be implemented here */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: padding.SCREEN_PADDING,
        height: '100%',
    },
    subContainer: {
        height: '90%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: spacing.SPACING_16,
        marginBottom: SPACE,
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginBottom: SPACE,
    },
});

export default RescheduleScreen;