import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'
import { typography } from '../design/typography.js'
import { useAuthenticatedAPI } from '../utils/authenticatedAPI.js'

import ScheduleDate from '../model/ScheduleDate.js';
import InfoView from '../scheduling-logic-views/InfoView.jsx'
import BreaksView from '../scheduling-logic-views/BreaksView.jsx'
import RigidEventsView from '../scheduling-logic-views/RigidEventsView.jsx'
import FlexibleEventsView from '../scheduling-logic-views/FlexibleEventsView.jsx'
import EventDependenciesView from '../scheduling-logic-views/EventDependenciesView.jsx'
import FinalCheckView from '../scheduling-logic-views/FinalCheckView.jsx'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import combineScheduleDateAndTime24 from '../utils/combineScheduleDateAndTime24.js'
import Scheduler from '../model/Scheduler'
import EventDependencies from '../model/EventDependencies.js'
import GenerationModal from '../modals/GenerationModal.jsx'
import SchedulingErrorModal from '../modals/SchedulingErrorModal.jsx'
import Time24 from '../model/Time24.js'

const GenerateScheduleScreen = ({ navigation }) => {
    const { appState, setAppState } = useAppState();
    const { createSchedule, addBlocksToSchedule } = useAuthenticatedAPI();
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
    const [firstDate, setFirstDate] = useState(convertDateToScheduleDate(new Date()));
    const [showGenerationModal, setShowGenerationModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isSavingToBackend, setIsSavingToBackend] = useState(false);

    const titles = ['I. Information', 'II. Breaks', 'III. Rigid Events', 'IV. Flexible Events', 'V. Dependencies', 'VI. Rounding Up']

    // Helper function to convert ScheduleDate to YYYY-MM-DD format
    const formatScheduleDateToISO = (scheduleDate) => {
        const year = scheduleDate.year;
        const month = scheduleDate.month.toString().padStart(2, '0');
        const day = scheduleDate.date.toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper function to convert frontend schedule to backend format
    const convertScheduleToBackendFormat = (frontendSchedule, scheduleName, strategy, startTime, endTime) => {
        const scheduleDate = frontendSchedule.getFirstDate();
        const periodStart = formatScheduleDateToISO(scheduleDate);
        
        // Calculate period end based on number of days
        const endDate = new Date(periodStart);
        endDate.setDate(endDate.getDate() + scheduler.numDays - 1);
        const periodEnd = endDate.toISOString().split('T')[0];

        // Convert strategy names to match backend format
        const strategyMap = {
            'earliest-fit': 'EarliestFit',
            'balanced-work': 'BalancedWork', 
            'deadline-oriented': 'DeadlineOriented'
        };

        const backendSchedule = {
            title: scheduleName,
            periodStart: periodStart,
            periodEnd: periodEnd,
            day1Date: {
                date: scheduleDate.date,
                month: scheduleDate.month,
                year: scheduleDate.year
            },
            day1Day: scheduleDate.toLocaleDateString('en-US', { weekday: 'long' }),
            isActive: true,
            numDays: scheduler.numDays,
            minGap: scheduler.minGapMinutes,
            workingHoursLimit: scheduler.maxWorkingHours,
            strategy: strategyMap[strategy] || 'EarliestFit',
            startTime: startTime,
            endTime: endTime,
            metadata: {
                generatedAt: new Date().toISOString(),
                frontendVersion: '1.0.0'
            }
        };

        // Convert blocks
        const blocks = [];
        const datesList = frontendSchedule.getAllDatesInOrder();
        
        for (const date of datesList) {
            const dailySchedule = frontendSchedule.getScheduleForDate(date);
            const timeBlocks = dailySchedule.getTimeBlocks();
            
            for (const block of timeBlocks) {
                blocks.push({
                    title: block.title || block.name || 'Untitled Block',
                    activityType: mapActivityType(block.type || block.activityType),
                    priority: mapPriority(block.priority),
                    estimatedDuration: block.getDuration() || 60,
                    blockDate: formatScheduleDateToISO(date),
                    startTime: block.startTime.toInt(),
                    endTime: block.endTime.toInt(),
                    description: block.description || '',
                    isCompleted: false,
                    metadata: {
                        originalType: block.type,
                        generatedOrder: blocks.length
                    }
                });
            }
        }

        return { schedule: backendSchedule, blocks };
    };

    // Helper functions for mapping frontend enums to backend enums
    const mapActivityType = (frontendType) => {
        const typeMap = {
            'Break': 'BREAK',
            'Work': 'WORK', 
            'Meeting': 'MEETING',
            'Personal': 'PERSONAL',
            'Event': 'EVENT',
            'Education': 'EDUCATION',
            'Travel': 'TRAVEL',
            'Recreational': 'RECREATIONAL',
            'Errand': 'ERRAND',
            'Other': 'OTHER'
        };
        return typeMap[frontendType] || 'OTHER';
    };

    const mapPriority = (frontendPriority) => {
        const priorityMap = {
            'High': 'HIGH',
            'Medium': 'MEDIUM', 
            'Low': 'LOW'
        };
        return priorityMap[frontendPriority] || 'MEDIUM';
    };

    const SchedulerInitialization = (name, numDays, date, gap, workingLimit) => {
        const startDate = combineScheduleDateAndTime24(date, new Time24(0, 0)); // convertDateToScheduleDate(date)
        const dayString = startDate.toLocaleDateString('en-US', { weekday: 'long' });
        const numDaysInt = parseInt(numDays)
        const minGap = parseInt(gap)
        const maxHours = parseInt(workingLimit)

        setName(name);
        setScheduler(new Scheduler(numDaysInt, date, dayString, minGap, maxHours));
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

    const BreaksSetup = (breakList, repeatedBreakList, changeView=true) => {
        setBreaks([...breakList])
        setRepeatedBreaks([...repeatedBreakList])
        scheduler.setBreaks(breakList)
        scheduler.setRepeatedBreaks(repeatedBreakList)
        if (changeView) setGenStage(2);
        
        console.log('BreaksSetup completed:', {
            breaks: breakList,
            repeatedBreaks: repeatedBreakList,
            breaksCount: breakList.length,
            repeatedBreaksCount: repeatedBreakList.length,
            totalExpectedBreaksInSchedule: breakList.length + (repeatedBreakList.length * scheduler.numDays)
        });
    }

    const RigidEventsSetup = (eventsList, changeView=true) => {
        setRigidEvents([...eventsList])
        scheduler.setRigidEvents(eventsList);
        setEvents([...flexibleEvents, ...eventsList]);
        if (changeView) setGenStage(3);

        console.log('RigidEventsSetup completed:', {
            rigidEvents: eventsList,
            rigidEventsCount: eventsList.length,
            totalEventsAfterRigid: [...events, ...eventsList].length,
            allEvents: [...events, ...eventsList]
        });
    }

    const FlexibleEventsSetup = (eventsList, changeView=true) => {
        setFlexibleEvents([...eventsList])
        scheduler.setFlexibleEvents(eventsList);
        setEvents([...rigidEvents, ...eventsList]);
        if (changeView) setGenStage(4);

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

    const Generation = async (startTime, endTime, strategy) => {
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
            console.log('🚀 Starting schedule generation...');
            const schedule = scheduler.createSchedules(strategy, startTime, endTime);
            console.log('✅ Frontend schedule generated:', schedule);
            
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

            // Save to local state (for offline access)
            setAppState({ ...appState, savedSchedules: [...appState.savedSchedules, { name: name, schedule: schedule, active: false }]});
            
            // Convert to backend format and save to database
            setIsSavingToBackend(true);
            console.log('💾 Converting schedule to backend format...');
            
            try {
                const { schedule: backendSchedule, blocks } = convertScheduleToBackendFormat(schedule, name, strategy, startTime, endTime);
                console.log('📤 Saving schedule to backend...', { backendSchedule, blocksCount: blocks.length });
                
                // Create schedule in backend
                const savedSchedule = await createSchedule(backendSchedule);
                console.log('✅ Schedule saved to backend:', savedSchedule);
                
                // Save blocks to backend if schedule creation was successful
                if (savedSchedule.success && savedSchedule.data && blocks.length > 0) {
                    console.log('📤 Saving blocks to backend...', { blocksCount: blocks.length });
                    try {
                        const savedBlocks = await addBlocksToSchedule(savedSchedule.data.id, blocks);
                        console.log('✅ Blocks saved to backend:', savedBlocks);
                    } catch (blocksError) {
                        console.error('⚠️ Failed to save blocks to backend:', blocksError);
                        // Don't fail if blocks can't be saved - schedule is still created
                    }
                }
                
            } catch (backendError) {
                console.error('⚠️ Failed to save to backend, but continuing with local save:', backendError);
                // Don't fail the entire flow if backend save fails
            } finally {
                setIsSavingToBackend(false);
            }
            
            setShowGenerationModal(true);
        } catch (error) {
            setShowErrorModal(true);
            console.error('💥 Schedule generation failed:', error);
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
                action1={() => { navigation.replace("MainTabs"); setShowErrorModal(false); }} 
                action2={() => { setShowErrorModal(false); setGenStage(1) }}
            />
            <GenerationModal 
                isVisible={showGenerationModal} 
                onViewSchedule={() => { navigation.replace("View", { schedName: name }); setShowGenerationModal(false); }} 
                isSavingToBackend={isSavingToBackend}
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