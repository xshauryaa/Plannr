import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing } from '../design/spacing.js';
import ActivityType from '../model/ActivityType.js'
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated';

const ActivityTypeColors = {
  [ActivityType.PERSONAL]:     '#2E86DE',  // Blue
  [ActivityType.MEETING]:      '#48C9B0',  // Teal
  [ActivityType.WORK]:         '#27AE60',  // Green
  [ActivityType.EVENT]:        '#E67E22',  // Orange
  [ActivityType.EDUCATION]:    '#F39C12',  // Amber
  [ActivityType.TRAVEL]:       '#8E44AD',  // Purple
  [ActivityType.RECREATIONAL]: '#D35400',  // Dark Orange
  [ActivityType.ERRAND]:       '#C0392B',  // Crimson
  [ActivityType.OTHER]:        '#7F8C8D',  // Slate Gray
  [ActivityType.BREAK]:        '#95A5A6',  // Light Gray
};

const ROW_HEIGHT = 60;
const MIN_HEIGHT = 15;

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;

const ScheduleCalendarView = ({ schedule, date, isVisible, onBlockSelect }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const [rowHeight, setRowHeight] = useState(60);
    const rowHeightShared = useSharedValue(60);

    const timeBlocks = schedule.getScheduleForDate(date).getTimeBlocks();
    const start = schedule.startTime.getHour();
    const HOURS = Array.from({ length: 24 - start }, (_, i) => i + start);

    const pinch = Gesture.Pinch()
        .onUpdate((event) => {
            const newHeight = Math.max(30, Math.min(200, rowHeightShared.value * event.scale));
            rowHeightShared.value = newHeight;
            runOnJS(setRowHeight)(newHeight);
        });

    return ((isVisible == true) 
        ? <GestureDetector gesture={pinch}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ flexDirection: 'row' }}
                showsVerticalScrollIndicator={false}
            >
                {/* Left column: clock labels */}
                <View style={styles.timeColumn}>
                    {HOURS.map(hour => (
                        <View key={hour} style={{ ...styles.row, height: rowHeight }}>
                            <Text style={{ ...styles.timeLabel, color: theme.FOREGROUND }}>
                                {hour.toString().padStart(2, '0')}:00 { hour < 12 ? 'AM' : 'PM' }
                            </Text>
                        </View>
                    ))}
                </View>
        
                {/* Right column: horizontal grid lines + time blocks */}
                <View style={styles.gridColumn}>
                    {HOURS.map(hour => (
                        <View key={hour} style={{ ...styles.row, height: rowHeight }}>
                            <View style={{ ...styles.gridLine, backgroundColor: theme.FOREGROUND }} />
                        </View>
                    ))}
                    {timeBlocks.map((block, index) => {
                        const startHour = block.getStartTime().to12HourString();
                        const endHour = block.getEndTime().to12HourString();
                        const duration = block.getDuration();
                        const OFFSET = (rowHeight / 2) + (block.getStartTime().getHour() * 60 + block.getStartTime().getMinute() - (start * 60)) * rowHeight / 60;
                        const blockHeight = ((duration * rowHeight / 60) < MIN_HEIGHT) ? MIN_HEIGHT : (duration * rowHeight / 60);
                        const fontSize = (blockHeight > 30) ? 16 : (blockHeight > 20) ? 12 : (blockHeight > 10) ? 10 : 4;

                        return (
                            <TouchableOpacity style={{ ...styles.card, backgroundColor: theme.COMP_COLOR, height: blockHeight, top: OFFSET }} key={index} onPress={() => onBlockSelect(block)}>
                                <View style={{ 
                                        width: 3, 
                                        height: '80%', 
                                        backgroundColor: ActivityTypeColors[block.activityType] || '#FF0000',
                                        borderRadius: 3,
                                        marginRight: 8
                                }}/>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Text style={{ ...styles.timeLabel, color: theme.FOREGROUND, opacity: 1, fontSize: fontSize }}>
                                        {block.getName()}
                                    </Text>
                                    <Text style={{ ...styles.timeLabel, color: theme.FOREGROUND, opacity: 0.6, fontSize: fontSize, marginRight: 12 }}>
                                        {startHour} - {endHour}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </GestureDetector>
        : null
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: SPACE,
    },
    timeColumn: {
        width: 80,
        paddingRight: 2,
    },
    gridColumn: {
        flex: 1,
        paddingLeft: 2,
    },
    row: {
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
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        paddingRight: 12,
        paddingLeft: 4,
        position: 'absolute',
        left: 0,
        flexDirection: 'row',
        alignItems: 'center'
    },
});

export default ScheduleCalendarView;