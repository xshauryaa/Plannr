import WeekSchedule, { DAYS } from "../model/WeekSchedule";
import { serializeScheduleDate, parseScheduleDate } from "./scheduleDateHandler";
import { serializeDaySchedule, parseDaySchedule } from "./dayScheduleHandler";


export const serializeWeekSchedule = (weekSchedule) => {
    if (!weekSchedule) return null;

    let daysList = [];
    for (const day of DAYS) {
        daysList.push([day, serializeDaySchedule(weekSchedule.getScheduleForDay(day))]);
    }

    return {
        day1Date: serializeScheduleDate(weekSchedule.day1Date),
        weekSchedule: daysList
    };
}

export const parseWeekSchedule = (rawObj) => {
    if (!rawObj || rawObj.day1Date == null || rawObj.weekSchedule == null) {
        return null;
    }

    let schedule = new Map();
    for (const [day, daySchedule] of rawObj.weekSchedule) {
        schedule.set(day, parseDaySchedule(daySchedule));
    }

    let weekSchedule = new WeekSchedule(parseScheduleDate(rawObj.day1Date), schedule);


    return weekSchedule;
}