import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { useActionLogger } from '../hooks/useActionLogger.js';
import { useAuthenticatedAPI } from '../utils/authenticatedAPI';
import { useUser, useSSO } from '@clerk/clerk-expo';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing, padding } from '../design/spacing.js';
import { typography } from '../design/typography.js';
import { addScheduleToAppleCalendar } from '../utils/appleCalendarExport.ts';
import Indicator from '../../assets/system-icons/Indicator.svg';
import ScheduleCalendarView from '../components/ScheduleCalendarView.jsx';
import EventInfoModal from '../modals/EventInfoModal.jsx';
import ExportCalIcon from '../../assets/system-icons/ExportCalIcon.svg';
import DeleteIcon from '../../assets/system-icons/DeleteIcon.svg';
import DeleteScheduleModal from '../modals/DeleteScheduleModal.jsx';
import ExportCalendarBottomSheet from '../components/ExportCalendarBottomSheet.jsx';

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;
const ICON_DIM = (width > 400) ? 24 : 20
const INDICATOR_DIM = ICON_DIM * 7 / 4;
const PADDING_HORIZONTAL = ICON_DIM * 5/6;
const OFFSET = PADDING_HORIZONTAL - ((INDICATOR_DIM - ICON_DIM) / 2);

const ScheduleViewScreen = ({ route }) => {
    const { appState, setAppState } = useAppState();
    const { logUserAction, logScheduleAction, logError } = useActionLogger('ScheduleView');
    const { updateSchedule, getSchedules, checkGoogleCalendarStatus, exportScheduleToGoogleCalendar } = useAuthenticatedAPI();
    const { user } = useUser();
    const { startSSOFlow } = useSSO();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    const { schedName } = route.params;
    
    // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTB, setSelectedTB] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const indicatorX = useRef(new Animated.Value(0)).current;
    const exportBottomSheetRef = useRef(null);
    
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
    if (!schedule.schedule) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.BACKGROUND }}>
                <Text style={{ fontFamily: 'AlbertSans', fontSize: 20, color: theme.FOREGROUND }}>Schedule not found.</Text>
            </View>
        );
    }

    useEffect(() => {
        if (!schedule || !selectedDate) return; // ✅ Guard against null values

        console.log("Selected date:", selectedDate);
        console.log("All dates in order:", schedule.schedule.getAllDatesInOrder());
        const index = schedule.schedule.getAllDatesInOrder().indexOf(selectedDate);
        console.log("Index:", index);
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

    // Handle Google Calendar authorization/re-authorization
    const handleGoogleCalendarAuth = async () => {
        try {
            logUserAction('google_calendar_auth_attempt', { 
                scheduleName: schedName,
                reason: 'missing_calendar_scope'
            });

            // For users who need additional Calendar permissions, we'll guide them to reconnect
            Alert.alert(
                'Google Calendar Permissions Needed',
                'Your Google account is connected, but we need additional calendar permissions to export your schedule.\n\nWould you like to reconnect with calendar permissions?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => {
                            logUserAction('google_calendar_auth_cancelled', { scheduleName: schedName });
                        }
                    },
                    {
                        text: 'Reconnect',
                        onPress: () => {
                            // Guide user to settings or provide manual steps
                            Alert.alert(
                                'Update Google Calendar Permissions',
                                'To enable Google Calendar export:\n\n1. Go to Account Settings\n2. Disconnect Google account\n3. Reconnect and allow Calendar permissions\n\nOr try the export again in a few minutes as permissions may take time to update.',
                                [
                                    { text: 'Got it', style: 'default' },
                                    {
                                        text: 'Try Export Again',
                                        onPress: () => {
                                            logUserAction('google_calendar_retry_after_guidance', { scheduleName: schedName });
                                            handleExportToGoogleCalendar();
                                        }
                                    }
                                ]
                            );
                            
                            logUserAction('google_calendar_guidance_shown', { 
                                scheduleName: schedName 
                            });
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('Failed to handle Google Calendar authorization:', error);
            logError('google_calendar_auth_failed', error, { scheduleName: schedName });
            Alert.alert('Error', 'Please try the export again or check your Google account settings.');
        }
    };

    // Handle the actual export process
    const handleExportToGoogleCalendar = async () => {
        try {
            logUserAction('google_calendar_export_attempt', { 
                scheduleName: schedName,
                totalDays: schedule.schedule?.numDays || 0
            });

            // Check if Google Calendar is connected first
            const isConnected = await checkGoogleCalendarStatus();
            
            if (!isConnected) {
                // Show option to connect Google Calendar
                Alert.alert(
                    'Google Calendar Not Connected',
                    'To export your schedule, you need to connect your Google Calendar with calendar permissions.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Connect Calendar', 
                            onPress: () => handleGoogleCalendarAuth()
                        }
                    ]
                );
                return;
            }

            // Get user's timezone - you might want to get this from user preferences
            // For now, using a default timezone
            const userTimezone = 'America/Vancouver'; // TODO: Get from user preferences
            
            // Export to Google Calendar
            const result = await exportScheduleToGoogleCalendar(schedule.schedule, userTimezone);
            
            // Show success message
            Alert.alert(
                'Success!',
                `Exported ${result.inserted} events to your "Plannr" calendar in Google Calendar.`,
                [{ text: 'Great!' }]
            );
            
            logUserAction('google_calendar_export_success', { 
                scheduleName: schedName,
                eventsExported: result.inserted,
                calendarId: result.calendarId
            });

        } catch (error) {
            console.error('Google Calendar export failed:', error);
            
            // Handle specific error types with user-friendly messages
            let errorMessage = 'Failed to export to Google Calendar. Please try again.';
            let shouldShowAuthOption = false;
            
            if (error.message?.includes('GOOGLE_CALENDAR_NOT_CONNECTED')) {
                errorMessage = 'Google Calendar is not connected or missing calendar permissions.';
                shouldShowAuthOption = true;
            } else if (error.message?.includes('GOOGLE_CALENDAR_REAUTH_REQUIRED')) {
                errorMessage = 'Google Calendar access has expired. Please reconnect your account.';
                shouldShowAuthOption = true;
            } else if (error.message?.includes('No events found')) {
                errorMessage = 'No events found in your schedule to export.';
            }
            
            if (shouldShowAuthOption) {
                Alert.alert(
                    'Export Failed',
                    errorMessage,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Fix Connection', 
                            onPress: () => handleGoogleCalendarAuth()
                        },
                        {
                            text: 'Try Again',
                            onPress: () => {
                                // Retry export after a short delay in case permissions are propagating
                                setTimeout(() => {
                                    logUserAction('google_calendar_export_retry', { scheduleName: schedName });
                                    handleExportToGoogleCalendar();
                                }, 2000);
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Export Failed', 
                    errorMessage,
                    [
                        { text: 'OK', style: 'cancel' },
                        {
                            text: 'Try Again',
                            onPress: () => {
                                setTimeout(() => {
                                    logUserAction('google_calendar_export_retry', { scheduleName: schedName });
                                    handleExportToGoogleCalendar();
                                }, 1000);
                            }
                        }
                    ]
                );
            }
            
            logError('google_calendar_export_error', error, {
                scheduleName: schedName,
                errorType: error.message?.includes('GOOGLE_CALENDAR') ? 'auth_error' : 'unknown_error'
            });
        }
    };

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.SPACING_16, justifyContent: 'space-between', paddingBottom: SPACE }}>
                <Text style={{ ...styles.title, color: theme.FOREGROUND, alignSelf: 'center' }}>{schedule.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-start' }}>
                    <Switch
                        trackColor={{ false: '#000000', true: theme.GRADIENT_START }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor={'#C0C0C0'}
                        onValueChange={async () => { 
                            const wasActive = schedule.isActive;
                            
                            // 🚀 OPTIMISTIC UPDATE: Update UI immediately
                            if (wasActive) {
                                // Deactivating current schedule
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
                                // Activating this schedule - deactivate all others
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
                            
                            // 🔄 BACKGROUND UPDATE: Handle backend request
                            try {
                                if (wasActive) {
                                    // Deactivating current schedule
                                    logScheduleAction('deactivate', {
                                        scheduleName: schedule.name,
                                        scheduleId: schedule.backendId
                                    });
                                    
                                    await updateSchedule(schedule.backendId, { isActive: false });
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
                                        allSchedules.data.map(sched => 
                                            updateSchedule(sched.id, { 
                                                isActive: sched.id === schedule.backendId 
                                            })
                                        )
                                    );
                                }
                                
                                console.log('✅ Schedule activation updated successfully in backend');
                            } catch (error) {
                                // 🚨 REVERT ON ERROR: If backend fails, revert the optimistic update
                                console.error('❌ Failed to update schedule activation in backend, reverting UI:', error);
                                
                                logError('schedule_activation_failed', error, {
                                    scheduleName: schedule.name,
                                    scheduleId: schedule.backendId,
                                    action: wasActive ? 'deactivate' : 'activate'
                                });
                                
                                // Revert to original state
                                if (wasActive) {
                                    // Revert deactivation - make it active again
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
                                            return sched;
                                        }) 
                                    });
                                } else {
                                    // Revert activation - make it inactive again
                                    setAppState({ 
                                        ...appState, 
                                        activeSchedule: appState.activeSchedule, // Keep previous active schedule
                                        savedSchedules: appState.savedSchedules.map(sched => {
                                            if (sched.name === schedule.name) {
                                                return { ...sched, isActive: false };
                                            }
                                            return sched;
                                        }) 
                                    });
                                }
                                
                                // Could add error toast here to inform user
                                // showErrorToast('Failed to update schedule. Please try again.');
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
                    <TouchableOpacity 
                        style={{ width: 32, height: 32, marginRight: 8 }}
                        onPress={() => exportBottomSheetRef.current?.show()}
                    >
                        <ExportCalIcon width={32} height={32} color={theme.FOREGROUND} />
                    </TouchableOpacity>
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
                            const dateString = date.split("-")[0];

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
            
            <ExportCalendarBottomSheet 
                ref={exportBottomSheetRef}
                onExportGoogle={handleExportToGoogleCalendar}
                onExportApple={() => addScheduleToAppleCalendar(appState.name, schedule.schedule)}
                theme={theme}
            />
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
    bodySize: {
        fontSize: ICON_DIM/1.5,
        fontFamily: 'AlbertSans',
        lineHeight: ICON_DIM,
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