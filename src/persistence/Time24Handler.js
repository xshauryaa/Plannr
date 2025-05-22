import Time24 from '../model/Time24';

export const serializeTime24 = (timeObj) => {
    if (!timeObj) return null;

    return timeObj.hour * 100 + timeObj.minute;
};  

export const parseTime24 = (rawObj) => {
    if (typeof rawObj !== 'number') return null;
    
    return new Time24(rawObj);
};
