import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
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

    const ReplaceWithRescheduled = (newSchedule) => {
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
    
    const RescheduleSelection = (index) => {
        setMethod(index);
        if (index === 0) {
            // Handle Missed Task Shifting
            rescheduled = rescheduler.missedTaskShifting(schedule.schedule);
            ReplaceWithRescheduled(rescheduled);
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

    const CompleteAddBlocks = (startT, endT, strategy) => {
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
        ReplaceWithRescheduled(rescheduled);
        setShowReschedulingModal(true);
    }

    const CompleteStrategySwitch = (startT, endT, strategy) => {
        schedule.schedule.setStartTime(startT);
        schedule.schedule.setEndTime(endT);
        rescheduled = rescheduler.strategySwitch(schedule.schedule, strategy);
        ReplaceWithRescheduled(rescheduled);
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