import DaySchedule from "../model/DaySchedule";

import { serializeScheduleDate, parseScheduleDate } from "./scheduleDateHandler";
import { serializeBreak, parseBreak } from "./breakHandler";
import { serializeFlexibleEvent, parseFlexibleEvent } from "./FlexibleEventHandler";
import { serializeRigidEvent, parseRigidEvent } from "./rigidEventHandler";
import { serializeTimeBlock, parseTimeBlock } from "./timeBlockHandler";
import FlexibleEvent from "../model/FlexibleEvent";
import RigidEvent from "../model/RigidEvent";

export const serializeDaySchedule = (daySchedule) => {
    if (!daySchedule) return null;

    let eventsList = [];
    for (let i = 0; i < daySchedule.events.length; i++) {
        if (daySchedule.events[i] instanceof FlexibleEvent) {
            eventsList.push(serializeFlexibleEvent(daySchedule.events[i]));
        } else if (daySchedule.events[i] instanceof RigidEvent) {
            eventsList.push(serializeRigidEvent(daySchedule.events[i]));
        }
    }

    let breaksList = [];
    for (let i = 0; i < daySchedule.breaks.length; i++) {
        breaksList.push(serializeBreak(daySchedule.breaks[i]));
    }

    let timeBlocksList = [];
    for (let i = 0; i < daySchedule.timeBlocks.length; i++) {
        timeBlocksList.push(serializeTimeBlock(daySchedule.timeBlocks[i]));
    }

    return {
        day: daySchedule.day,
        date: serializeScheduleDate(daySchedule.date),
        minGap: daySchedule.minGap,
        workingHoursLimit: daySchedule.workingHoursLimit,
        events: eventsList,
        breaks: breaksList,
        timeBlocks: timeBlocksList
    };
}

export const parseDaySchedule = (rawObj) => {
    if (!rawObj || rawObj.day == null || rawObj.date == null || rawObj.minGap == null || rawObj.workingHoursLimit == null || rawObj.events == null || rawObj.breaks == null || rawObj.timeBlocks == null) {
        return null;
    }

    let eventsList = [];
    for (let i = 0; i < rawObj.events.length; i++) {
        if (rawObj.events[i].deadline != null) {
            eventsList.push(parseFlexibleEvent(rawObj.events[i]));
        } else if (rawObj.events[i].date != null && rawObj.events[i].startTime != null && rawObj.events[i].endTime != null) {
            eventsList.push(parseRigidEvent(rawObj.events[i]));
        } else {
            return null; // Invalid event type
        }
    }

    let breaksList = [];
    for (let i = 0; i < rawObj.breaks.length; i++) {
        breaksList.push(parseBreak(rawObj.breaks[i]));
    }

    let timeBlocksList = [];
    for (let i = 0; i < rawObj.timeBlocks.length; i++) {
        timeBlocksList.push(parseTimeBlock(rawObj.timeBlocks[i]));
    }

    return new DaySchedule(
        rawObj.day,
        parseScheduleDate(rawObj.date),
        rawObj.minGap,
        rawObj.workingHoursLimit,
        eventsList,
        breaksList,
        timeBlocksList
    );
}