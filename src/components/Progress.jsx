import React from 'react' 
import { Text, View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import GoIcon from '../../assets/system-icons/GoIcon.svg';

const Progress = ({ progress }) => {
    const NoScheduleView = () => {
        return (
            <View style={{ ...styles.card, justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', alignSelf: 'center' }}>No schedule to track progress.</Text>
            </View>
        )
    }

    const ScheduleView = () => {
        return (
            <View style={styles.card}>
                <Text style={styles.topText}>You've completed 60% of this week's tasks!</Text>
                <View style={styles.progressBarBack}>
                    <LinearGradient
                        colors={['#3A47E4', '#4166FB']}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={[styles.progressBarFront, { width: `${progress}%` }]}
                    />
                </View>
                <View style={styles.horizontalGrid}>
                    <Text style={styles.bottomText}>View your current week's schedule</Text>
                    <GoIcon style={styles.icon} width={18} height={18} />
                </View>
            </View>
        )
    }

    return (
        (progress === null) 
        ? NoScheduleView()
        : ScheduleView()
    )
}

const styles = StyleSheet.create({
    card: {
        height: 89,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        marginBottom: 16,
        padding: 16
    },
    topText: {
        fontSize: 12,
        fontFamily: 'AlbertSans',
        marginBottom: 8,
    },
    progressBarBack: {
        height: 10,
        borderRadius: 16,
        backgroundColor: '#EAEAEA',
        marginBottom: 8,
    },
    progressBarFront: {
        height: 10,
        borderRadius: 16,
    },
    horizontalGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bottomText: {
        fontSize: 12,
        fontFamily: 'AlbertSans',
        alignSelf: 'flex-start',
    },
    icon: {
        width: 18,
        height: 18,
        alignSelf: 'flex-end',
    }
})

export default Progress