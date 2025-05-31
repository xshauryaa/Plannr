import React, { useState } from 'react'
import { View, Image, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native' 
import EventDependencies from '../model/EventDependencies';
import AddDependencyModal from '../components/AddDependencyModal';
import AddIcon from '../../assets/system-icons/AddIcon.svg'
import CrossIcon from '../../assets/system-icons/CrossIcon.svg';


const EventDependenciesView = ({ onNext, events, onBack }) => {
    const [eventDependencies, setEventDependencies] = useState(new EventDependencies());
    const [showModal, setShowModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const addEventDependency = (event, prerequisiteEvents) => {
        let prereq = null
        try {
            for (prereq of prerequisiteEvents) {
                eventDependencies.addDependency(event, prereq);
            }
        } catch (CircularDependencyError) {
            console.warn("Circular dependency detected:", event, prereq);
            setShowErrorModal(true);
            for (prereq of prerequisiteEvents) {
                eventDependencies.removeDependency(event, prereq);
            }
        }
        setEventDependencies(new EventDependencies(eventDependencies.getDependencies()));
        setShowModal(false);
    }

    const renderDependencySet = (dependentEvent) => {
        const dependencies = eventDependencies.getDependenciesForEvent(dependentEvent);
        const listOfDeps = dependencies.map(dep => dep.name).join(', ');

        return (
            <View style={styles.depCard}>
                <Text style={{ ...styles.subHeading, fontSize: 12 }}>{dependentEvent.name}  </Text>
                <Text style={{ ...styles.subHeading, fontSize: 12 }}>{listOfDeps}</Text>
                <TouchableOpacity onPress={() => { 
                    const deps = eventDependencies.getDependenciesForEvent(dependentEvent);
                    for (const dep of deps) {
                        eventDependencies.removeDependency(dependentEvent, dep);
                    }
                    setEventDependencies(new EventDependencies(eventDependencies.getDependencies())); 
                }}>
                    <CrossIcon width={24} height={24} />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.subContainer}>
            <View>
                <Text style={styles.subHeading}>Please add if you'd like certain events done before others, such as A must be done before B.</Text>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => setShowModal(true)}
                >
                    <AddIcon width={18} height={18} />
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Add New Dependency</Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <FlatList
                        data={Array.from(eventDependencies.getDependencies().keys())}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={( item ) => item.id }
                        renderItem={({ item }) => renderDependencySet(item)}
                    />
                </View>
            </View>
            <View style={styles.horizontalGrid}>
                <TouchableOpacity 
                    style={{ ...styles.button, marginVertical: 0, width: '48%' }}
                    onPress={() => onBack()}
                >
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{ ...styles.button, marginVertical: 0, width: '48%' }}
                    onPress={() => onNext(eventDependencies)}
                >
                    <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>Next</Text>
                </TouchableOpacity>
            </View>
            <AddDependencyModal
                isVisible={showModal}
                onClick={ (events, prereqs) => addEventDependency(events, prereqs) }
                events={events}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    subContainer: {
        height: '87.5%',
        justifyContent: 'space-between'
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginVertical: 8
    },
    card: {
        height: '60%',
        width: '95%',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        marginVertical: 16,
        padding: 16,
        alignSelf: 'center'
    },
    horizontalGrid: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
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
        marginVertical: 16,
        gap: 12
    },
    depCard: {
        height: 40, 
        backgroundColor: "#F0F0F0",
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 12
    },
})

export default EventDependenciesView