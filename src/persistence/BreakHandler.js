import { serializeTime24 } from './Time24Serializer';
import Break from '../model/Break';
import { parseTime24 } from './Time24Serializer';

export const serializeBreak = (breakObj) => {
    if (!breakObj) return null;

    return {
        duration: breakObj.duration,
        startTime: serializeTime24(breakObj.startTime),
        endTime: serializeTime24(breakObj.endTime),
    };
};

export const parseBreak = (rawObj) => {
    if (!rawObj || rawObj.duration == null || rawObj.startTime == null || rawObj.endTime == null) {
        return null;
    }
  
    return new Break(
        rawObj.duration,
        parseTime24(rawObj.startTime).toInt(),
        parseTime24(rawObj.endTime).toInt()
    );
};


