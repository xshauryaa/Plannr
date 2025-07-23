import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity  } from 'react-native'
import Modal from 'react-native-modal';
import { useAppState } from '../context/AppStateContext'
import { useNavigation } from '@react-navigation/native';
import { typography } from '../design/typography.js'

const DeleteScheduleModal = ({ isVisible, toDelete, onClose }) => {
    const { appState, setAppState } = useAppState();
    const navigation = useNavigation();
    
    return (
        <Modal 
            isVisible={isVisible} 
            style={{ justifyContent: 'center', alignItems: 'center' }}
            animationInTiming={500}
            animationOutTiming={500}
        >
            <View style={styles.card}>
                <View style={{ flexDirection: 'column', gap: 4, alignSelf: 'flex-start' }}>
                    <Text style={styles.heading}>Delete Schedule</Text>
                    <Text style={styles.text}>
                        Are you sure you want to delete the schedule "{toDelete}"?
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'flex-end' }}>
                    <TouchableOpacity 
                        onPress={() => {
                            navigation.navigate('MainTabs');
                            onClose()
                            const updatedSchedules = appState.savedSchedules.filter((sched) => sched.name !== toDelete)
                            if (appState.activeSchedule && appState.activeSchedule.name === toDelete) {
                                setAppState({ ...appState, activeSchedule: null })
                            }
                            setAppState({ ...appState, savedSchedules: updatedSchedules })
                        }} 
                        style={{ backgroundColor: '#F00', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 }}
                    >
                        <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', }}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={{ backgroundColor: '#E0E0E0', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 }}>
                        <Text style={{ color: '#000', fontFamily: 'AlbertSans' }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    card: {
        width: 361,
        height: 200,
        borderRadius: 36,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        marginVertical: 16,
        padding: 24,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    heading: { 
        fontSize: typography.titleSize, 
        fontFamily: 'PinkSunset', 
        marginBottom: 16 
    },
    text: { 
        fontSize: typography.subHeadingSize, 
        fontFamily: 'AlbertSans', 
        marginBottom: 24 
    }
})

export default DeleteScheduleModal