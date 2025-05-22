import React, { useState, useContext } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import InfoView from '../generate-schedule-views/InfoView'
import BreaksView from '../generate-schedule-views/BreaksView'
import RigidEventsView from '../generate-schedule-views/RigidEventsView'
import FlexibleEventsView from '../generate-schedule-views/FlexibleEventsView'
import EventDependenciesView from '../generate-schedule-views/EventDependenciesView'
import FinalCheckView from '../generate-schedule-views/FinalCheckView'
import convertDateToScheduleDate from '../utils/dateConversion.js'
import Scheduler from '../model/Scheduler'

const GenerateScheduleScreen = () => {
    const [genStage, setGenStage] = useState(0)
    const [scheduler, setScheduler] = useState(new Scheduler(new Date(), 'Sunday', 15, 8))
    const [breaks, setBreaks] = useState([])
    const [repeatedBreaks, setRepeatedBreaks] = useState([])
    const [rigidEvents, setRigidEvents] = useState([])
    const [flexibleEvents, setFlexibleEvents] = useState([])
    const [deps, setDeps] = useState(null)
    const [schedule, setSchedule] = useState(null)
    const [firstDate, setFirstDate] = useState(new Date())

    const titles = ['I. Information', 'II. Breaks', 'III. Rigid Events', 'IV. Flexible Events', 'V. Event Dependencies', 'VI. Final Information']

    const SchedulerInitialization = (date, gap, workingLimit) => {
        const startDate = convertDateToScheduleDate(date)
        const dayString = date.toLocaleDateString('en-US', { weekday: 'long' });
        const minGap = parseInt(gap)
        const maxHours = parseInt(workingLimit)

        setScheduler(new Scheduler(startDate, dayString, minGap, maxHours))
        setGenStage(1)

        setFirstDate(date)
    }

    const BreaksSetup = (breakList, repeatedBreakList) => {
        // setBreaks(breakList)
        // setRepeatedBreaks(repeatedBreakList)
        scheduler.setBreaks(breakList)
        scheduler.setRepeatedBreaks(repeatedBreakList)
        setGenStage(2)
    }

    const RigidEventsSetup = (eventsList) => {
        // setRigidEvents(eventsList)
        scheduler.setRigidEvents(eventsList)
        setGenStage(3)
    }

    const FlexibleEventsSetup = (eventsList) => {
        // setFlexibleEvents(eventsList)
        scheduler.setFlexibleEvents(eventsList)
        setGenStage(4)
    }

    const EventDepsSetup = (eventDeps) => {
        // setDeps(eventDeps)
        scheduler.setEventDependencies(eventDeps)
        setGenStage(5)
    }

    const Generation = (startTime, endTime, strategy) => {
        setSchedule(scheduler.createSchedules(strategy, startTime, endTime))
        setGenStage(6)
    }

    const views = [
        <InfoView onNext={SchedulerInitialization}/>,
        <BreaksView onNext={BreaksSetup} minDate={firstDate} onBack={() => {setGenStage(genStage - 1)}}/>,
        <RigidEventsView onNext={RigidEventsSetup} minDate={firstDate} onBack={() => {setGenStage(genStage - 1)}}/>,
        <FlexibleEventsView onNext={FlexibleEventsSetup} minDate={firstDate} onBack={() => {setGenStage(genStage - 1)}}/>,
        <EventDependenciesView onNext={EventDepsSetup} onBack={() => {setGenStage(genStage - 1)}}/>,
        <FinalCheckView onNext={Generation} onBack={() => {setGenStage(genStage - 1)}}/>
    ]
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{titles[genStage]}</Text>
            {views[genStage]}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
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