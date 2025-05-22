import FlexibleEvent from "../model/FlexibleEvent";
import { serializeScheduleDate, parseScheduleDate } from "./scheduleDateHandler";
import { serializeActivityType, parseActivityType } from "./ActivityTypeHandler";
import { serializePriority, parsePriority } from "./PriorityHandler";

export const serializeFlexibleEvent = (eventObj) => {
    if (!eventObj) return null;

    return {
        name: eventObj.name,
        type: serializeActivityType(eventObj.type),
        duration: eventObj.duration,
        priority: serializePriority(eventObj.priority),
        deadline: serializeScheduleDate(eventObj.deadline)
    }
}

export const parseFlexibleEvent = (rawObj) => {
    if (!rawObj || rawObj.name == null || rawObj.type == null || rawObj.duration == null || rawObj.priority == null || rawObj.deadline == null) {
        return null;
    }

    return new FlexibleEvent(
        rawObj.name,
        parseActivityType(rawObj.type),
        rawObj.duration,
        parsePriority(rawObj.priority),
        parseScheduleDate(rawObj.deadline)
    );
}