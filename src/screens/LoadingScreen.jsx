import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Loading...</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
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