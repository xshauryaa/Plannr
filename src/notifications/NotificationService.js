import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device'

export const initializeNotificationService = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
    }

    console.log('Notification permissions granted');
    return true;
}

export const scheduleNotification = async (content, trigger) => {
    if (!await initializeNotificationService()) {
        return null;
    }

    try {
        const notificationId = await Notifications.scheduleNotificationAsync({
            content,
            trigger,
        });

        console.log(`Notification scheduled → ID: ${notificationId}`);
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}