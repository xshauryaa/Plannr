import React, { useState } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'

const Checkbox = ({ checked, onChange }) => {
    const [isChecked, setIsChecked] = useState(checked)
    
    const handlePress = () => {
        setIsChecked(!isChecked)
        onChange(!isChecked)
    }
    
    return (
        <TouchableOpacity style={styles.checkbox} onPress={handlePress}>
        { isChecked 
            ? <Image style={styles.checkbox} source={require('../../assets/images/Checked.png')}/> 
            : <Image style={styles.checkbox} source={require('../../assets/images/Unchecked.png')}/> 
        }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    checkbox: {
        width: 24,
        height: 24,
        position: 'absolute',
        right: 16,
    }
})

export default Checkbox