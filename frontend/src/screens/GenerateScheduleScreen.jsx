import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { useAppState } from '../context/AppStateContext.js'
import { useActionLogger } from '../hooks/useActionLogger.js'
import { lightColor, darkColor } from '../design/colors.js'
import { typography } from '../design/typography.js'
import { useAuthenticatedAPI } from '../utils/authenticatedAPI.js'

import Time24 from '../model/Time24.js'
import ScheduleDate from '../model/ScheduleDate.js';
import convertDateToScheduleDate from '../utils/dateConversion.js'
import combineScheduleDateAndTime24 from '../utils/combineScheduleDateAndTime24.js'
import Scheduler from '../model/Scheduler.js'
import EventDependencies from '../model/EventDependencies.js'

import GenerationModal from '../modals/GenerationModal.jsx'
import SchedulingErrorModal from '../modals/SchedulingErrorModal.jsx'
import GoBackIcon from '../../assets/system-icons/GoBackIcon.svg';
import LoadingScreen from './LoadingScreen.jsx'
import SettingUpView from '../scheduling-logic-views/SettingUpView.jsx'
import AddTasksView from '../scheduling-logic-views/AddTasksView.jsx'
import ReviewTasksView from '../scheduling-logic-views/ReviewTasksView.jsx'

const GenerateScheduleScreen = ({ navigation }) => {
    const { appState, setAppState } = useAppState();
    const { logUserAction, logScheduleAction, logError } = useActionLogger('GenerateSchedule');
    const { saveScheduleWithDays, convertScheduleToBackendJSON, convertTimeBlockToBackendJSON, parseTextToFlexibleEvents } = useAuthenticatedAPI();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    // State Variables
    const [genStage, setGenStage] = useState(0); // 0: Set Up, 1: Add Tasks, 2: Review Tasks, 3: Busy Times, 4: Finishing Up
    const [showGenerationModal, setShowGenerationModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isSavingToBackend, setIsSavingToBackend] = useState(false);
    const [scheduler, setScheduler] = useState(new Scheduler(1, new ScheduleDate(1, 1, 1970), 'Sunday', 15, 8));
    const [name, setName] = useState('');
    const [numDays, setNumDays] = useState(1);
    const [breaks, setBreaks] = useState([]);
    const [repeatedBreaks, setRepeatedBreaks] = useState([]);
    const [rigidEvents, setRigidEvents] = useState([]);
    const [flexibleEvents, setFlexibleEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [deps, setDeps] = useState(new EventDependencies());
    const [firstDate, setFirstDate] = useState(convertDateToScheduleDate(new Date()));
    const [isLoading, setIsLoading] = useState(false);

    const progressAnim = useRef(new Animated.Value(20)).current;
    const progressPercentage = ((genStage + 1) / 5) * 100;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progressPercentage,
            duration: 800, // 800ms smooth animation
            useNativeDriver: false, // Width animations need to use JS driver
        }).start();
    }, [genStage, progressPercentage]);

    // Handlers
    const SchedulerInitialization = (name, numDays, date, gap, workingLimit) => {
        const startDate = combineScheduleDateAndTime24(date, new Time24(0, 0)); // convertDateToScheduleDate(date)
        const dayString = getScheduleDateDayName(date);
        const numDaysInt = parseInt(numDays)
        const minGap = parseInt(gap)
        const maxHours = parseInt(workingLimit)

        setName(name);
        const newScheduler = new Scheduler(numDaysInt, date, dayString, minGap, maxHours);
        
        // CRITICAL: Always initialize with empty EventDependencies to prevent null reference errors
        newScheduler.setEventDependencies(new EventDependencies());
        
        setScheduler(newScheduler);
        setGenStage(1);
        setFirstDate(date);
        setNumDays(numDaysInt);
        
        console.log('SchedulerInitialization completed:', {
            name,
            numDays: numDaysInt,
            startDate,
            dayString,
            minGap,
            maxHours,
            firstDate: date
        });
    }

    const getScheduleDateDayName = (scheduleDate) => {
        const jsDate = new Date(scheduleDate.year, scheduleDate.month - 1, scheduleDate.date);
        return jsDate.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const AddTasksHandler = async (todoListInput) => {
        try {
            console.log('📝 Processing todo list input:', todoListInput);
            
            // Show loading state
            setIsLoading(true);

            // Call the text-to-tasks API to parse the input
            const result = await parseTextToFlexibleEvents(todoListInput, {
                defaultDuration: 60,
                workingHours: { 
                    start: 9, 
                    end: 17 
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            if (result.success) {
                console.log('✅ Successfully parsed tasks:', result);
                
                // Update state with the parsed FlexibleEvents
                setFlexibleEvents(result.flexibleEvents);
                setEvents([...rigidEvents, ...result.flexibleEvents]);
                
                // Log success metrics
                logUserAction('text_to_tasks_parse_success', {
                    totalTasks: result.stats.totalTasks,
                    validTasks: result.stats.validTasks,
                    warnings: result.stats.warnings
                });

                // Show warnings to user if any (you might want to display these in UI)
                if (result.warnings && result.warnings.length > 0) {
                    console.warn('⚠️ Parse warnings:', result.warnings);
                }

                // Move to the next stage
                setGenStage(2);
            } else {
                throw new Error('Parse failed: No success flag returned');
            }

        } catch (error) {
            console.error('❌ Text-to-tasks parsing failed:', error);
            
            // Log error
            logError('text_to_tasks_parse_failed', {
                error: error.message,
                inputLength: todoListInput?.length || 0
            });

            // You might want to show an error modal or message to the user
            // For now, we'll just stay on the current stage
            alert(`Failed to parse your tasks: ${error.message}\n\nPlease try again or enter tasks manually.`);
            
            // Reset to the add tasks stage
            setGenStage(1);
        } finally {
            setIsLoading(false);
        }
    }

    const ReviewTasksHandler = (reviewedTasks) => {
        // Process the reviewedTasks and update flexibleEvents
        console.log('Reviewed tasks:', reviewedTasks);
        setGenStage(3);
    }

    // Titles and Views for each stage
    const titles = [
        'Setting Up',
        'Add Your Tasks',
        'Review Your Tasks',
        'Set Your Busy Times',
        'Finishing Up'
    ];

    const views = [
        <SettingUpView onNext={(name, numDays, startDate, minGap, maxHours) => SchedulerInitialization(name, numDays, startDate, minGap, maxHours)} />,
        <AddTasksView onNext={AddTasksHandler}/>,
        <ReviewTasksView onNext={ReviewTasksHandler} tasks={flexibleEvents} minDate={firstDate} numDays={numDays}/>,
        <LoadingScreen />,
        <LoadingScreen />,
    ]

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                    <Animated.View 
                        style={[
                            styles.progressBarForeground, 
                            { 
                                width: progressAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%'],
                                    extrapolate: 'clamp'
                                })
                            }
                        ]} 
                    />
                </View>
            </View>
            <View style={styles.titleContainer}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <GoBackIcon width={24} height={24} color={theme.FOREGROUND} />
                </TouchableOpacity>
                <Text style={{ ...styles.title, color: theme.FOREGROUND}}>{titles[genStage]}</Text>
            </View>
            { isLoading ? <LoadingScreen message='Understanding your tasks...' /> : views[genStage] }
            <SchedulingErrorModal 
                isVisible={showErrorModal} 
                action1={() => { navigation.replace("MainTabs"); setShowErrorModal(false); }} 
                action2={() => { setShowErrorModal(false); setGenStage(1) }}
            />
            <GenerationModal 
                isVisible={showGenerationModal} 
                onViewSchedule={() => { navigation.replace("View", { schedName: name }); setShowGenerationModal(false); }} 
                isSavingToBackend={isSavingToBackend}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        height: '100%',
    },
    title: {
        fontSize: typography.titleSize,
        fontFamily: 'PinkSunset',
        flex: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 8,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    progressBarContainer: {
        width: '100%',
        marginTop: 64,
    },
    progressBarBackground: {
        height: 4,
        borderRadius: 16,
        backgroundColor: 'rgba(204, 204, 204, 0.5)', // Grey with 50% opacity
    },
    progressBarForeground: {
        height: 4,
        borderRadius: 16,
        backgroundColor: 'rgb(0, 0, 0)', // Black with 100% opacity
    },
});

export default GenerateScheduleScreen;