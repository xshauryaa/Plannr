import React from 'react' 
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import SavedIcon from '../../assets/nav-icons/SavedIcon.svg'
import GenerateIcon from '../../assets/nav-icons/GenerateIcon.svg'
import PreferencesIcon from '../../assets/nav-icons/PreferencesIcon.svg'

const ICONS = {
    Saved: <SavedIcon width={24} height={24} style={{position: 'absolute', top: 16, right: 16 }} />,
    Generate: <GenerateIcon width={24} height={24} style={{position: 'absolute', top: 16, right: 16 }} />,
    Preferences: <PreferencesIcon width={24} height={24} style={{position: 'absolute', top: 16, right: 16 }} />,
}

const MenuButton = ({ broad, title, icon, navTo }) => {
    if (broad) {
        return (
            <TouchableOpacity style={{ ...styles.card, width: '100%'}} onPress={navTo}>
                <Text style={{ ...styles.text, width: '100%'}}>{title}</Text>
                { ICONS[icon] || null }
            </TouchableOpacity>
        )
    }
    return (
        <TouchableOpacity style={styles.card} onPress={navTo}>
            <Text style={styles.text}>{title}</Text>
            { ICONS[icon] || null }
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
    }
})

export default MenuButton