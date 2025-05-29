import Schedule from "../model/Schedule.js";
import { serializeScheduleDate, parseScheduleDate } from "./ScheduleDateHandler.js";
import { serializeDaySchedule, parseDaySchedule } from "./DayHandler.js";


export const serializeSchedule = (schedule) => {
    if (!schedule) return null;

    let datesList = [];
    for (const date of schedule.getAllDatesInOrder()) {
        datesList.push([date, serializeDaySchedule(schedule.getScheduleForDate(date))]);
    }

    return {
        numDays: schedule.numDays,
        day1Date: serializeScheduleDate(schedule.day1Date),
        day1Day: schedule.day1Day,
        minGap: schedule.minGap,
        workingHoursLimit: schedule.workingHoursLimit,
        schedule: datesList
    };
}

export const parseSchedule = (rawObj) => {
    if (!rawObj || rawObj.day1Date == null || rawObj.schedule == null) {
        return null;
    }

    let schedule = new Map();
    for (const [day, rawDaySchedule] of rawObj.schedule) {
        const parsedDay = parseDaySchedule(rawDaySchedule);
        if (!parsedDay) {
            continue;
        }
        schedule.set(day, parsedDay);
    }

    const numDays = rawObj.numDays;
    const minGap = rawObj.minGap;
    const workingHoursLimit = rawObj.workingHoursLimit;
    let day1Day = rawObj.day1Day;

    let scheduleToReturn = new Schedule(numDays, minGap, parseScheduleDate(rawObj.day1Date), day1Day, workingHoursLimit, schedule);


    return scheduleToReturn;
}