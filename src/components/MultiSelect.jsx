import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import Checkbox from './Checkbox';

const MultiSelect = ({ currentSelected, items, selectedItems, onSelect }) => {
    const [checkedItems, setCheckedItems] = useState([]);
    const [showOptions, setShowOptions] = useState(false);

    return (
        <View>
            <View style={styles.input}>
                <Text style={{ fontFamily: 'AlbertSans', fontSize: 16, color: '#C0C0C0' }}>
                    Select prerequisites
                </Text>
                <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
                    <Image source={require('../../assets/images/DropDownIcon.png')} style={{ height: 24, width: 24 }} />
                </TouchableOpacity>
            </View>
            { showOptions && (
                <FlatList
                    data={items.filter(item => item.id !== currentSelected?.id)}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isChecked = selectedItems.some(i => i.id === item.id);
                        return (
                            <View 
                                style={{ padding: 8, borderBottomWidth: 1, borderColor: '#E0E0E0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <Text style={{ fontFamily: 'AlbertSans', fontSize: 16 }}>{item.name}</Text>
                                <Checkbox 
                                    onChange={() => {
                                        const updated = isChecked
                                          ? selectedItems.filter(i => i.id !== item.id)
                                          : [...selectedItems, item];
                                        onSelect(updated);
                                    }} 
                                    checked={checkedItems.includes(item)} 
                                    needAbsolute={false} 
                                />
                            </View>
                    )}}
                    style={{ maxHeight: 200, backgroundColor: '#FFF', borderRadius: 12, marginTop: 8 }}
                />) 
            }
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        width: 300,
        height: 40,
        borderRadius: 12, 
        fontSize: 16,
        fontFamily: 'AlbertSans',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
});

export default MultiSelect;