import Time24 from './Time24.js';
import ActivityType from './ActivityType.js';
import Priority from './Priority.js';

/**
 * Represents a block of time in a schedule.
 * Can be a rigid event, flexible event, or break.
 */
class TimeBlock {
  /**
   * Constructs a TimeBlock from a RigidEvent.
   * @param {RigidEvent} event 
   */
  constructor(event, isCompleted, date, startTime, endTime) {
    if (event.getType && event.getStartTime && event.getEndTime) {
      // RigidEvent
      this.name = event.getName();
      this.date = event.getDate();
      this.activityType = event.getType();
      this.priority = Priority.HIGH;
      this.startTime = event.getStartTime();
      this.endTime = event.getEndTime();
      this.duration = event.getDuration();
      this.isCompleted = isCompleted;
      this.deadline = event.getDate();
      this.type = 'rigid';
    } else if (event.getDuration && typeof startTime === 'number' && typeof endTime === 'number') {
      // FlexibleEvent
      this.name = event.getName();
      this.date = date;
      this.activityType = event.getType();
      this.priority = event.getPriority();
      this.startTime = new Time24(startTime);
      this.endTime = new Time24(endTime);
      this.duration = event.getDuration();
      this.isCompleted = isCompleted;
      this.deadline = event.getDeadline();
      this.type = 'flexible';
    } else {
      // Break
      this.name = 'Break';
      this.date = date;
      this.activityType = ActivityType.BREAK;
      this.priority = Priority.LOW;
      this.startTime = event.getStartTime();
      this.endTime = event.getEndTime();
      this.duration = event.getDuration();
      this.isCompleted = isCompleted;
      this.deadline = date;
      this.type = 'break';
    }
  }

  /** @returns {string} name of the time block */
  getName() {
    return this.name;
  }

  /** @returns {ScheduleDate} date of the time block */
  getDate() {
    return this.date;
  }

  /** @returns {string|undefined} activity type (undefined for breaks) */
  getActivityType() {
    return this.activityType;
  }

  /** @returns {Time24} start time */
  getStartTime() {
    return this.startTime;
  }

  /** @returns {Time24} end time */
  getEndTime() {
    return this.endTime;
  }

  /** @returns {string} the type of time block: 'rigid', 'flexible', or 'break' */
  getType() {
    return this.type;
  }

  /** @returns {number} duration of the time block */
  getDuration() {
    return this.duration;
  }

  /** @returns {boolean} true if completed */
  isCompleted() {
    return this.isCompleted;
  }

  /**
   * Sets the completion status of this time block.
   * @param {boolean} completed 
   */
  setCompleted(completed) {
    this.isCompleted = completed;
  }

  /**
   * @param {any} other 
   * @returns {boolean} true if other block is equal to this one
   */
  equals(other) {
    return (
      other instanceof TimeBlock &&
      this.name === other.getName() &&
      this.date.equals(other.getDate()) &&
      this.startTime.equals(other.getStartTime()) &&
      this.endTime.equals(other.getEndTime()) &&
      this.duration === other.getDuration() &&
      this.type === other.getType()
    );
  }

  /**
   * @returns {string} human-readable summary
   */
  toString() {
    let result = `${this.startTime.toString()} - ${this.endTime.toString()}: ${this.name}`;
    if (this.type === 'break') {
      return result;
    }
    result += ` (${this.activityType})`;
    return result;
  }

  /**
   * Generates a UID for this block.
   * @returns {string} a unique identifier for the block
   */
  getUID() {
    const uid = `${this.date.toString()}-${this.startTime.toString()}-${this.name.replace(/\s+/g, '_')}`;
    return `${uid}@plannr.scheduler`.toLowerCase();
  }
}

export default TimeBlock;
