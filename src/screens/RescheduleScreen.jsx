import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAppState } from '../context/AppStateContext.js';
import { lightColor, darkColor } from '../design/colors.js';
import { spacing, padding } from '../design/spacing.js';

import RescheduleStartView from '../scheduling-logic-views/RescheduleStartView.jsx';
import BreaksView from '../scheduling-logic-views/BreaksView.jsx';
import RigidEventsView from '../scheduling-logic-views/RigidEventsView.jsx';
import FlexibleEventsView from '../scheduling-logic-views/FlexibleEventsView.jsx';
import EventDependenciesView from '../scheduling-logic-views/EventDependenciesView.jsx';
import FinalCheckView from '../scheduling-logic-views/FinalCheckView.jsx';

const { width, height } = Dimensions.get('window');
const SPACE = (height > 900) ? spacing.SPACING_4 : (height > 800) ? spacing.SPACING_3 : spacing.SPACING_2;

const RescheduleScreen = ({ route }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;
    const { schedule } = route.params;

    const flow1 = [
        <RescheduleStartView schedule={schedule}/>
    ]

    const flow2 = [
        <RescheduleStartView schedule={schedule}/>,
        <BreaksView/>,
        <RigidEventsView/>,
        <FlexibleEventsView/>,
        <EventDependenciesView/>
    ]

    const flow3 = [
        <RescheduleStartView schedule={schedule}/>,
        <FinalCheckView/>
    ]

    const flows = [flow1, flow2, flow3];

    const [reschedStage, setReschedStage] = useState(0);
    const [flow, setFlow] = useState(flow1);

    const RescheduleSelection = (index) => {
        setFlow(flows[index]);
        if (index === 0) {
            // Handle Missed Task Shifting
        } else {
            // Handle Add New Tasks & Breaks or Switch Strategies
            setReschedStage(1);
        }
    }

    return (
        <View style={{ ...styles.container, backgroundColor: theme.BACKGROUND }}>
            <Text style={{ ...styles.title, color: theme.FOREGROUND }}>Reschedule Tasks</Text>
            <RescheduleStartView schedule={schedule} />
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