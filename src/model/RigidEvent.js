import Event from './Event';
import Time24 from './Time24';
import ActivityType from './ActivityType';
import ScheduleDate from './ScheduleDate';

/**
 * Represents a rigid event that has a fixed date and time of occurrence.
 */
class RigidEvent extends Event {
  /**
   * @param {string} name - The name of the event
   * @param {string} type - The activity type of the event (from ActivityType)
   * @param {number} duration - The duration of the event in minutes
   * @param {ScheduleDate} date - The date of the event
   * @param {number} startTime - The start time in 24-hour integer format (e.g., 930)
   * @param {number} endTime - The end time in 24-hour integer format (e.g., 1045)
   */
  constructor(name, type, duration, date, startTime, endTime) {
    super(name, type, duration);
    this.date = date;
    this.startTime = new Time24(startTime);
    this.endTime = new Time24(endTime);
  }

  /** @returns {ScheduleDate} the date of the event */
  getDate() {
    return this.date;
  }

  /** @returns {Time24} the start time */
  getStartTime() {
    return this.startTime;
  }

  /** @returns {Time24} the end time */
  getEndTime() {
    return this.endTime;
  }
}

export default RigidEvent;
