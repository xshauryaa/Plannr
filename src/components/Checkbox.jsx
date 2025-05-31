import React, { useState } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import Checked from '../../assets/system-icons/Checked.svg'
import Unchecked from '../../assets/system-icons/Unchecked.svg'

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
            ? <Checked style={styles.checkbox} width={24} height={24} />
            : <Unchecked style={styles.checkbox} width={24} height={24} />
        }
        </TouchableOpacity>
        : <TouchableOpacity style={{ width: 24, height: 24 }} onPress={handlePress}>
        { isChecked 
            ? <Checked width={24} height={24} />
            : <Unchecked width={24} height={24} />
        }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    checkbox: {
        position: 'absolute',
        right: 16,
    }
})

export default Checkbox