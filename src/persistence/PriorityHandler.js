import Priority from '../model/Priority';

export const serializePriority = (priority) => {
    return priority;
};  

export const parsePriority = (rawObj) => {
    if (Object.values(Priority).includes(rawObj)) {
        return rawObj;
    }
    return Priority.LOW;
};
