import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'
import { typography } from '../design/typography.js'

import ScheduleDate from '../model/ScheduleDate.js';
import InfoView from '../scheduling-logic-views/InfoView.jsx'
import BreaksView from '../scheduling-logic-views/BreaksView.jsx'
import RigidEventsView from '../scheduling-logic-views/RigidEventsView.jsx'
import FlexibleEventsView from '../scheduling-logic-views/FlexibleEventsView.jsx'
import EventDependenciesView from '../scheduling-logic-views/EventDependenciesView.jsx'
import FinalCheckView from '../scheduling-logic-views/FinalCheckView.jsx'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import Scheduler from '../model/Scheduler'
import EventDependencies from '../model/EventDependencies.js'
import GenerationModal from '../modals/GenerationModal.jsx'
import SchedulingErrorModal from '../modals/SchedulingErrorModal.jsx'

const GenerateScheduleScreen = ({ navigation }) => {
    const { appState, setAppState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const [genStage, setGenStage] = useState(0);
    const [scheduler, setScheduler] = useState(new Scheduler(new ScheduleDate(1, 1, 1970), 'Sunday', 15, 8));
    const [name, setName] = useState('');
    const [breaks, setBreaks] = useState([]);
    const [repeatedBreaks, setRepeatedBreaks] = useState([]);
    const [rigidEvents, setRigidEvents] = useState([]);
    const [flexibleEvents, setFlexibleEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [deps, setDeps] = useState(new EventDependencies());
    const [firstDate, setFirstDate] = useState(new Date());
    const [showGenerationModal, setShowGenerationModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const titles = ['I. Information', 'II. Breaks', 'III. Rigid Events', 'IV. Flexible Events', 'V. Event Dependencies', 'VI. Rounding Up']

    const SchedulerInitialization = (name, numDays, date, gap, workingLimit) => {
        const startDate = convertDateToScheduleDate(date)
        const dayString = date.toLocaleDateString('en-US', { weekday: 'long' });
        const numDaysInt = parseInt(numDays)
        const minGap = parseInt(gap)
        const maxHours = parseInt(workingLimit)

        setName(name);
        setScheduler(new Scheduler(numDaysInt, startDate, dayString, minGap, maxHours));
        setGenStage(1);
        setFirstDate(date);
        
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

    const BreaksSetup = (breakList, repeatedBreakList) => {
        setBreaks([...breakList])
        setRepeatedBreaks([...repeatedBreakList])
        scheduler.setBreaks(breakList)
        scheduler.setRepeatedBreaks(repeatedBreakList)
        setGenStage(2)
        
        console.log('BreaksSetup completed:', {
            breaks: breakList,
            repeatedBreaks: repeatedBreakList,
            breaksCount: breakList.length,
            repeatedBreaksCount: repeatedBreakList.length,
            totalExpectedBreaksInSchedule: breakList.length + (repeatedBreakList.length * scheduler.numDays)
        });
    }

    const RigidEventsSetup = (eventsList) => {
        setRigidEvents([...eventsList])
        scheduler.setRigidEvents(eventsList);
        setEvents([...events, ...eventsList]);
        setGenStage(3);
        
        console.log('RigidEventsSetup completed:', {
            rigidEvents: eventsList,
            rigidEventsCount: eventsList.length,
            totalEventsAfterRigid: [...events, ...eventsList].length,
            allEvents: [...events, ...eventsList]
        });
    }

    const FlexibleEventsSetup = (eventsList) => {
        setFlexibleEvents([...eventsList])
        scheduler.setFlexibleEvents(eventsList);
        setEvents([...events, ...eventsList]);
        setGenStage(4);
        
        console.log('FlexibleEventsSetup completed:', {
            flexibleEvents: eventsList,
            flexibleEventsCount: eventsList.length,
            currentEvents: events,
            currentEventsCount: events.length,
            totalEventsAfterFlexible: [...events, ...eventsList].length,
            allEventsAfterFlexible: [...events, ...eventsList]
        });
    }

    const EventDepsSetup = (eventDeps) => {
        setDeps(eventDeps)
        scheduler.setEventDependencies(eventDeps)
        setGenStage(5)
        
        console.log('EventDepsSetup completed:', {
            eventDependencies: eventDeps,
            dependenciesCount: eventDeps ? Object.keys(eventDeps.dependencies || {}).length : 0,
            allEventsSoFar: events,
            totalEventsCount: events.length
        });
    }

    const Generation = (startTime, endTime, strategy) => {
        (strategy == 'earliest-fit')
            ? strategy = "Earliest Fit" 
            : (strategy == 'balanced-work')
                ? strategy = "Balanced Work"
                : (strategy == 'deadline-oriented')
                    ? strategy = "Deadline Oriented"
                    : null
                    
        console.log('Generation starting with:', {
            startTime,
            endTime,
            strategy,
            schedulerNumDays: scheduler.numDays,
            breaks: breaks,
            repeatedBreaks: repeatedBreaks,
            rigidEvents: rigidEvents,
            flexibleEvents: flexibleEvents,
            deps: deps,
            totalBreaksExpected: breaks.length + (repeatedBreaks.length * scheduler.numDays),
            totalEventsExpected: rigidEvents.length + flexibleEvents.length
        });
        
        try {
            const schedule = scheduler.createSchedules(strategy, startTime, endTime);
            console.log(schedule);
            
            // Validation: Check if the generated schedule has the expected number of time blocks
            const expectedTimeBlocks = breaks.length + (repeatedBreaks.length * scheduler.numDays) + rigidEvents.length + flexibleEvents.length;
            let actualTimeBlocks = 0;
            
            // Count time blocks across all days in the schedule
            const datesList = schedule.getAllDatesInOrder();
            for (const date of datesList) {
                const dailySchedule = schedule.getScheduleForDate(date);
                actualTimeBlocks += dailySchedule.getTimeBlocks().length;
            }
            
            console.log(`Expected time blocks: ${expectedTimeBlocks}, Actual time blocks: ${actualTimeBlocks}`);
            
            if (actualTimeBlocks !== expectedTimeBlocks) {
                throw new Error(`Schedule validation failed: Expected ${expectedTimeBlocks} time blocks but got ${actualTimeBlocks}`);
            }
            
            setShowGenerationModal(true);
            setAppState({ ...appState, savedSchedules: [...appState.savedSchedules, { name: name, schedule: schedule, active: false }]});
        } catch (error) {
            setShowErrorModal(true);
            console.error(error);
            return;
        }
    }

    const views = [
        <InfoView onNext={SchedulerInitialization}/>,
        <BreaksView onNext={BreaksSetup} minDate={firstDate} numDays={scheduler.numDays} onBack={() => {setGenStage(genStage - 1)}} breaksInput={breaks} repeatedBreaksInput={repeatedBreaks}/>,
        <RigidEventsView onNext={RigidEventsSetup} minDate={firstDate} numDays={scheduler.numDays} onBack={() => {setGenStage(genStage - 1)}} eventsInput={rigidEvents}/>,
        <FlexibleEventsView onNext={FlexibleEventsSetup} minDate={firstDate} numDays={scheduler.numDays} onBack={() => {setGenStage(genStage - 1)}} eventsInput={flexibleEvents}/>,
        <EventDependenciesView onNext={EventDepsSetup} events={events} depsInput={deps}/>,
        <FinalCheckView onNext={Generation}/>
    ]

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND}}>{titles[genStage]}</Text>
            {views[genStage]}
            <SchedulingErrorModal 
                isVisible={showErrorModal} 
                action1={() => { navigation.navigate("MainTabs"); setShowErrorModal(false); }} 
                action2={() => { setShowErrorModal(false); setGenStage(1) }}
            />
            <GenerationModal 
                isVisible={showGenerationModal} 
                onViewSchedule={() => { navigation.navigate("View", { schedName: name }); setShowGenerationModal(false); }} 
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        height: '100%',
    },
    title: {
        fontSize: typography.titleSize,
        fontFamily: 'PinkSunset',
        marginTop: 64,
        marginBottom: 8
    },
    
})

export default GenerateScheduleScreen