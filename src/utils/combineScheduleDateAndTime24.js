/**
 * Combines a ScheduleDate and a Time24 object into a native JavaScript Date object.
 * @param {ScheduleDate} scheduleDate - An instance with fields: day, month, year
 * @param {Time24} time24 - An object with fields: hours (0–23), minutes (0–59)
 * @returns {Date} JavaScript Date object
 */
const combineScheduleDateAndTime24 = (scheduleDate, time24) => {
    const { date, month, year } = scheduleDate;
    const { hours, minutes } = time24;
  
    return new Date(year, month - 1, date, hours, minutes);
};
  
export default combineScheduleDateAndTime24;  