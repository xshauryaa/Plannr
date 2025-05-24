import React, { createContext, useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Scheduler from '../model/Scheduler'
import ScheduleDate from '../model/ScheduleDate'
import RigidEvent from '../model/RigidEvent';
import ActivityType from '../model/ActivityType';
import FlexibleEvent from '../model/FlexibleEvent';
import Priority from '../model/Priority';
import Break from '../model/Break';
import EventDependencies from '../model/EventDependencies';
import CircularDependencyError from '../model/exceptions/CircularDependencyError';
import useCurrentTime from '../utils/useCurrentTime';
import { serializeWeekSchedule, parseWeekSchedule } from '../persistence/WeekScheduleHandler.js';

export const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {

    let scheduleForTesting = null
    function schedulerTest1() {
        const scheduler = new Scheduler(new ScheduleDate(23, 5, 2025), 'Friday', 30, 6);
        
        // --- Rigid Events ---
        const rigidEvents = [
            new RigidEvent("Church Visit", ActivityType.PERSONAL, 60, new ScheduleDate(23, 5, 2025), 1000, 1100),
            new RigidEvent("Math Midterm", ActivityType.EDUCATION, 120, new ScheduleDate(24, 5, 2025), 1000, 1200),
            new RigidEvent("Physio Checkup", ActivityType.PERSONAL, 30, new ScheduleDate(25, 5, 2025), 900, 930),
            new RigidEvent("Team Workshop", ActivityType.WORK, 120, new ScheduleDate(26, 5, 2025), 1400, 1600),
            new RigidEvent("Chemistry Quiz", ActivityType.EDUCATION, 60, new ScheduleDate(26, 5, 2025), 900, 1000),
            new RigidEvent("Staff Meeting", ActivityType.WORK, 60, new ScheduleDate(27, 5, 2025), 1100, 1200),
            new RigidEvent("Manager Check-In", ActivityType.WORK, 30, new ScheduleDate(27, 5, 2025), 1500, 1530),
            new RigidEvent("Final Presentation", ActivityType.WORK, 60, new ScheduleDate(28, 5, 2025), 1500, 1600),
            new RigidEvent("Dinner Party", ActivityType.PERSONAL, 120, new ScheduleDate(29, 5, 2025), 1900, 2100)
        ];
        rigidEvents.forEach(e => scheduler.addRigidEvent(e));
        
        // --- Flexible Events ---
        const flexibleEvents = [
            new FlexibleEvent("Study Math Chapters", ActivityType.EDUCATION, 90, Priority.HIGH, new ScheduleDate(24, 5, 2025)),
            new FlexibleEvent("Fill Health Journal", ActivityType.PERSONAL, 30, Priority.LOW, new ScheduleDate(25, 5, 2025)),
            new FlexibleEvent("Slide Draft", ActivityType.WORK, 60, Priority.MEDIUM, new ScheduleDate(26, 5, 2025)),
            new FlexibleEvent("Write Research Notes", ActivityType.EDUCATION, 45, Priority.MEDIUM, new ScheduleDate(27, 5, 2025)),
            new FlexibleEvent("Data Cleaning", ActivityType.WORK, 30, Priority.LOW, new ScheduleDate(27, 5, 2025)),
            new FlexibleEvent("Weekly Planning", ActivityType.PERSONAL, 20, Priority.LOW, new ScheduleDate(29, 5, 2025)),
            new FlexibleEvent("Report Draft", ActivityType.WORK, 90, Priority.HIGH, new ScheduleDate(28, 5, 2025)),
            new FlexibleEvent("Design Mockups", ActivityType.WORK, 60, Priority.MEDIUM, new ScheduleDate(28, 5, 2025)),
            new FlexibleEvent("Proofread Notes", ActivityType.EDUCATION, 30, Priority.LOW, new ScheduleDate(28, 5, 2025)),
            new FlexibleEvent("Buy Gifts", ActivityType.PERSONAL, 45, Priority.LOW, new ScheduleDate(29, 5, 2025)),
            new FlexibleEvent("Reflective Essay", ActivityType.EDUCATION, 60, Priority.HIGH, new ScheduleDate(29, 5, 2025)),
            new FlexibleEvent("Meditation Session", ActivityType.PERSONAL, 30, Priority.LOW, new ScheduleDate(23, 5, 2025)),
            new FlexibleEvent("Read Case Studies", ActivityType.EDUCATION, 60, Priority.MEDIUM, new ScheduleDate(26, 5, 2025)),
            new FlexibleEvent("Finalize Budget", ActivityType.WORK, 40, Priority.MEDIUM, new ScheduleDate(28, 5, 2025)),
            new FlexibleEvent("Email Follow-Ups", ActivityType.WORK, 30, Priority.LOW, new ScheduleDate(27, 5, 2025)),
            new FlexibleEvent("Packing Checklist", ActivityType.PERSONAL, 20, Priority.LOW, new ScheduleDate(29, 5, 2025))
        ];
        flexibleEvents.forEach(e => scheduler.addFlexibleEvent(e));
        
        // --- Breaks ---
        scheduler.addBreak(new ScheduleDate(24, 5, 2025), new Break(30, 1300, 1330));
        scheduler.addBreak(new ScheduleDate(26, 5, 2025), new Break(30, 1200, 1230));
        scheduler.addBreak(new ScheduleDate(27, 5, 2025), new Break(30, 1000, 1030));
        scheduler.addBreak(new ScheduleDate(28, 5, 2025), new Break(30, 900, 930));
        scheduler.addRepeatedBreak(new Break(30, 1700, 1730));
        
        // --- Dependencies ---
        const deps = new EventDependencies();
        const depList = [
            ["Math Midterm", "Study Math Chapters"],
            ["Fill Health Journal", "Physio Checkup"],
            ["Write Research Notes", "Slide Draft"],
            ["Proofread Notes", "Write Research Notes"],
            ["Reflective Essay", "Proofread Notes"],
            ["Design Mockups", "Slide Draft"],
            ["Design Mockups", "Report Draft"],
            ["Report Draft", "Staff Meeting"],
            ["Finalize Budget", "Report Draft"],
            ["Email Follow-Ups", "Staff Meeting"],
            ["Buy Gifts", "Weekly Planning"],
            ["Packing Checklist", "Buy Gifts"]
        ];
        const nameToEvent = {};
        [...rigidEvents, ...flexibleEvents].forEach(e => {
            nameToEvent[e.getName()] = e;
        });
        
        try {
            for (const [dependent, prerequisite] of depList) {
            deps.addDependency(nameToEvent[dependent], nameToEvent[prerequisite]);
            }
        } catch (e) {
            if (e instanceof CircularDependencyError) {
            console.error(e.message);
            }
        }
        scheduler.setEventDependencies(deps);
        
        // --- Schedule Generation ---
        return scheduler.createSchedules("Earliest Fit", 800, 1700)
        
        // --- Optional ICS Output ---
        // const paths = [
        //   'data/earliest-fit-schedule.ics',
        //   'data/balanced-work-schedule.ics',
        //   'data/deadline-oriented-schedule.ics'
        // ];
        // for (let i = 0; i < paths.length; i++) {
        //   ICSHandler.getInstance().generateICS(schedules[i], paths[i]);
        // }
    }

    scheduleForTesting = schedulerTest1()

    // console.log(scheduleForTesting.getScheduleForDay('Friday').getTimeBlocks())
    
    const [appState, setAppState] = useState({
        name: 'Shaurya',
        userPreferences: {
            theme: 'light',
            defaultStrategy: 'earliest-fit',
            defaultStartTime: '800',
            defaultEndTime: '1700',
            defaultMinGap: '15',
            defaultMaxWorkingHours: '8',
            incompleteTaskNotification: 0,
            taskRemindersEnabled: true
        },
        savedSchedules: [],
        activeSchedule: scheduleForTesting,
        onboarded: false
    });
    const [storageLoaded, setStorageLoaded] = useState(true);

    useEffect(() => {
        const loadAppState = async () => {
            try {
                const raw = await AsyncStorage.getItem('appState');
                const parsed = raw ? parseAppState(JSON.parse(raw)) : null;
                setAppState(parsed);
            } catch (e) {
                console.error('Failed to load app state from storage', e);
            } finally {
                setStorageLoaded(true);
            }
        };
        loadAppState();
    }, []);

    useEffect(() => {
        console.log("Writing state")
        if (storageLoaded) {
            AsyncStorage.setItem('appState', JSON.stringify(serializeAppState(appState)));
        }
    }, [appState]);

    return (
        <AppStateContext.Provider value={{ appState, setAppState, storageLoaded }}>
          {children}
        </AppStateContext.Provider>
      )
}

const serializeAppState = (appState) => {
    if (!appState) return null;

    return {
        name: appState.name,
        userPreferences: appState.userPreferences,
        savedSchedules: appState.savedSchedules.map(schedule => ({
            name: schedule.name,
            schedule: serializeWeekSchedule(schedule.schedule)
        })),
        activeSchedule: serializeWeekSchedule(appState.activeSchedule),
        onboarded: appState.onboarded
    };
}

const parseAppState = (rawObj) => {
    if (!rawObj || rawObj.name == null || rawObj.userPreferences == null || rawObj.savedSchedules == null || rawObj.activeSchedule == null || rawObj.onboarded == null) {
        return null;
    }

    return {
        name: rawObj.name,
        userPreferences: rawObj.userPreferences,
        savedSchedules: rawObj.savedSchedules.map(sched => ({
            name: sched.name,
            schedule: parseWeekSchedule(sched.schedule)
        })),
        activeSchedule: parseWeekSchedule(rawObj.activeSchedule),
        onboarded: rawObj.onboarded
    };
}

export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (context === undefined) {
      throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};  