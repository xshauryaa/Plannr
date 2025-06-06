import { useEffect, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import useCurrentTime from "../utils/useCurrentTime";
import convertDateToScheduleDate from "../utils/dateConversion";
import convertTimeToTime24 from "../utils/timeConversion";
import NotificationService from "./NotificationService";

const TaskCompletionChecker = () => {
    const currentTime = useCurrentTime();
    const { activeSchedule } = useAppState();
    const [scheduledSummaryToday, setScheduledSummaryToday] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            const currTime24 = convertTimeToTime24(currentTime);
            if (currTime24.getHour() == 0 && currTime24.getMinute() == 0) {
                setScheduledSummaryToday(false);
            }
        }, 60000);
      
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!activeSchedule) return;

        const todaysDate = convertDateToScheduleDate(currentTime);
        const todaysTasks = activeSchedule.getScheduleForDate(todaysDate).getTimeBlocks();
        if (todaysTasks.length === 0) return;

        const currTime = convertTimeToTime24(currentTime);
        if (currTime.isBefore(new Time24(2255))) return;

        if (scheduledSummaryToday) return;

        let allComplete = true;
        for (const task of todaysTasks) {
            if (!task.isCompleted()) {
                allComplete = false;
                break;
            }
        }

        NotificationService.scheduleDailySummary(allComplete);
        setScheduledSummaryToday(true);
    }, [currentTime, scheduledSummaryToday]);
}

export default TaskCompletionChecker;