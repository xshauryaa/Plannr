import React, { useState, useContext } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import InfoView from '../generate-schedule-views/InfoView'
import BreaksView from '../generate-schedule-views/BreaksView'
import RigidEventsView from '../generate-schedule-views/RigidEventsView'
import FlexibleEventsView from '../generate-schedule-views/FlexibleEventsView'
import EventDependenciesView from '../generate-schedule-views/EventDependenciesView'
import FinalCheckView from '../generate-schedule-views/FinalCheckView'

const GenerateScheduleScreen = () => {
    const [genStage, setGenStage] = useState(0)
    const titles = ['I. Information', 'II. Breaks', 'III. Rigid Events', 'IV. Flexible Events', 'V. Event Dependencies', 'VI. Final Information']
    const views = [
        <InfoView/>,
        <BreaksView/>,
        <RigidEventsView/>,
        <FlexibleEventsView/>,
        <EventDependenciesView/>,
        <FinalCheckView/>
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