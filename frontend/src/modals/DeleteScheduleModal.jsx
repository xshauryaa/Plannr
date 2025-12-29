import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity  } from 'react-native'
import Modal from 'react-native-modal';
import { useAppState } from '../context/AppStateContext'
import { useNavigation } from '@react-navigation/native';
import { useAuthenticatedAPI } from '../utils/authenticatedAPI.js';
import { typography } from '../design/typography.js'

const DeleteScheduleModal = ({ isVisible, toDelete, onClose }) => {
    const { appState, setAppState } = useAppState();
    const navigation = useNavigation();
    const { deleteSchedule } = useAuthenticatedAPI();
    
    const handleDelete = async () => {
        try {
            console.log('🗑️ Deleting schedule:', toDelete);
            
            // Find the schedule to get its backend ID
            const scheduleToDelete = appState.savedSchedules.find(sched => sched.name === toDelete);
            
            // Delete from backend if we have a backend ID
            if (scheduleToDelete?.backendId) {
                console.log('🗑️ Deleting from backend with ID:', scheduleToDelete.backendId);
                await deleteSchedule(scheduleToDelete.backendId);
                console.log('✅ Schedule deleted from backend');
            } else {
                console.log('⚠️ No backend ID found, only deleting from local state');
            }
            
            // Delete from local state
            const updatedSchedules = appState.savedSchedules.filter((sched) => sched.name !== toDelete);
            
            // Clear active schedule if it's the one being deleted
            let newActiveSchedule = appState.activeSchedule;
            if (appState.activeSchedule && appState.activeSchedule.name === toDelete) {
                newActiveSchedule = null;
            }
            
            setAppState({ 
                ...appState, 
                savedSchedules: updatedSchedules,
                activeSchedule: newActiveSchedule
            });
            
            console.log('✅ Schedule deleted successfully');
            navigation.navigate('MainTabs');
            onClose();
            
        } catch (error) {
            console.error('⚠️ Failed to delete schedule from backend:', error);
            
            // Still delete from local state even if backend deletion fails
            const updatedSchedules = appState.savedSchedules.filter((sched) => sched.name !== toDelete);
            
            let newActiveSchedule = appState.activeSchedule;
            if (appState.activeSchedule && appState.activeSchedule.name === toDelete) {
                newActiveSchedule = null;
            }
            
            setAppState({ 
                ...appState, 
                savedSchedules: updatedSchedules,
                activeSchedule: newActiveSchedule
            });
            
            navigation.navigate('MainTabs');
            onClose();
        }
    };
    
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
                        onPress={handleDelete} 
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