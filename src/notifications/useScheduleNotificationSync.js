import { useEffect } from 'react';
import NotificationService from '../notifications/NotificationService';

export default function useScheduleNotificationSync(activeSchedule, userPreferences) {
    useEffect(() => {
        if (!activeSchedule || !userPreferences || !userPreferences.taskRemindersEnabled) return;

        const syncNotifications = async () => {
            // Step 1: Cancel all scheduled notifications
            await NotificationService.cancelAllNotifications();

            // Step 2: Loop through all days & timeBlocks
            const allDays = Object.keys(activeSchedule.weekSchedule);
            for (const day of allDays) {
                const tasks = activeSchedule.getScheduleForDay(day).getTimeBlocks();

                for (const task of tasks) {
                    if (task.type === 'break' || task.isCompleted) continue;
                    const leadMinutes = userPreferences.leadMinutes || 10;
                    await NotificationService.scheduleTaskReminder(task, leadMinutes);
                }
            }

            console.log("🔁 Notifications synced with active schedule.");
        };

        syncNotifications();
    }, [activeSchedule, userPreferences]);
}
