import ActivityType from '../model/ActivityType';

export const serializeActivityType = (activityType) => {
    return activityType;
};  

export const parseActivityType = (rawObj) => {
    if (Object.values(ActivityType).includes(rawObj)) {
        return rawObj;
    }
    return ActivityType.OTHER;
};
