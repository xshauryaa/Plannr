import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useAppState } from '../context/AppStateContext'
import { lightColor, darkColor } from '../design/colors.js'
import { typography } from '../design/typography.js'
import { LinearGradient } from 'expo-linear-gradient';
import AIIcon from '../../assets/system-icons/AIIcon.svg';
import CollapsibleTaskCard from '../components/CollapsibleTaskCard';

const ReviewTasksView = ({ tasks, onNext, minDate, numDays }) => {
    const { appState } = useAppState();
    const [todoListInput, setTodoListInput] = useState('');

    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    return (
        <KeyboardAvoidingView 
            style={styles.subContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {/* <View>
                <Text style={{ ...styles.subHeading, color: theme.FOREGROUND }}>Make sure everything looks right before we schedule it.</Text>
                <View style={{ ...styles.card, backgroundColor: theme.COMP_COLOR }}>
                    <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, marginTop: 0, marginBottom: 16 }}>Enter or paste any task list you'd normally write in Notes, WhatsApp, Notion, or a doc.</Text>
                    <TextInput
                        placeholder="To-do list goes here..."
                        value={todoListInput}
                        onChangeText={setTodoListInput}
                        scrollEnabled={true}
                        multiline={true}
                        style={{ 
                            ...styles.input, 
                            backgroundColor: theme.INPUT, 
                            color: theme.FOREGROUND,
                            minHeight: 250,
                        }}
                    />
                    <Text style={{ ...styles.subHeading, color: theme.FOREGROUND, marginBottom: 0, opacity: 0.3 }}>Enter tasks as a list, use "- " for each task. You'll review and edit everything next.</Text>
                </View>
            </View> */}
            <Text>
                {tasks.map((task, index) => `- ${task.name}`).join('\n')}
            </Text>
            <FlatList
                data={tasks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <CollapsibleTaskCard task={item} key={index} minDate={minDate} numDays={numDays} />
                )}
            />
            <TouchableOpacity 
                onPress={ () => onNext(todoListInput) }
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
