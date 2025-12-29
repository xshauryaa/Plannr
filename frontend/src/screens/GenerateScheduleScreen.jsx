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
    const { createSchedule, addBlocksToSchedule, convertScheduleToBackendJSON, convertTimeBlockToBackendJSON } = useAuthenticatedAPI();
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
        // If it's already a string in ISO-like format (like "29-12-2024"), convert it to proper ISO format
        if (typeof scheduleDate === 'string') {
            const parts = scheduleDate.split('-');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');  
                const year = parts[2];
                return `${year}-${month}-${day}`;
            }
        }
        
        // Handle ScheduleDate objects
        if (!scheduleDate || typeof scheduleDate.year === 'undefined' || typeof scheduleDate.month === 'undefined' || typeof scheduleDate.date === 'undefined') {
            throw new Error(`Invalid scheduleDate: ${scheduleDate}`);
        }
        
        const year = scheduleDate.year;
        const month = scheduleDate.month.toString().padStart(2, '0');
        const day = scheduleDate.date.toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper function to get day name from ScheduleDate
    const getScheduleDateDayName = (scheduleDate) => {
        const jsDate = new Date(scheduleDate.year, scheduleDate.month - 1, scheduleDate.date);
        return jsDate.toLocaleDateString('en-US', { weekday: 'long' });
    };

    // Helper function to convert frontend schedule to backend format
    const convertScheduleToBackendFormat = (frontendSchedule, scheduleName, strategy, startTime, endTime) => {
        try {
            console.log('🔍 DEBUG: Converting schedule to backend format...');
            const scheduleDate = frontendSchedule.getFirstDate();
            console.log('🔍 DEBUG: scheduleDate:', scheduleDate);
            
            const periodStart = formatScheduleDateToISO(scheduleDate);
            console.log('🔍 DEBUG: periodStart:', periodStart);
            
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

            console.log('🔍 DEBUG: Creating backendSchedule object...');
            const backendSchedule = {
                title: scheduleName,
                periodStart: periodStart,
                periodEnd: periodEnd,
                day1Date: {
                    date: scheduleDate.date,
                    month: scheduleDate.month,
                    year: scheduleDate.year
                },
                day1Day: getScheduleDateDayName(scheduleDate),
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
            console.log('🔍 DEBUG: backendSchedule created successfully');

            // Convert blocks
            console.log('🔍 DEBUG: Converting blocks...');
            const blocks = [];
            const datesList = frontendSchedule.getAllDatesInOrder();
            console.log('🔍 DEBUG: datesList:', datesList?.map(d => d?.toString?.() || 'invalid date'));
            
            for (const date of datesList) {
                console.log('🔍 DEBUG: Processing date:', date?.toString?.() || 'invalid date');
                const dailySchedule = frontendSchedule.getScheduleForDate(date);
                const timeBlocks = dailySchedule.getTimeBlocks();
                console.log('🔍 DEBUG: timeBlocks for date:', timeBlocks?.length || 0);
                
                for (const [blockIndex, block] of timeBlocks.entries()) {
                    console.log(`🔍 DEBUG: Processing block ${blockIndex}:`, {
                        title: block.title,
                        name: block.name,
                        type: block.type,
                        activityType: block.activityType,
                        priority: block.priority,
                        startTime: block.startTime,
                        endTime: block.endTime,
                        description: block.description
                    });
                    
                    blocks.push({
                        title: block.title || block.name || 'Untitled Block',
                        type: block.type || 'flexible', // Block type (rigid/flexible/break)
                        category: mapActivityType(block.activityType || 'OTHER'), // Activity type (WORK/MEETING/etc.)
                        priority: mapPriority(block.priority),
                        duration: block.getDuration() || 60, // Use 'duration' instead of 'estimatedDuration'
                        blockDate: formatScheduleDateToISO(date),
                        startAt: block.startTime?.toInt() || 0, // Use 'startAt' instead of 'startTime'
                        endAt: block.endTime?.toInt() || 0, // Use 'endAt' instead of 'endTime'
                        completed: false, // Use 'completed' instead of 'isCompleted'
                        metadata: {
                            originalType: block.type,
                            generatedOrder: blocks.length,
                            description: block.description || ''
                        }
                    });
                }
            }
            console.log('🔍 DEBUG: Blocks conversion completed, total blocks:', blocks.length);

            return { schedule: backendSchedule, blocks };
        } catch (error) {
            console.error('🔍 DEBUG: Error in convertScheduleToBackendFormat:', error);
            console.error('🔍 DEBUG: Error stack:', error.stack);
            throw error;
        }
    };

    // Helper functions for mapping frontend enums to backend enums
    const mapActivityType = (frontendType) => {
        const typeMap = {
            'Break': 'BREAK',
            'WORK': 'WORK', 
            'MEETING': 'MEETING',
            'PERSONAL': 'PERSONAL',
            'EVENT': 'EVENT',
            'EDUCATION': 'EDUCATION',
            'TRAVEL': 'TRAVEL',
            'RECREATIONAL': 'RECREATIONAL',
            'ERRAND': 'ERRAND',
            'OTHER': 'OTHER'
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
        
        // Additional debugging: Check if scheduler actually has the events
        console.log('🔍 SCHEDULER STATE CHECK:');
        console.log('Scheduler rigid events:', scheduler.rigidEvents);
        console.log('Scheduler flexible events:', scheduler.flexibleEvents);
        console.log('Scheduler breaks:', scheduler.breaks);
        console.log('Scheduler repeated breaks:', scheduler.repeatedBreaks);
        
        try {
            console.log('🚀 Starting schedule generation...');
            const schedule = scheduler.createSchedules(strategy, startTime, endTime);
            console.log('✅ Frontend schedule generated:', schedule);
            
            // Detailed debugging: Log what's actually in the schedule
            const expectedTimeBlocks = breaks.length + (repeatedBreaks.length * scheduler.numDays) + rigidEvents.length + flexibleEvents.length;
            let actualTimeBlocks = 0;
            
            console.log('📊 DETAILED SCHEDULE DEBUG:');
            console.log('Expected breakdown:', {
                breaks: breaks.length,
                repeatedBreaks: repeatedBreaks.length,
                numDays: scheduler.numDays,
                repeatedBreaksTotal: repeatedBreaks.length * scheduler.numDays,
                rigidEvents: rigidEvents.length,
                flexibleEvents: flexibleEvents.length,
                totalExpected: expectedTimeBlocks
            });
            
            // Count time blocks across all days in the schedule
            const datesList = schedule.getAllDatesInOrder();
            console.log('📅 Dates in schedule:', datesList.map(d => d.toString()));
            
            for (const date of datesList) {
                const dailySchedule = schedule.getScheduleForDate(date);
                const timeBlocks = dailySchedule.getTimeBlocks();
                actualTimeBlocks += timeBlocks.length;
                
                console.log(`📋 ${date.toString()}: ${timeBlocks.length} blocks`);
                timeBlocks.forEach((block, index) => {
                    console.log(`   ${index + 1}. ${block.title || block.name || 'Unnamed'} (${block.startTime?.toString() || 'No start'} - ${block.endTime?.toString() || 'No end'})`);
                });
            }
            
            console.log(`📈 FINAL COUNT: Expected ${expectedTimeBlocks}, Actual ${actualTimeBlocks}`);
            
            // Basic validation: ensure the schedule is not empty
            if (actualTimeBlocks === 0) {
                throw new Error('Schedule generation failed: No time blocks were scheduled');
            }
            
            // More specific validation to help debug
            if (rigidEvents.length > 0 && actualTimeBlocks < rigidEvents.length) {
                console.error('⚠️ Some rigid events may not have been scheduled!');
                console.error('Rigid events input:', rigidEvents);
            }
            
            if (flexibleEvents.length > 0 && actualTimeBlocks < (rigidEvents.length + flexibleEvents.length)) {
                console.error('⚠️ Some flexible events may not have been scheduled!');
                console.error('Flexible events input:', flexibleEvents);
                
                // Additional debugging for flexible events
                console.log('🔍 FLEXIBLE EVENT ANALYSIS:');
                flexibleEvents.forEach((event, index) => {
                    console.log(`Event ${index + 1}:`, {
                        name: event.name || event.getName?.(),
                        duration: event.duration,
                        durationType: typeof event.duration,
                        deadline: event.deadline?.toString?.() || event.getDeadline?.()?.toString?.(),
                        priority: event.priority,
                        type: event.type
                    });
                });
                
                // Check if it's a duration parsing issue
                const hasDurationIssue = flexibleEvents.some(event => 
                    typeof event.duration === 'string' || isNaN(parseInt(event.duration))
                );
                if (hasDurationIssue) {
                    console.error('🚨 DURATION ISSUE DETECTED: Some flexible events have non-numeric durations!');
                } else {
                    console.log('✅ All flexible events have numeric durations');
                }
            }

            // Save to local state (for offline access)
            const localScheduleEntry = { 
                name: name, 
                schedule: schedule, 
                isActive: false,
                backendId: null // Will be updated after backend save
            };
            setAppState({ ...appState, savedSchedules: [...appState.savedSchedules, localScheduleEntry]});
            
            // Convert to backend format and save to database
            setIsSavingToBackend(true);
            console.log('💾 Converting schedule to backend format...');
            
            try {
                // Use the new conversion helper instead of custom logic
                const backendSchedule = convertScheduleToBackendJSON(schedule);
                if (!backendSchedule) {
                    throw new Error('Failed to convert schedule to backend format');
                }

                // Override title with user's chosen name
                backendSchedule.title = name;

                console.log('📤 Saving schedule to backend...', { backendSchedule });
                
                // Create schedule in backend
                const savedSchedule = await createSchedule(backendSchedule);
                console.log('✅ Schedule saved to backend:', savedSchedule);
                
                // Update local schedule with backend ID
                if (savedSchedule.success && savedSchedule.data) {
                    setAppState(prevState => ({
                        ...prevState,
                        savedSchedules: prevState.savedSchedules.map(s => 
                            s.name === name ? { ...s, backendId: savedSchedule.data.id } : s
                        )
                    }));
                }
                
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