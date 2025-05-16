import React, { useState } from 'react' 
import { Text, Image, StyleSheet, TouchableOpacity } from 'react-native'

const MenuButton = ({ broad, title, icon, navTo }) => {
    if (broad) {
        return (
            <TouchableOpacity style={{ ...styles.card, width: '97%'}} onPress={navTo}>
                <Text style={{ ...styles.text, width: '100%'}}>{title}</Text>
                <Image
                    source={icon}
                    style={styles.icon}
                />
            </TouchableOpacity>
        )
    }
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
        shadowRadius: 12,
        padding: 16,
    },
    text: { 
        width: 120,
        fontFamily: 'AlbertSans', 
        fontSize: 16,
        position: 'absolute',
        left: 16,
        bottom: 16,
    },
    icon: { 
        width: 24, 
        height: 24, 
        position: 'absolute', 
        top: 16, 
        right: 16 
    }
})

export default MenuButton