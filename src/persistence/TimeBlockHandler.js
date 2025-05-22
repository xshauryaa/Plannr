import TimeBlock from "../model/TimeBlock";
import { serializeScheduleDate, parseScheduleDate } from "./scheduleDateHandler";
import { serializeActivityType, parseActivityType } from "./ActivityTypeHandler";
import { serializeTime24, parseTime24 } from "./Time24Handler";
import { serializePriority, parsePriority } from "./PriorityHandler";
import FlexibleEvent from "../model/FlexibleEvent";

export const serializeTimeBlock = (timeBlock) => {
    if (!timeBlock) return null;

    return {
        name: timeBlock.name,
        date: serializeScheduleDate(timeBlock.date),
        activityType: serializeActivityType(timeBlock.activityType),
        priority: serializePriority(timeBlock.priority),
        startTime: serializeTime24(timeBlock.startTime),
        endTime: serializeTime24(timeBlock.endTime),
        duration: timeBlock.duration,
        isCompleted: timeBlock.isCompleted,
        deadline: serializeScheduleDate(timeBlock.deadline),
        type: timeBlock.type
    };
}

export const parseTimeBlock = (rawObj) => {
    if (!rawObj || rawObj.name == null || rawObj.date == null || rawObj.activityType == null || rawObj.priority == null || rawObj.startTime == null || rawObj.endTime == null || rawObj.duration == null || rawObj.isCompleted == null || rawObj.deadline == null || rawObj.type == null) {
        return null;
    }

    if (rawObj.type == 'flexible') {
        const event = new FlexibleEvent(rawObj.name, parseActivityType(rawObj.type), rawObj.duration, parsePriority(rawObj.priority), parseScheduleDate(rawObj.deadline));
        return new TimeBlock(
            event,
            rawObj.isCompleted,
            parseScheduleDate(rawObj.date),
            parseTime24(rawObj.startTime),
            parseTime24(rawObj.endTime)
        );
    } else if (rawObj.type == 'rigid') {
        const event = new RigidEvent(rawObj.name, parseActivityType(rawObj.type), rawObj.duration, parseScheduleDate(rawObj.date), parseTime24(rawObj.startTime), parseTime24(rawObj.endTime));
        return new TimeBlock(
            event,
            rawObj.isCompleted
        );
    } else if (rawObj.type == 'break') {
        const breakObj = new Break(rawObj.duration, parseTime24(rawObj.startTime), parseTime24(rawObj.endTime));
        return new TimeBlock(
            breakObj,
            rawObj.isCompleted,
            parseScheduleDate(rawObj.date),
        );
    }
}