import React, { useContext, useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native'
import { AppStateContext } from '../context/AppStateContext'
import DeleteScheduleModal from '../components/DeleteScheduleModal'

const SavedSchedulesAndPreferencesScreen = () => {
    const { 
        savedSchedules, 
        name, setName, 
        userPreferences, setUserPreferences } = useContext(AppStateContext)

    const [isVisible, setIsVisible] = useState(false)

    const SavedSchedules = () => {
        return (
            <View>
                <Text style={styles.title}>Saved Schedules</Text>
                {
                    savedSchedules.length === 0 
                    ? <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', marginVertical: 16 }}>You have no saved schedules.</Text>
                    </View> 
                    : null
                }
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={savedSchedules}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => {
                            return (
                                <View style={styles.card}>
                                    <Image source={require('../../assets/images/BG-Gradient.png')} style={styles.bgImage} />
                                    <View style={styles.bottomCover}> 
                                        <View>
                                            <Text style={styles.heading}>{item.name}</Text>
                                            <Text style={{ ...styles.subHeading, color: '#000', opacity: 0.5 }}>
                                                {item.schedule.getFirstDate().getDateString()} - {item.schedule.getFirstDate().getDateAfter(6).getDateString()}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity onPress={() => {}}> 
                                                <Image source={require('../../assets/images/EditIcon.png')} style={{ width: 24, height: 24 }} />
                                            </TouchableOpacity> 
                                            <TouchableOpacity onPress={() => { setIsVisible(true) }}>
                                                <Image source={require('../../assets/images/DeleteIcon.png')} style={{ width: 24, height: 24 }} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <DeleteScheduleModal isVisible={isVisible} toDelete={item.name} onClose={() => { setIsVisible(false) }}/>
                                </View>
                            )
                        }
                    }
                />
            </View>
        )
    }

    const UserPreferences = () => {

    }

    return (
        <View style={styles.container}>
            { SavedSchedules() }
            <View style={styles.divider}></View>
            { UserPreferences() }
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
    card: {
        width: 361,
        height: 262,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        marginVertical: 16,
        margin: 8,
    },
    bgImage: {
        width: 361,
        height: 262,
        borderRadius: 12,
    },
    bottomCover: {
        width: 361,
        height: 120,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        backgroundColor: '#FFFFFF',
        padding: 16,
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    heading: { 
        fontSize: 20, 
        fontFamily: 'AlbertSans',
        marginBottom: 8,
    },
    subHeading: { 
        fontSize: 16, 
        fontFamily: 'AlbertSans',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        marginVertical: 8,
    },
})

export default SavedSchedulesAndPreferencesScreen