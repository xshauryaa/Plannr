import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useAppState } from '../context/AppStateContext'
import { lightColor, darkColor } from '../design/colors.js'
import { typography } from '../design/typography.js'
import { LinearGradient } from 'expo-linear-gradient';
import AIIcon from '../../assets/system-icons/AIIcon.svg';
import CollapsibleTaskCard from '../components/CollapsibleTaskCard';

const ReviewTasksView = ({ tasks, onNext, minDate, numDays }) => {
    const { appState } = useAppState();
    const [taskList, setTaskList] = useState(tasks);

    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    return (
        <KeyboardAvoidingView 
            style={styles.subContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <FlatList
                data={taskList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <CollapsibleTaskCard task={item} key={index} minDate={minDate} numDays={numDays} />
                )}
                
            />
            <TouchableOpacity 
                onPress={ () => onNext() }
            >
                <LinearGradient
                    colors={[theme.GRADIENT_START, theme.GRADIENT_END]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                    <AIIcon height={20} width={20} />
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center', fontSize: 16 }}>Next</Text>
                </LinearGradient>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    subContainer: {
        flex: 1,
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    subHeading: {
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        marginVertical: 8
    },
    card: {
        width: '99%',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        padding: 16,
        marginTop: 4,
        marginBottom: 16,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    input: {
        borderRadius: 12, 
        fontSize: typography.subHeadingSize,
        fontFamily: 'AlbertSans',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    button: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 16,

        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4
    },
    warning: {
        fontSize: typography.bodySize,
        fontFamily: 'AlbertSans',
        marginTop: 8,
        color: '#FF0000',
        alignSelf: 'center'
    },
});

export default ReviewTasksView;
