import Event from './Event';
import ActivityType from './ActivityType';
import ScheduleDate from './ScheduleDate';
import Priority from './Priority';

/**
 * Represents a flexible event that has no fixed time, but instead a priority and a deadline.
 */
class FlexibleEvent extends Event {
  /**
   * @param {string} name - The name of the event
   * @param {string} type - The type of activity (from ActivityType)
   * @param {number} duration - Duration in minutes
   * @param {string} priority - Priority of the event (from Priority enum)
   * @param {ScheduleDate} deadline - The deadline date
   */
  constructor(name, type, duration, priority, deadline) {
    super(name, type, duration);
    this.priority = priority;
    this.deadline = deadline;
  }

  /** @returns {ScheduleDate} the deadline of the event */
  getDeadline() {
    return this.deadline;
  }

  /** @returns {string} the priority of the event */
  getPriority() {
    return this.priority;
  }
}

export default FlexibleEvent;
