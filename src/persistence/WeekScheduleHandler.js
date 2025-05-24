import WeekSchedule, { DAYS } from "../model/WeekSchedule.js";
import { serializeScheduleDate, parseScheduleDate } from "./ScheduleDateHandler.js";
import { serializeDaySchedule, parseDaySchedule } from "./DayScheduleHandler.js";


export const serializeWeekSchedule = (weekSchedule) => {
    if (!weekSchedule) return null;

    let daysList = [];
    for (const day of DAYS) {
        daysList.push([day, serializeDaySchedule(weekSchedule.getScheduleForDay(day))]);
    }

    return {
        day1Date: serializeScheduleDate(weekSchedule.day1Date),
        day1Day: weekSchedule.day1Day,
        minGap: weekSchedule.minGap,
        workingHoursLimit: weekSchedule.workingHoursLimit,
        weekSchedule: daysList
    };
}

export const parseWeekSchedule = (rawObj) => {
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

    let weekSchedule = new WeekSchedule(minGap, parseScheduleDate(rawObj.day1Date), day1Day, workingHoursLimit, schedule);


    return weekSchedule;
}