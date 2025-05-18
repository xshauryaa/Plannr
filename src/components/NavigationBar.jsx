import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';

const ICONS = {
  Home: require('../../assets/nav-icons/HomeIcon.png'),
  Tasks: require('../../assets/nav-icons/TasksIcon.png'),
  Add: require('../../assets/nav-icons/GenerateIcon.png'),
  Calendar: require('../../assets/nav-icons/SavedIcon.png'),
  Preferences: require('../../assets/nav-icons/PreferencesIcon.png'),
};

const NavigationBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.bar}>
            <Text> Hello World </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    bar: {
        width: 324,
        height: 48,
        borderRadius: 32,
        backgroundColor: '#000000'
    }
})

export default NavigationBar