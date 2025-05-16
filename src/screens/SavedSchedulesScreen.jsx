import React, { useContext } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native'
import { AppStateContext } from '../context/AppStateContext'

const SavedSchedulesScreen = () => {
    const { savedSchedules } = useContext(AppStateContext)

    const SavedSchedules = () => {
        return (
            <View>
                <Text style={{ ...styles.title, marginTop: 64, }}>Saved Schedules</Text>
                {
                    savedSchedules.length === 0 
                    ? <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontFamily: 'AlbertSans', marginVertical: 16 }}>You have no saved schedules.</Text>
                    </View> 
                    : null
                }
                <FlatList
                    style={styles.subContainer}
                    showsVerticalScrollIndicator={false}
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
                                        </View>
                                    </View>
                                    <View style={styles.divider}></View>
                                </View>
                            )
                        }
                    }
                />
            </View>
        )
    }

    

    return (
        <View style={styles.container}>
            { SavedSchedules() }
            { /* UserPreferences() */ }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    subContainer: {
        height: '80%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: 16,
        marginBottom: 8
    },
    card: {
        width: '97%',
        height: 202,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        marginVertical: 12,
        margin: 8,
        alignSelf: 'center',
    },
    bgImage: {
        width: '100%',
        height: 202,
        borderRadius: 12,
    },
    bottomCover: {
        width: '100%',
        height: 90,
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
        fontSize: 24, 
        fontFamily: 'PinkSunset',
        marginBottom: 8,
    },
    subHeading: { 
        fontSize: 16, 
        fontFamily: 'AlbertSans',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        marginVertical: 12,
    },
    input: {
        height: 40,
        borderRadius: 12, 
        fontSize: 16,
        fontFamily: 'AlbertSans',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F0F0F0',
    },
    strategyButton: {
        width: '100%',
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0F0F0' ,
        paddingHorizontal: 16,
        justifyContent: 'center',
        marginBottom: 8,
    }
})

export default SavedSchedulesScreen