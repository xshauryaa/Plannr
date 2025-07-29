import React from 'react' 
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import SavedIcon from '../../assets/nav-icons/SavedIcon.svg'
import PlannrCenterIcon from '../../assets/nav-icons/PlannrCenterIcon.svg'
import PreferencesIcon from '../../assets/nav-icons/PreferencesIcon.svg'
import AddIcon from '../../assets/system-icons/AddIcon.svg'
import RescheduleIcon from '../../assets/system-icons/RescheduleIcon.svg'
import { useAppState } from '../context/AppStateContext.js'

import { lightColor, darkColor } from '../design/colors.js'
import { spacing, padding } from '../design/spacing.js'
import { typography } from '../design/typography.js'
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const WIDTH = width - (padding.SCREEN_PADDING * 2);
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_2 : spacing.SPACING_1

const MenuButton = ({ broad, title, icon, navTo }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const ICONS = {
        Saved: <SavedIcon width={24} height={24} color={theme.FOREGROUND} style={{position: 'absolute', top: 16, right: 16 }} />,
        Center: <PlannrCenterIcon width={24} height={24} color={theme.FOREGROUND} style={{position: 'absolute', top: 16, right: 16 }} />,
        Generate: <AddIcon width={24} height={24} color={theme.FOREGROUND} style={{position: 'absolute', top: 16, right: 16 }} />,
        Preferences: <PreferencesIcon width={24} height={24} color={theme.FOREGROUND} style={{position: 'absolute', top: 16, right: 16 }} />,
        Reschedule: <RescheduleIcon width={24} height={24} color={theme.FOREGROUND} style={{position: 'absolute', top: 16, right: 16 }} />,
    }

    if (broad) {
        return (
            <TouchableOpacity style={{ ...styles.card, width: WIDTH, backgroundColor: theme.COMP_COLOR }} onPress={() => navTo()}>
                <Text style={{ ...styles.text, color: theme.FOREGROUND, width: 240 }}>{title}</Text>
                { ICONS[icon] || null }
            </TouchableOpacity>
        )
    }
    return (
        <TouchableOpacity style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }} onPress={() => navTo()}>
            <Text style={{ ...styles.text, color: theme.FOREGROUND }}>{title}</Text>
            { ICONS[icon] || null }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        width: (WIDTH - padding.SCREEN_PADDING) / 2,
        // aspectRatio: 191/90,
        height: 100,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        padding: 16,
        marginBottom: SPACE
    },
    text: { 
        width: 130,
        fontFamily: 'AlbertSans', 
        fontSize: typography.subHeadingSize,
        position: 'absolute',
        left: (width > 400) ? padding.PADDING_4 : (width > 350) ? padding.PADDING_3 : padding.PADDING_2,
        bottom: (width > 400) ? padding.PADDING_4 : (width > 350) ? padding.PADDING_3 : padding.PADDING_2,
    }
})

export default MenuButton;