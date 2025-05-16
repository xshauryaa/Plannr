import React, { useState } from 'react' 
import { Text, Image, StyleSheet, TouchableOpacity } from 'react-native'

const MenuButton = ({ title, icon, navTo }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={navTo}>
            <Text style={styles.text}>{title}</Text>
            <Image
                source={icon}
                style={styles.icon}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        height: 88,
        width: '48.5%',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        padding: 16,
    },
    text: { 
        width: 95,
        fontFamily: 'AlbertSans', 
        fontSize: 12,
        position: 'absolute',
        left: 16,
        bottom: 16,
    },
    icon: { 
        width: 18, 
        height: 18, 
        position: 'absolute', 
        top: 16, 
        right: 16 
    }
})

export default MenuButton