import Schedule from "../model/Schedule.js";
import { serializeTime24, parseTime24 } from "./TimeHandler.js";
import { serializeScheduleDate, parseScheduleDate } from "./ScheduleDateHandler.js";
import { serializeDaySchedule, parseDaySchedule } from "./DayHandler.js";
import { serializeEventDependencies, parseEventDependencies } from "./EventDependenciesHandler.js";


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
        eventDependencies: serializeEventDependencies(schedule.eventDependencies),
        schedule: datesList,
        strategy: schedule.strategy,
        startTime: serializeTime24(schedule.startTime),
        endTime: serializeTime24(schedule.endTime)
    };
}

export const parseSchedule = (rawObj) => {
    if (!rawObj || rawObj.day1Date == null || rawObj.eventDependencies == null || rawObj.schedule == null) {
        return null;
    }

    let schedule = new Map();
    for (const [date, rawDaySchedule] of rawObj.schedule) {
        const parsedDay = parseDaySchedule(rawDaySchedule);
        if (!parsedDay) {
            continue;
        }
        schedule.set(date, parsedDay);
    }

    const numDays = rawObj.numDays;
    const minGap = rawObj.minGap;
    const workingHoursLimit = rawObj.workingHoursLimit;
    const day1Day = rawObj.day1Day;
    const strategy = rawObj.strategy;
    

    let scheduleToReturn = new Schedule(numDays, minGap, parseScheduleDate(rawObj.day1Date), day1Day, workingHoursLimit, parseEventDependencies(rawObj.eventDependencies), schedule, strategy, parseTime24(rawObj.startTime), parseTime24(rawObj.endTime));


    return scheduleToReturn;
}