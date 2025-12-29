import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity, Switch } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { useActionLogger } from '../hooks/useActionLogger.js';
import { useAuthenticatedAPI } from '../utils/authenticatedAPI';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing, padding } from '../design/spacing.js';
import { typography } from '../design/typography.js';
import Indicator from '../../assets/system-icons/Indicator.svg';
import ScheduleCalendarView from '../components/ScheduleCalendarView.jsx';
import EventInfoModal from '../modals/EventInfoModal.jsx';
import DeleteIcon from '../../assets/system-icons/DeleteIcon.svg';
import DeleteScheduleModal from '../modals/DeleteScheduleModal.jsx';

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;
const ICON_DIM = (width > 400) ? 24 : 20
const INDICATOR_DIM = ICON_DIM * 7 / 4;
const PADDING_HORIZONTAL = ICON_DIM * 5/6;
const OFFSET = PADDING_HORIZONTAL - ((INDICATOR_DIM - ICON_DIM) / 2);

const ScheduleViewScreen = ({ route }) => {
    const { appState, setAppState } = useAppState();
    const { logUserAction, logScheduleAction, logError } = useActionLogger('ScheduleView');
    const { updateSchedule, getSchedules } = useAuthenticatedAPI();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    const { schedName } = route.params;
    
    // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTB, setSelectedTB] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const indicatorX = useRef(new Animated.Value(0)).current;
    
    // ✅ NOW we can safely check for schedule existence
    const schedule = appState.savedSchedules.find(sched => sched.name === schedName);

    // ✅ Initialize selectedDate when schedule is available
    useEffect(() => {
        if (!schedule || selectedDate) return; // ✅ Early return if no schedule or already set
        setSelectedDate(schedule.schedule.getFirstDate().getId());
    }, [schedule, selectedDate]);

    // ✅ Screen view logging
    useEffect(() => {
        if (!schedule) return; // ✅ Early return if no schedule
        logUserAction('view_schedule', { 
            scheduleName: schedName,
            isActive: schedule.isActive || false,
            totalDays: schedule.schedule?.numDays || 0
        });
    }, [schedule, schedName]);

    // Early return for missing schedule to prevent hooks errors
    if (!schedule) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.BACKGROUND }}>
                <Text style={{ fontFamily: 'AlbertSans', fontSize: 20, color: theme.FOREGROUND }}>Schedule not found.</Text>
            </View>
        );
    }

    useEffect(() => {
        if (!schedule || !selectedDate) return; // ✅ Guard against null values
        
        const index = schedule.schedule.getAllDatesInOrder().indexOf(selectedDate);
        const xPosition = index * (2 * PADDING_HORIZONTAL + ICON_DIM) + OFFSET;
        Animated.spring(indicatorX, {
            toValue: xPosition,
            useNativeDriver: true,
        }).start();
    }, [selectedDate, schedule]); // ✅ Add schedule as dependency

    const onSelectTB = (tb) => {
        setSelectedTB(tb);
        setShowInfoModal(true);
    }

    const onCloseModal = () => {
        setShowInfoModal(false);
    }

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.SPACING_16, justifyContent: 'space-between', paddingBottom: SPACE }}>
                <Text style={{ ...styles.title, color: theme.FOREGROUND, alignSelf: 'center' }}>{schedule.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-start' }}>
                    <Switch
                        trackColor={{ false: '#000000', true: '#4166FB' }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor={'#C0C0C0'}
                        onValueChange={async () => { 
                            try {
                                if (schedule.isActive) {
                                    // Deactivating current schedule
                                    logScheduleAction('deactivate', {
                                        scheduleName: schedule.name,
                                        scheduleId: schedule.backendId
                                    });
                                    
                                    await updateSchedule(schedule.backendId, { isActive: false });
                                    
                                    setAppState({ 
                                        ...appState, 
                                        activeSchedule: null, 
                                        savedSchedules: appState.savedSchedules.map(sched => {
                                            if (sched.name === schedule.name) {
                                                return { ...sched, isActive: false };
                                            }
                                            return sched;
                                        }) 
                                    });
                                } else {
                                    // Activating this schedule - first deactivate all others
                                    logScheduleAction('activate', {
                                        scheduleName: schedule.name,
                                        scheduleId: schedule.backendId,
                                        totalDays: schedule.schedule?.numDays || 0
                                    });
                                    
                                    const allSchedules = await getSchedules();
                                    
                                    // Update all schedules in database
                                    await Promise.all(
                                        allSchedules.map(sched => 
                                            updateSchedule(sched.id, { 
                                                isActive: sched.id === schedule.backendId 
                                            })
                                        )
                                    );
                                    
                                    // Update local state
                                    setAppState({ 
                                        ...appState, 
                                        activeSchedule: { 
                                            name: schedule.name, 
                                            schedule: schedule.schedule, 
                                            backendId: schedule.backendId,
                                            isActive: true 
                                        }, 
                                        savedSchedules: appState.savedSchedules.map(sched => {
                                            if (sched.name === schedule.name) {
                                                return { ...sched, isActive: true };
                                            }
                                            return {
                                                ...sched,
                                                isActive: false
                                            };
                                        }) 
                                    });
                                }
                            } catch (error) {
                                logError('schedule_activation_failed', error, {
                                    scheduleName: schedule.name,
                                    scheduleId: schedule.backendId,
                                    action: schedule.isActive ? 'deactivate' : 'activate'
                                });
                                console.error('Failed to update schedule activation:', error);
                                // Could add error toast here
                            }
                        }}
                        value={schedule.isActive}
                    />
                    {/* TEMPORARILY COMMENTED OUT - Delete functionality disabled
                    <TouchableOpacity 
                        style={{ width: 32, height: 32, marginRight: 8, opacity: (schedule.isActive) ? 0.2 : 1 }} 
                        disabled={schedule.isActive}
                        onPress={() => {
                            setShowDeleteModal(true);
                        }}
                    >
                        <DeleteIcon width={32} height={32} color={theme.FOREGROUND} />
                    </TouchableOpacity>
                    */}
                </View>
            </View>
            <View style={styles.subContainer}>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Here's what your calendar looks like</Text>
                {/* Date Selection Carousel */}
                <View style={{ width: '100%' }}>
                    <ScrollView 
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ width: '100%', contentContainerStyle: { justifyContent: 'center', alignItems: 'center' } }}
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
                                    <Text style={{ ...styles.bodySize, color: (date === selectedDate) ? theme.ACCENT : theme.FOREGROUND }}>{dateString}</Text>
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
            <EventInfoModal isVisible={showInfoModal} tb={selectedTB} onClose={onCloseModal} />
            {/* TEMPORARILY COMMENTED OUT - Delete modal disabled
            <DeleteScheduleModal 
                isVisible={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
                toDelete={schedule.name}
            />
            */}
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
        fontSize: typography.titleSize,
        fontFamily: 'PinkSunset'
    },
    subHeading: {
        fontSize: typography.headingSize,
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