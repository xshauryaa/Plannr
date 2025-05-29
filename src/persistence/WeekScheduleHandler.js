import Schedule, { DAYS } from "../model/Schedule.js";
import { serializeScheduleDate, parseScheduleDate } from "./ScheduleDateHandler.js";
import { serializeDaySchedule, parseDaySchedule } from "./DayScheduleHandler.js";


export const serializeSchedule = (schedule) => {
    if (!schedule) return null;

    let datesList = [];
    for (const date of schedule.getAllDatesInOrder()) {
        datesList.push([date, serializeDaySchedule(schedule.getScheduleForDate(date))]);
    }

    return {
        day1Date: serializeScheduleDate(schedule.day1Date),
        day1Day: schedule.day1Day,
        minGap: schedule.minGap,
        workingHoursLimit: schedule.workingHoursLimit,
        weekSchedule: datesList
    };
}

export const parseSchedule = (rawObj) => {
    if (!rawObj || rawObj.day1Date == null || rawObj.weekSchedule == null) {
        return null;
    }

    let schedule = new Map();
    for (const [day, rawDaySchedule] of rawObj.weekSchedule) {
        const parsedDay = parseDaySchedule(rawDaySchedule);
        if (!parsedDay) {
            continue;
        }
        schedule.set(day, parsedDay);
    }

    const minGap = rawObj.minGap;
    const workingHoursLimit = rawObj.workingHoursLimit;
    let day1Day = rawObj.day1Day;

    let scheduleToReturn = new Schedule(minGap, parseScheduleDate(rawObj.day1Date), day1Day, workingHoursLimit, schedule);


    return scheduleToReturn;
}