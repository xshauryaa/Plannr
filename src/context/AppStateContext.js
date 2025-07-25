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
import { serializeSchedule, parseSchedule } from '../persistence/ScheduleHandler.js';
import useScheduleNotificationSync from '../notifications/useScheduleNotificationSync.js';

export const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {

    function testScheduler(firstDate) {
        const date1 = firstDate;
        const date2 = date1.getNextDate();
        const date3 = date2.getNextDate();
        const date4 = date3.getNextDate();
        const date5 = date4.getNextDate();
        const date6 = date5.getNextDate();
        const date7 = date6.getNextDate();
        const scheduler = new Scheduler(7, date1, 'Saturday', 30, 6);
        
        // --- Rigid Events ---
        const rigidEvents = [
            new RigidEvent("Church Visit", ActivityType.PERSONAL, 60, date1, 1000, 1100),
            new RigidEvent("Math Midterm", ActivityType.EDUCATION, 120, date2, 1000, 1200),
            new RigidEvent("Physio Checkup", ActivityType.PERSONAL, 30, date3, 900, 930),
            new RigidEvent("Team Workshop", ActivityType.WORK, 120, date4, 1400, 1600),
            new RigidEvent("Chemistry Quiz", ActivityType.EDUCATION, 60, date4, 900, 1000),
            new RigidEvent("Staff Meeting", ActivityType.WORK, 60, date5, 1100, 1200),
            new RigidEvent("Manager Check-In", ActivityType.WORK, 30, date5, 1500, 1530),
            new RigidEvent("Final Presentation", ActivityType.WORK, 60, date6, 1500, 1600),
            new RigidEvent("Dinner Party", ActivityType.PERSONAL, 120, date7, 1900, 2100)
        ];
        rigidEvents.forEach(e => scheduler.addRigidEvent(e));
        
        // --- Flexible Events ---
        const flexibleEvents = [
            new FlexibleEvent("Study Math Chapters", ActivityType.EDUCATION, 90, Priority.HIGH, date2),
            new FlexibleEvent("Fill Health Journal", ActivityType.PERSONAL, 30, Priority.LOW, date3),
            new FlexibleEvent("Slide Draft", ActivityType.WORK, 60, Priority.MEDIUM, date4),
            new FlexibleEvent("Write Research Notes", ActivityType.EDUCATION, 45, Priority.MEDIUM, date5),
            new FlexibleEvent("Data Cleaning", ActivityType.WORK, 30, Priority.LOW, date5),
            new FlexibleEvent("Weekly Planning", ActivityType.PERSONAL, 20, Priority.LOW, date7),
            new FlexibleEvent("Report Draft", ActivityType.WORK, 90, Priority.HIGH, date6),
            new FlexibleEvent("Design Mockups", ActivityType.WORK, 60, Priority.MEDIUM, date6),
            new FlexibleEvent("Proofread Notes", ActivityType.EDUCATION, 30, Priority.LOW, date6),
            new FlexibleEvent("Buy Gifts", ActivityType.PERSONAL, 45, Priority.LOW, date7),
            new FlexibleEvent("Reflective Essay", ActivityType.EDUCATION, 60, Priority.HIGH, date7),
            new FlexibleEvent("Meditation Session", ActivityType.PERSONAL, 30, Priority.LOW, date1),
            new FlexibleEvent("Read Case Studies", ActivityType.EDUCATION, 60, Priority.MEDIUM, date4),
            new FlexibleEvent("Finalize Budget", ActivityType.WORK, 40, Priority.MEDIUM, date6),
            new FlexibleEvent("Email Follow-Ups", ActivityType.WORK, 30, Priority.LOW, date5),
            new FlexibleEvent("Packing Checklist", ActivityType.PERSONAL, 20, Priority.LOW, date7)
        ];
        flexibleEvents.forEach(e => scheduler.addFlexibleEvent(e));
        
        // --- Breaks ---
        scheduler.addBreak(date2, new Break(30, 1300, 1330));
        scheduler.addBreak(date4, new Break(30, 1200, 1230));
        scheduler.addBreak(date5, new Break(30, 1000, 1030));
        scheduler.addBreak(date6, new Break(30, 900, 930));
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
        return scheduler.createSchedules("Earliest Fit", 800, 1700);
    }

    let scheduleForTesting1 = testScheduler(new ScheduleDate(27, 6, 2025));
    let scheduleForTesting2 = testScheduler(new ScheduleDate(4, 7, 2025));
    let scheduleForTesting3 = testScheduler(new ScheduleDate(17, 7, 2025));
    let scheduleForTesting4 = testScheduler(new ScheduleDate(18, 7, 2025));
    
    const [appState, setAppState] = useState({
        name: 'Vardaan',
        userPreferences: {
            theme: 'light',
            defaultStrategy: 'earliest-fit',
            defaultMinGap: '15',
            defaultMaxWorkingHours: '8',
            taskRemindersEnabled: true,
            leadMinutes: '30',
        },
        savedSchedules: [
            { name: 'Schedule 1', schedule: scheduleForTesting1, isActive: true },
            { name: 'Schedule 2', schedule: scheduleForTesting2, isActive: false },
            { name: 'July 3rd Week', schedule: scheduleForTesting3, isActive: false },
            { name: 'Schedule 4', schedule: scheduleForTesting4, isActive: false },
        ],
        activeSchedule: {name: 'Schedule 1', schedule: scheduleForTesting1, isActive: true},
        onboarded: false
    });
    const [storageLoaded, setStorageLoaded] = useState(true);

    useEffect(() => {
        const loadAppState = async () => {
            console.log("Loading state")
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

    useScheduleNotificationSync(appState.activeSchedule?.schedule, appState.userPreferences);    

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
            schedule: serializeSchedule(schedule.schedule),
            isActive: schedule.isActive
        })),
        activeSchedule: appState.activeSchedule ? { name: appState.activeSchedule.name, schedule: serializeSchedule(appState.activeSchedule.schedule), isActive: appState.activeSchedule.active } : null,
        onboarded: appState.onboarded
    };
}

const parseAppState = (rawObj) => {
    if (!rawObj || rawObj.name == null || rawObj.userPreferences == null || rawObj.savedSchedules == null || rawObj.onboarded == null) {
        return null;
    }

    return {
        name: rawObj.name,
        userPreferences: rawObj.userPreferences,
        savedSchedules: rawObj.savedSchedules.map(sched => ({
            name: sched.name,
            schedule: parseSchedule(sched.schedule),
            isActive: sched.isActive
        })),
        activeSchedule: rawObj.activeSchedule ? {name: rawObj.activeSchedule.name, schedule: parseSchedule(rawObj.activeSchedule.schedule), isActive: rawObj.activeSchedule.active} : null,
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