import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'

const LoadingScreen = () => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND}}>
            <Text style={{ ...styles.text, color: theme.FOREGROUND}}>Loading...</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        height: '100%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: 64,
        marginBottom: 8
    },
});

export default LoadingScreen