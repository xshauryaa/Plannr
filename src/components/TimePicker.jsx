import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Time24 from '../model/Time24.js';
import { typography } from '../design/typography.js';
import { lightColor, darkColor } from '../design/colors.js';
import { useAppState } from '../context/AppStateContext.js';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const TimePicker = ({ value, onChange }) => {
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const initialHour = value.getHour() === 0 ? 12 : (value.getHour() > 12 ? value.getHour() - 12 : value.getHour());
    const initialMinute = value.getMinute();
    const initialMeridian = value.getHour() >= 12 ? 'PM' : 'AM';

    const [selectedHour, setSelectedHour] = useState(initialHour);
    const [selectedMinute, setSelectedMinute] = useState(initialMinute);
    const [selectedMeridian, setSelectedMeridian] = useState(initialMeridian);

    // Helper function to convert 12-hour format to 24-hour format
    const convertTo24Hour = (hour12, meridian) => {
        if (meridian === 'AM') {
            return hour12 === 12 ? 0 : hour12;
        } else { // PM
            return hour12 === 12 ? 12 : hour12 + 12;
        }
    };

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {/* Hour Input */}
            <TextInput
                style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                keyboardType="numeric"
                maxLength={2}
                placeholder="HH"
                value={selectedHour === '' ? '' : selectedHour.toString()}
                onChangeText={(text) => {
                    if (text === '') {
                        // Allow empty input for editing
                        setSelectedHour('');
                        return;
                    }
                    
                    const hour = parseInt(text, 10);
                    if (!isNaN(hour) && hour >= 1 && hour <= 12) {
                        setSelectedHour(hour);
                        // Only call onChange if we have a valid minute
                        if (selectedMinute !== '' && !isNaN(selectedMinute)) {
                            const hour24 = convertTo24Hour(hour, selectedMeridian);
                            console.log(`Selected Time: ${hour}:${selectedMinute} ${selectedMeridian} (24h: ${hour24}:${selectedMinute})`);
                            console.log(new Time24(parseInt(hour24) * 100 + parseInt(selectedMinute)));
                            onChange(new Time24(parseInt(hour24) * 100 + parseInt(selectedMinute)));
                        }
                    }
                }}
            />
            <Text style={{ fontFamily: 'AlbertSans', fontSize: typography.subHeadingSize, color: theme.FOREGROUND }}> : </Text>
            {/* Minute Input */}
            <TextInput
                style={{ ...styles.input, backgroundColor: theme.INPUT, color: theme.FOREGROUND }}
                keyboardType="numeric"
                maxLength={2}
                placeholder="MM"
                value={selectedMinute === '' ? '' : (selectedMinute.toString())}
                onChangeText={(text) => {
                    if (text === '') {
                        // Allow empty input for editing
                        setSelectedMinute('');
                        return;
                    }
                    
                    const minute = parseInt(text, 10);
                    if (!isNaN(minute) && minute >= 0 && minute < 60) {
                        setSelectedMinute(minute);
                        // Only call onChange if we have a valid hour
                        if (selectedHour !== '' && !isNaN(selectedHour)) {
                            const hour24 = convertTo24Hour(selectedHour, selectedMeridian);
                            console.log(`Selected Time: ${selectedHour}:${minute} ${selectedMeridian} (24h: ${hour24}:${selectedMinute})`);
                            console.log(new Time24(parseInt(hour24) * 100 + parseInt(minute)));
                            onChange(new Time24(parseInt(hour24) * 100 + parseInt(minute)));
                        }
                    }
                }}
            />
            {/* Meridian Selector */}
            <SegmentedControl
                values={['AM', 'PM']}
                selectedIndex={selectedMeridian === 'AM' ? 0 : 1}
                onChange={(event) => {
                    const newMeridian = event.nativeEvent.value;
                    setSelectedMeridian(newMeridian);
                    // Only call onChange if we have valid hour and minute values
                    if (selectedHour !== '' && !isNaN(selectedHour) && selectedMinute !== '' && !isNaN(selectedMinute)) {
                        const hour24 = convertTo24Hour(selectedHour, newMeridian);
                        console.log(`Selected Time: ${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${newMeridian} (24h: ${hour24}:${selectedMinute.toString().padStart(2, '0')})`);
                        onChange(new Time24(parseInt(hour24) * 100 + parseInt(selectedMinute)));
                    }
                }}
                style={{ width: 100, marginLeft: 10, height: 40, borderRadius: 12 }}
                tintColor={theme.COMP_COLOR}
                fontStyle={{ fontFamily: 'AlbertSans', fontSize: typography.subHeadingSize, color: theme.FOREGROUND }}
                backgroundColor={theme.INPUT}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        width: 60, 
        height: 40,
        borderRadius: 12, 
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F0F0F0',
    },
});

export default TimePicker;
