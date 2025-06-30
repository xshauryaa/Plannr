import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing, padding } from '../design/spacing.js';
import Indicator from '../../assets/system-icons/Indicator.svg';
import ScheduleCalendarView from '../components/ScheduleCalendarView.jsx';
import EventInfoModal from '../modals/EventInfoModal.jsx';

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;
const ICON_DIM = (width > 400) ? 24 : 20
const INDICATOR_DIM = ICON_DIM * 7 / 4;
const PADDING_HORIZONTAL = ICON_DIM * 5/6;
const OFFSET = PADDING_HORIZONTAL - ((INDICATOR_DIM - ICON_DIM) / 2);

const ScheduleViewScreen = ({ route }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    const { schedule } = route.params;
    const [selectedDate, setSelectedDate] = useState(schedule.schedule.getFirstDate().getId());
    const [selectedTB, setSelectedTB] = useState(schedule.schedule.getScheduleForDate(schedule.schedule.getFirstDate().getId()).getTimeBlocks()[0]);
    const [showModal, setShowModal] = useState(false);

    const indicatorX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const index = schedule.schedule.getAllDatesInOrder().indexOf(selectedDate);
        const xPosition = index * (2 * PADDING_HORIZONTAL + ICON_DIM) + OFFSET;
        Animated.spring(indicatorX, {
            toValue: xPosition,
            useNativeDriver: true,
        }).start();
    }, [selectedDate]);

    const onSelectTB = (tb) => {
        setSelectedTB(tb);
        setShowModal(true);
    }

    const onCloseModal = () => {
        setShowModal(false);
    }

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>{schedule.name}</Text>
            <View style={styles.subContainer}>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Here's what your calendar looks like</Text>
                {/* Date Selection Carousel */}
                <View style={{ width: '100%' }}>
                    <ScrollView 
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ width: '100%' }}
                    >
                        <Animated.View
                            style={[
                                styles.indicator,
                                { transform: [{ translateX: indicatorX }], },
                            ]}
                        >
                            <Indicator width={INDICATOR_DIM} height={INDICATOR_DIM} color={theme.FOREGROUND} />
                        </Animated.View>
                        {schedule.schedule.getAllDatesInOrder().map((date, index) => {
                            const dateString = date.split("-", 1);

                            return (
                                <TouchableOpacity style={{ width: ICON_DIM, margin: PADDING_HORIZONTAL, alignItems: 'center' }} key={index} onPress={() => setSelectedDate(date)}>
                                    <Text style={{ ...styles.subHeading, color: (date === selectedDate) ? theme.ACCENT : theme.FOREGROUND }}>{dateString}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
                {/* Schedule Calendar Component */}
                <View style={{ height: '100%', paddingBottom: SPACE * 3 }}>
                    {schedule.schedule.getAllDatesInOrder().map((date, index) => {
                        const visible = (date === selectedDate);

                        return (
                            <ScheduleCalendarView schedule={schedule.schedule} date={date} isVisible={visible} onBlockSelect={(block) => onSelectTB(block)} key={index}/>
                        )
                    })}
                </View>
            </View>
            <EventInfoModal isVisible={showModal} tb={selectedTB} onClose={onCloseModal} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: padding.SCREEN_PADDING,
        height: '100%',
    },
    subContainer: {
        height: '80%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: spacing.SPACING_16,
        marginBottom: SPACE,
    },
    subHeading: {
        fontSize: 18,
        fontFamily: 'AlbertSans',
        marginBottom: SPACE,
    },
    indicator: {
        position: 'absolute',
        top: OFFSET,
        left: 0,
        bottom: OFFSET,
        zIndex: -1,
    },
});

export default ScheduleViewScreen;