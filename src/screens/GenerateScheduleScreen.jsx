import React, { useState, useContext } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAppState } from '../context/AppStateContext.js'
import { lightColor, darkColor } from '../design/colors.js'

import InfoView from '../generate-schedule-views/InfoView.jsx'
import BreaksView from '../generate-schedule-views/BreaksView.jsx'
import RigidEventsView from '../generate-schedule-views/RigidEventsView.jsx'
import FlexibleEventsView from '../generate-schedule-views/FlexibleEventsView.jsx'
import EventDependenciesView from '../generate-schedule-views/EventDependenciesView.jsx'
import FinalCheckView from '../generate-schedule-views/FinalCheckView.jsx'
import GenerationView from '../generate-schedule-views/GenerationView.jsx'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import Scheduler from '../model/Scheduler'

const GenerateScheduleScreen = () => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const [genStage, setGenStage] = useState(0);
    const [scheduler, setScheduler] = useState(new Scheduler(new Date(), 'Sunday', 15, 8));
    const [events, setEvents] = useState([]);
    const [schedule, setSchedule] = useState(null);
    const [firstDate, setFirstDate] = useState(new Date());
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);

    const titles = ['I. Information', 'II. Breaks', 'III. Rigid Events', 'IV. Flexible Events', 'V. Event Dependencies', 'VI. Rounding Up']

    const SchedulerInitialization = (numDays, date, gap, workingLimit) => {
        const startDate = convertDateToScheduleDate(date)
        const dayString = date.toLocaleDateString('en-US', { weekday: 'long' });
        const numDaysInt = parseInt(numDays)
        const minGap = parseInt(gap)
        const maxHours = parseInt(workingLimit)

        setScheduler(new Scheduler(numDays, startDate, dayString, minGap, maxHours))
        setGenStage(1)

        setFirstDate(date)
    }

    const BreaksSetup = (breakList, repeatedBreakList) => {
        scheduler.setBreaks(breakList)
        scheduler.setRepeatedBreaks(repeatedBreakList)
        setGenStage(2)
    }

    const RigidEventsSetup = (eventsList) => {
        scheduler.setRigidEvents(eventsList);
        setEvents([...events, ...eventsList]);
        setGenStage(3);
    }

    const FlexibleEventsSetup = (eventsList) => {
        scheduler.setFlexibleEvents(eventsList);
        setEvents([...events, ...eventsList]);
        setGenStage(4);
    }

    const EventDepsSetup = (eventDeps) => {
        scheduler.setEventDependencies(eventDeps)
        setGenStage(5)
    }

    const Generation = (startTime, endTime, strategy) => {
        (strategy == 'earliest-fit')
            ? strategy = "Earliest Fit" 
            : (strategy == 'balanced-work')
                ? strategy = "Balanced Work"
                : (strategy == 'deadline-oriented')
                    ? strategy = "Deadline Oriented"
                    : null
        setSchedule(scheduler.createSchedules(strategy, startTime, endTime))
        setGenStage(6);
        setShowLoadingScreen(true);
    }

    const views = [
        <InfoView onNext={SchedulerInitialization}/>,
        <BreaksView onNext={BreaksSetup} minDate={firstDate} numDays={scheduler.numDays} onBack={() => {setGenStage(genStage - 1)}}/>,
        <RigidEventsView onNext={RigidEventsSetup} minDate={firstDate} numDays={scheduler.numDays} onBack={() => {setGenStage(genStage - 1)}}/>,
        <FlexibleEventsView onNext={FlexibleEventsSetup} minDate={firstDate} numDays={scheduler.numDays} onBack={() => {setGenStage(genStage - 1)}}/>,
        <EventDependenciesView onNext={EventDepsSetup} events={events} onBack={() => {setGenStage(genStage - 1)}}/>,
        <FinalCheckView onNext={Generation}/>,
        <GenerationView playAnim={showLoadingScreen}/>
    ]

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND}}>{titles[genStage]}</Text>
            {views[genStage]}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        height: '100%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: 64,
        marginBottom: 8
    },
    
})

export default GenerateScheduleScreen