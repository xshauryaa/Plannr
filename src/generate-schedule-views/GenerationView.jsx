import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LottieView from 'lottie-react-native';

const GenerationView = ({ playAnim }) => {
    const [showAnim, setShowAnim] = useState(playAnim);
    const [showFinish, setShowFinish] = useState(false);
    const [title, setTitle] = useState('Generating Schedule');

    const onAnimFinish = () => {
        setShowFinish(true);
        setTitle('Schedule Generated!');
        setShowAnim(false);
    }

    useEffect(() => {
        setShowAnim(playAnim);
    }, [playAnim]);

    return (
        <View style={styles.subContainer}>
            <Text style={styles.title}>{title}</Text>
            <LottieView
                source={require('../../assets/animations/CalendarLoadingAnimation.json')}
                autoPlay
                loop={false}
                speed={2} 
                onAnimationFinish={() => onAnimFinish()}
                style={{ width: 300, height: 300 }}
            />
            {showFinish &&
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.subHeading}>Your schedule generation is complete. You can now view your schedule!</Text>
                    <TouchableOpacity 
                        style={styles.button}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, alignSelf: 'center' }}>
                            <Text style={{ color: '#FFF', fontFamily: 'AlbertSans', alignSelf: 'center' }}>View Schedule</Text>
                            <Image source={require('../../assets/images/GoToIcon.png')} style={{ width: 18, height: 18 }}/>
                        </View>
                    </TouchableOpacity>
                </View>
            }
        </View>
    )
};

const styles = StyleSheet.create({
    subContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        fontFamily: 'PinkSunset',
        marginTop: 64,
        marginBottom: 8,
    },
    subHeading: {
        fontSize: 16,
        fontFamily: 'AlbertSans',
        marginVertical: 8,
        textAlign: 'center'
    },
    button: {
        borderRadius: 12,
        backgroundColor: '#000' ,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginVertical: 16,
        alignSelf: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12
    },
});

export default GenerationView;