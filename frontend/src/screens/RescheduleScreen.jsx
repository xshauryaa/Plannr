import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { useActionLogger } from '../hooks/useActionLogger.js';
import { useAuthenticatedAPI } from '../utils/authenticatedAPI';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing, padding } from '../design/spacing.js';
import Rescheduler from '../model/Rescheduler.js';
import EventDependencies from '../model/EventDependencies.js';

import RescheduleStartView from '../scheduling-logic-views/RescheduleStartView.jsx';
import BreaksView from '../scheduling-logic-views/BreaksView.jsx';
import RigidEventsView from '../scheduling-logic-views/RigidEventsView.jsx';
import FlexibleEventsView from '../scheduling-logic-views/FlexibleEventsView.jsx';
import EventDependenciesView from '../scheduling-logic-views/EventDependenciesView.jsx';
import FinalCheckView from '../scheduling-logic-views/FinalCheckView.jsx';
import GenerationModal from '../modals/GenerationModal.jsx';

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;

const RescheduleScreen = ({ route, navigation }) => {
    const { appState, setAppState } = useAppState();
    const { logUserAction, logScheduleAction, logError } = useActionLogger('Reschedule');
    const { getSchedules, updateSchedule, convertScheduleToBackendJSON } = useAuthenticatedAPI();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    const { schedule } = route.params;

    const rescheduler = new Rescheduler(schedule.schedule);
    let rescheduled = null;

    const [reschedStage, setReschedStage] = useState(0);
    const [method, setMethod] = useState(null);
    const [breaks, setBreaks] = useState(rescheduler.breaks.map(b => [b.date, b.breakTime]));
    const [repeatedBreaks, setRepeatedBreaks] = useState([]);
    const [rigidEvents, setRigidEvents] = useState(rescheduler.rigidEvents);
    const [flexibleEvents, setFlexibleEvents] = useState(rescheduler.flexibleEvents);
    const [events, setEvents] = useState([...rescheduler.rigidEvents, ...rescheduler.flexibleEvents]);
    const [deps, setDeps] = useState(new EventDependencies(rescheduler.dependencies.getDependencies()));
    const [showReschedulingModal, setShowReschedulingModal] = useState(false);

    const ReplaceWithRescheduled = async (newSchedule) => {
        try {
            logScheduleAction('reschedule', {
                scheduleName: schedule.name,
                isActive: schedule.isActive,
                totalDays: newSchedule.numDays
            });
            
            // 1. Get all schedules to find the current schedule's ID by name
            const allSchedules = await getSchedules();
            const currentSchedule = allSchedules.find(s => s.title === schedule.name);
            
            if (!currentSchedule) {
                console.error('Schedule not found in database:', schedule.name);
                logError('reschedule_schedule_not_found', new Error('Schedule not found'), {
                    scheduleName: schedule.name
                });
                return;
            }

            // 2. Convert the rescheduled schedule to backend format
            const scheduleBackendData = convertScheduleToBackendJSON(newSchedule);
            
            if (!scheduleBackendData) {
                console.error('Failed to convert rescheduled schedule to backend format');
                logError('reschedule_conversion_failed', new Error('Backend format conversion failed'), {
                    scheduleName: schedule.name
                });
                return;
            }

            // 3. Update the schedule in database
            await updateSchedule(currentSchedule.id, {
                ...scheduleBackendData,
                title: schedule.name, // Keep original title
                isActive: currentSchedule.isActive, // Keep current active state
                lastModified: new Date().toISOString(),
            });

            // 4. Update local state
            if (schedule.isActive) {
                setAppState(prevState => ({
                    ...prevState,
                    activeSchedule: { name: schedule.name, schedule: newSchedule, backendId: currentSchedule.id, active: true },
                    savedSchedules: prevState.savedSchedules.map(s => 
                        s.name === schedule.name ? { name: schedule.name, schedule: newSchedule, backendId: currentSchedule.id, isActive: true } : s
                    )
                }));
            } else {
                setAppState(prevState => ({
                    ...prevState,
                    savedSchedules: prevState.savedSchedules.map(s => 
                        s.name === schedule.name ? { name: schedule.name, schedule: newSchedule, backendId: currentSchedule.id, isActive: false } : s
                    )
                }));
            }

            logAction('reschedule_success', {
                scheduleName: schedule.name,
                isActive: schedule.isActive,
                totalDays: newSchedule.numDays
            });

            console.log('Schedule rescheduled and synced to database successfully');
        } catch (error) {
            logError('reschedule_failed', error, {
                scheduleName: schedule.name,
                isActive: schedule.isActive
            });
            console.error('Failed to sync rescheduled schedule to database:', error);
            // Still update local state as fallback
            if (schedule.isActive) {
                setAppState(prevState => ({
                    ...prevState,
                    activeSchedule: { name: schedule.name, schedule: newSchedule, active: true },
                    savedSchedules: prevState.savedSchedules.map(s => 
                        s.name === schedule.name ? { name: schedule.name, schedule: newSchedule, isActive: true } : s
                    )
                }));
            } else {
                setAppState(prevState => ({
                    ...prevState,
                    savedSchedules: prevState.savedSchedules.map(s => 
                        s.name === schedule.name ? { name: schedule.name, schedule: newSchedule, isActive: false } : s
                    )
                }));
            }
        }
    }
    
    const RescheduleSelection = async (index) => {
        setMethod(index);
        if (index === 0) {
            // Handle Missed Task Shifting
            rescheduled = rescheduler.missedTaskShifting(schedule.schedule);
            await ReplaceWithRescheduled(rescheduled);
            setShowReschedulingModal(true);
        } else {
            // Handle Add New Tasks & Breaks or Switch Strategies
            setReschedStage(1);
        }
    }

    const BreaksSetup = (breakList, repeatedBreakList) => {
        setBreaks(breakList);
        setRepeatedBreaks(repeatedBreakList);
        setReschedStage(2);
    }

    const RigidSetup = (eventsList) => {
        setRigidEvents(eventsList);
        setEvents([...eventsList, ...flexibleEvents]);
        setReschedStage(3);
    }

    const FlexSetup = (eventsList) => {
        setFlexibleEvents(eventsList);
        setEvents([...rigidEvents, ...eventsList]);
        setReschedStage(4);
    }

    const DepsSetup = (eventDeps) => {
        setDeps(eventDeps);
        setReschedStage(5);
    }

    const CompleteAddBlocks = async (startT, endT, strategy) => {
        schedule.schedule.setStartTime(startT);
        schedule.schedule.setEndTime(endT);
        rescheduler.strategy = strategy;
        schedule.schedule.strategy = strategy;

        const addedBreaks = breaks.filter(b => !rescheduler.breaks.some(ob => ob.date.equals(b[0]) && ob.breakTime.equals(b[1])));
        const addedEvents = [
            ...rigidEvents.filter(e => !rescheduler.rigidEvents.includes(e)),
            ...flexibleEvents.filter(e => !rescheduler.flexibleEvents.includes(e)),
        ];

        rescheduled = rescheduler.addNewTimeBlocks(schedule.schedule, addedEvents, addedBreaks, repeatedBreaks, deps);
        await ReplaceWithRescheduled(rescheduled);
        setShowReschedulingModal(true);
    }

    const CompleteStrategySwitch = async (startT, endT, strategy) => {
        schedule.schedule.setStartTime(startT);
        schedule.schedule.setEndTime(endT);
        rescheduled = rescheduler.strategySwitch(schedule.schedule, strategy);
        await ReplaceWithRescheduled(rescheduled);
        setShowReschedulingModal(true);
    }

    let currentView = null;
    if (reschedStage === 0) {
        currentView = <RescheduleStartView schedule={schedule} onNext={(index) => RescheduleSelection(index)} />;
    } else if (method === 1) {
        switch(reschedStage) {
            case 1:
                currentView = <BreaksView onNext={BreaksSetup} minDate={schedule.schedule.getFirstDate()} numDays={schedule.schedule.numDays} onBack={() => setReschedStage(0)} breaksInput={breaks} repeatedBreaksInput={repeatedBreaks}/>;
                break;
            case 2:
                currentView = <RigidEventsView onNext={RigidSetup} minDate={schedule.schedule.getFirstDate()} numDays={schedule.schedule.numDays} onBack={() => setReschedStage(1)} eventsInput={rigidEvents}/>;
                break;
            case 3:
                currentView = <FlexibleEventsView onNext={FlexSetup} minDate={schedule.schedule.getFirstDate()} numDays={schedule.schedule.numDays} onBack={() => setReschedStage(2)} eventsInput={flexibleEvents}/>;
                break;
            case 4:
                currentView = <EventDependenciesView onNext={DepsSetup} events={events} depsInput={deps}/>;
                break;
            case 5:
                currentView = <FinalCheckView onNext={CompleteAddBlocks} includeTimes={true} buttonText="Reschedule"/>;
                break;
        }
    } else if (method === 2) {
        currentView = <FinalCheckView buttonText="Reschedule" includeTimes={true} onNext={CompleteStrategySwitch}/>;
    }

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Reschedule</Text>
            {currentView}
            <GenerationModal
                isVisible={showReschedulingModal}
                onViewSchedule={() => { 
                    setShowReschedulingModal(false) 
                    const toView = appState.savedSchedules.find(s => s.name === schedule.name);
                    navigation.replace('View', { schedName: toView.name });
                }}
                reschedule={true}
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
        height: '90%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: spacing.SPACING_16,
        marginBottom: SPACE,
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginBottom: SPACE,
    },
});

export default RescheduleScreen;