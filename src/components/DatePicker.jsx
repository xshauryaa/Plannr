import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker'
import { useAppState } from '../context/AppStateContext.js';
import { lightColor, darkColor } from '../design/colors.js';
import { typography } from '../design/typography.js';
import ScheduleDate from '../model/ScheduleDate.js';
import convertDateToScheduleDate from '../utils/dateConversion.js';
import convertTimeToTime24 from '../utils/timeConversion.js';

const DatePicker = ({onChange, minimumDate = null, maximumDate = null, deadlineMode=false }) => {

    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;    

    const DateMode = () => {
        // Ensure minimumDate is valid, default to current date if not provided
        const validMinimumDate = minimumDate || convertDateToScheduleDate(new Date());

        // Ensure initial values respect minimum date
        const initialDate = validMinimumDate.getDate();
        const initialMonth = validMinimumDate.getMonth();
        const initialYear = validMinimumDate.getYear();

        const [selectedDate, setSelectedDate] = useState(initialDate);
        const [selectedMonth, setSelectedMonth] = useState(initialMonth);
        const [selectedYear, setSelectedYear] = useState(initialYear);

        const datesFor30DayMonths = Array.from({ length: 30 }, (_, i) => i + 1);
        const datesFor31DayMonths = Array.from({ length: 31 }, (_, i) => i + 1);
        const datesForFebruarySolarYear = Array.from({ length: 28 }, (_, i) => i + 1);
        const datesForFebruaryLeapYear = Array.from({ length: 29 }, (_, i) => i + 1);
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const years = Array.from({ length: 76 }, (_, i) => 2025 + i);

        // Function to update available dates based on month and year
        const updateDatesForMonth = (month, year) => {
            let dates;
            if (month === 2) {
                // February - check for leap year
                dates = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) 
                    ? datesForFebruaryLeapYear 
                    : datesForFebruarySolarYear;
            } else if ([4, 6, 9, 11].includes(month)) {
                // April, June, September, November - 30 days
                dates = datesFor30DayMonths;
            } else {
                // All other months - 31 days
                dates = datesFor31DayMonths;
            }

            return dates;
        };

        // Function to check if a date is valid (not before minimum date and not after maximum date)
        const isDateValid = (date, month, year) => {
            if (!validMinimumDate) return true;
            
            const minYear = validMinimumDate.getYear();
            const minMonth = validMinimumDate.getMonth();
            const minDate = validMinimumDate.getDate();

            // Check minimum date constraints
            if (year < minYear) return false;
            if (year >= minYear) {
                // Year is after minimum, check maximum constraints
                if (maximumDate) {
                    const maxYear = maximumDate.getYear();
                    const maxMonth = maximumDate.getMonth();
                    const maxDate = maximumDate.getDate();

                    if (year > maxYear) return false;
                    if (year < maxYear) return true;
                    if (month > maxMonth) return false;
                    if (month < maxMonth) return true;
                    return date <= maxDate;
                }
                return true;
            }
            
            // Same year as minimum
            if (month < minMonth) return false;
            if (month > minMonth) {
                // Month is after minimum, check maximum constraints
                if (maximumDate && year === maximumDate.getYear()) {
                    const maxMonth = maximumDate.getMonth();
                    const maxDate = maximumDate.getDate();

                    if (month > maxMonth) return false;
                    if (month < maxMonth) return true;
                    return date <= maxDate;
                }
                return true;
            }
            
            // Same year and month as minimum
            const isNotBeforeMinDate = date >= minDate;
            
            // Check maximum date if in same year and month
            if (maximumDate && year === maximumDate.getYear() && month === maximumDate.getMonth()) {
                const maxDate = maximumDate.getDate();
                return isNotBeforeMinDate && date <= maxDate;
            }
            
            return isNotBeforeMinDate;
        };

        // Initialize selectedDates state after function definitions
        const [selectedDates, setSelectedDates] = useState(
            updateDatesForMonth(initialMonth, initialYear)
        );

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {/* Month Picker */}
                <View style={{ width: '40%' }}>
                    <Picker
                        selectedValue={selectedMonth}
                        onValueChange={(itemValue) => {
                            // Check if the selected month/year combination is valid (use day 1 to check month validity)
                            if (!isDateValid(1, itemValue, selectedYear)) {
                                // If invalid, don't allow the selection
                                return;
                            }
                            
                            setSelectedMonth(itemValue);
                            const newDates = updateDatesForMonth(itemValue, selectedYear);
                            setSelectedDates(newDates);
                            
                            // Adjust selected date if it's beyond the new month's limit or invalid
                            const maxDate = newDates.length;
                            let newSelectedDate = selectedDate;
                            if (selectedDate > maxDate) {
                                newSelectedDate = maxDate;
                            }
                            
                            // Check if the current date is valid for the new month
                            if (!isDateValid(newSelectedDate, itemValue, selectedYear)) {
                                // Find the first valid date
                                for (let date = 1; date <= maxDate; date++) {
                                    if (isDateValid(date, itemValue, selectedYear)) {
                                        newSelectedDate = date;
                                        break;
                                    }
                                }
                            }
                            
                            setSelectedDate(newSelectedDate);
                            onChange(new ScheduleDate(newSelectedDate, itemValue, selectedYear));
                        }}
                        themeVariant={appState.userPreferences.theme}
                        style={{ fontSize: typography.headingSize, color: theme.FOREGROUND }}
                        itemStyle={{ fontSize: typography.headingSize, color: theme.FOREGROUND }}
                    >
                        {months.map((month, index) => (
                            <Picker.Item label={month} value={index + 1} key={index} />
                        ))}
                    </Picker>
                </View>

                {/* Date Picker */}
                <View style={{ width: '25%' }}>
                    <Picker
                        selectedValue={selectedDate}
                        onValueChange={(itemValue) => {
                            // Check if the selected date is valid
                            if (!isDateValid(itemValue, selectedMonth, selectedYear)) {
                                // If invalid, don't allow the selection
                                return;
                            }
                            
                            setSelectedDate(itemValue);
                            onChange(new ScheduleDate(itemValue, selectedMonth, selectedYear));
                        }}
                        themeVariant={appState.userPreferences.theme}
                        style={{ fontSize: typography.headingSize, color: theme.FOREGROUND }}
                        itemStyle={{ fontSize: typography.headingSize, color: theme.FOREGROUND }}
                    >
                        {selectedDates.map((date, index) => (
                            <Picker.Item label={date.toString()} value={date} key={index} />
                        ))}
                    </Picker>
                </View>

                {/* Year Picker */}
                <View style={{ width: '35%' }}>
                    <Picker
                        selectedValue={selectedYear}
                        onValueChange={(itemValue) => {
                            // Check if the selected year is valid (use current month and day 1 to check year validity)
                            if (!isDateValid(1, selectedMonth, itemValue)) {
                                // If the current month is invalid for this year, don't allow selection
                                return;
                            }
                            
                            setSelectedYear(itemValue);
                            const newDates = updateDatesForMonth(selectedMonth, itemValue);
                            setSelectedDates(newDates);
                            
                            // Adjust selected date if it's beyond the new month's limit
                            const maxDate = newDates.length;
                            let newSelectedDate = selectedDate;
                            if (selectedDate > maxDate) {
                                newSelectedDate = maxDate;
                            }
                            
                            // Check if the current date is still valid for the new year
                            if (!isDateValid(newSelectedDate, selectedMonth, itemValue)) {
                                // Find the first valid date
                                for (let date = 1; date <= maxDate; date++) {
                                    if (isDateValid(date, selectedMonth, itemValue)) {
                                        newSelectedDate = date;
                                        break;
                                    }
                                }
                            }
                            
                            setSelectedDate(newSelectedDate);
                            onChange(new ScheduleDate(newSelectedDate, selectedMonth, itemValue));
                        }}
                        themeVariant={appState.userPreferences.theme}
                        style={{ fontSize: typography.headingSize, color: theme.FOREGROUND }}
                        itemStyle={{ fontSize: typography.headingSize, color: theme.FOREGROUND }}
                    >
                        {years.map((year, index) => (
                            <Picker.Item label={year.toString()} value={year} key={index} />
                        ))}
                    </Picker>
                </View>
            </View>
        )
    }

    return ( 
        <DateMode />
    )
};

export default DatePicker;
