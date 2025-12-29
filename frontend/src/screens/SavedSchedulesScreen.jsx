import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native'
import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'
import { typography } from '../design/typography.js'
import { padding } from '../design/spacing.js'

const SavedSchedulesScreen = ({ navigation }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <View>
                <Text style={{ ...styles.title, marginTop: 64, color: theme.FOREGROUND }}>Saved Schedules</Text>
                {
                    appState.savedSchedules.length === 0 
                    ? <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: typography.headingSize, fontFamily: 'AlbertSans', marginVertical: 16, color: theme.FOREGROUND }}>You have no saved schedules.</Text>
                    </View> 
                    : null
                }
                <FlatList
                    style={styles.subContainer}
                    showsVerticalScrollIndicator={false}
                    data={appState.savedSchedules}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => {
                        const imageMap = {
                            light: require('../../assets/images/light/BG-Gradient.png'),
                            dark: require('../../assets/images/dark/BG-Gradient.png'),
                        };
                            return (
                                <TouchableOpacity
                                    onPress={() => { navigation.navigate("View", { schedName: item.name }); }}
                                >
                                    <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                                        {/* Background Image */}
                                        <Image source={imageMap[appState.userPreferences.theme]} style={styles.bgImage} />
                                        <View style={{ ...styles.bottomCover, backgroundColor: theme.COMP_COLOR }}> 
                                            <View>
                                                <Text style={{ ...styles.heading, color: theme.FOREGROUND }}>{item.name}</Text>
                                                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, opacity: 0.5 }}>
                                                    {item?.schedule?.getFirstDate ? 
                                                        `${item.schedule.getFirstDate().getDateString()} onwards` : 
                                                        'Schedule details loading...'
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        }
                    }
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
    },
    subContainer: {
        height: '90%',
        paddingHorizontal: padding.SCREEN_PADDING,
    },
    title: {
        fontSize: typography.titleSize,
        fontFamily: 'PinkSunset',
        marginTop: 16,
        marginBottom: 8,
        marginLeft: padding.SCREEN_PADDING,
    },
    card: {
        width: '99%',
        height: 202,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        marginVertical: 12,
        margin: 20,
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
        fontSize: typography.headingSize, 
        fontFamily: 'PinkSunset',
        marginBottom: 8,
    },
    subHeading: { 
        fontSize: typography.subHeadingSize, 
        fontFamily: 'AlbertSans',
        marginBottom: 12,
    },
})

export default SavedSchedulesScreen