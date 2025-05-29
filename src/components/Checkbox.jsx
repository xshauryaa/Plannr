import React, { useState } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'

const Checkbox = ({ checked, onChange, needAbsolute = true }) => {
    const [isChecked, setIsChecked] = useState(checked)
    
    const handlePress = () => {
        setIsChecked(!isChecked)
        onChange()
    }
    
    return (
        (needAbsolute)
        ? <TouchableOpacity style={styles.checkbox} onPress={handlePress}>
        { isChecked 
            ? <Image style={styles.checkbox} source={require('../../assets/images/Checked.png')}/> 
            : <Image style={styles.checkbox} source={require('../../assets/images/Unchecked.png')}/> 
        }
        </TouchableOpacity>
        : <TouchableOpacity style={{ width: 24, height: 24 }} onPress={handlePress}>
        { isChecked 
            ? <Image style={{ width: 24, height: 24 }} source={require('../../assets/images/Checked.png')}/> 
            : <Image style={{ width: 24, height: 24 }} source={require('../../assets/images/Unchecked.png')}/> 
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