import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeIcon from '../../assets/nav-icons/HomeIcon.svg';
import TasksIcon from '../../assets/nav-icons/TasksIcon.svg';
import GenerateIcon from '../../assets/nav-icons/GenerateIcon.svg';
import SavedIcon from '../../assets/nav-icons/SavedIcon.svg';
import PreferencesIcon from '../../assets/nav-icons/PreferencesIcon.svg';
import Indicator from '../../assets/nav-icons/Indicator.svg';
import { useAppState } from '../context/AppStateContext.js';
import { lightColor, darkColor } from '../design/colors.js';

const BAR_HEIGHT = 64;
const INDICATOR_DIM = 3 * BAR_HEIGHT / 4;
const ICON_DIM = INDICATOR_DIM / 2;
const PADDING_HORIZONTAL = 5/6 * ICON_DIM;
const OFFSET = (BAR_HEIGHT - INDICATOR_DIM) / 2;
const DIST = ICON_DIM * 2.5;

const NavigationBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const { appState } = useAppState();
    let theme = (appState.userPreferences.theme === 'light') ? lightColor : darkColor;

    const ICONS = {
        Home: HomeIcon,
        Tasks: TasksIcon,
        Generate: GenerateIcon,
        Saved: SavedIcon,
        Preferences: PreferencesIcon,
    };

    const indicatorX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const index = state.index;
        const xPosition = index * (DIST + ICON_DIM) + OFFSET;
        Animated.spring(indicatorX, {
            toValue: xPosition,
            useNativeDriver: true,
        }).start();
    }, [state.index]);

    return (
        <View
            style={{
                backgroundColor: theme.BACKGROUND,
                paddingBottom: insets.bottom,
                paddingTop: 40,
                height: BAR_HEIGHT + insets.bottom,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View style={{ ...styles.bar, backgroundColor: theme.NAVBAR }}>
                <Animated.View
                    style={[
                        styles.indicator,
                        { transform: [{ translateX: indicatorX }], },
                    ]}
                >
                    <Indicator width={INDICATOR_DIM} height={INDICATOR_DIM} color={'white'} />
                </Animated.View>
                {state.routes.map((route, index) => {
                    const isActive = state.index === index;
                    const Icon = ICONS[route.name];

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => navigation.navigate(route.name)}
                        >
                            <Icon width={ICON_DIM} height={ICON_DIM} color={isActive ? '#000' : '#FFF'} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    bar: {
        height: BAR_HEIGHT,
        borderRadius: 32,
        backgroundColor: '#000000',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        padding: PADDING_HORIZONTAL,
        gap: DIST
    },
    indicator: {
        position: 'absolute',
        top: 8,
        left: 0,
        zIndex: -1,
    },
})

export default NavigationBar