import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing } from '../design/spacing.js';

const ROW_HEIGHT = 60;
const MIN_HEIGHT = 15;

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;

const ScheduleCalendarView = ({ schedule, date, isVisible }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const timeBlocks = schedule.getScheduleForDate(date).getTimeBlocks();
    const start = schedule.startTime.getHour();
    const HOURS = Array.from({ length: 24 - start }, (_, i) => i + start);

    return ((isVisible == true) 
        ? <ScrollView
            style={styles.container}
            contentContainerStyle={{ flexDirection: 'row' }}
            showsVerticalScrollIndicator={false}
        >
            {/* Left column: clock labels */}
            <View style={styles.timeColumn}>
                {HOURS.map(hour => (
                    <View key={hour} style={styles.row}>
                        <Text style={{ ...styles.timeLabel, color: theme.FOREGROUND }}>
                            {hour.toString().padStart(2, '0')}:00
                        </Text>
                    </View>
                ))}
            </View>
    
            {/* Right column: horizontal grid lines + time blocks */}
            <View style={styles.gridColumn}>
                {HOURS.map(hour => (
                    <View key={hour} style={styles.row}>
                        <View style={{ ...styles.gridLine, backgroundColor: theme.FOREGROUND }} />
                    </View>
                ))}
                {timeBlocks.map((block, index) => {
                    const startHour = block.getStartTime().to12HourString();
                    const endHour = block.getEndTime().to12HourString();
                    const duration = block.getDuration();
                    const OFFSET = (ROW_HEIGHT / 2) + (block.getStartTime().getHour() * 60 + block.getStartTime().getMinute() - (start * 60)) * ROW_HEIGHT / 60;
                    const blockHeight = ((duration * ROW_HEIGHT / 60) < MIN_HEIGHT) ? MIN_HEIGHT : (duration * ROW_HEIGHT / 60);
                    const fontSize = (blockHeight > 30) ? 16 : (blockHeight > 20) ? 12 : (blockHeight > 10) ? 10 : 4;

                    return (
                        <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR, height: blockHeight, top: OFFSET }} key={index}>
                            <Text style={{ ...styles.timeLabel, color: theme.FOREGROUND, opacity: 1, fontSize: fontSize }}>
                                {block.getName()}
                            </Text>
                            <Text style={{ ...styles.timeLabel, color: theme.FOREGROUND, opacity: 0.6, fontSize: fontSize }}>
                                {startHour} - {endHour}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
        : null
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: SPACE,
    },
    timeColumn: {
        width: 60,
        paddingRight: 2,
    },
    gridColumn: {
        flex: 1,
        paddingLeft: 2,
    },
    row: {
        height: ROW_HEIGHT,
        justifyContent: 'center',
    },
    timeLabel: {
        fontSize: 14,
        fontFamily: 'AlbertSans',
        opacity: 0.4,
    },
    gridLine: {
        height: 1,
        opacity: 0.15,
        marginVertical: 8,
    },
    card: {
        width: '100%',
        height: 202,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        paddingHorizontal: 12,
        position: 'absolute',
        left: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
});

export default ScheduleCalendarView;