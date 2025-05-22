import DaySchedule from './DaySchedule.js';
import ScheduleDate from './ScheduleDate.js';
import TimeBlock from './TimeBlock.js';
import RigidEvent from './RigidEvent.js';
import FlexibleEvent from './FlexibleEvent.js';
import { serializeWeekSchedule } from '../persistence/weekScheduleHandler.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Represents a week schedule that contains schedules for each day of the week.
 */
class WeekSchedule {
  /**
   * @param {number} minGap - The minimum gap between events
   * @param {ScheduleDate} day1Date - The date of the first day in the week
   * @param {string} day1Day - The day of the week on which the schedule starts
   * @param {number} workingHoursLimit - Max working hours per day
   */
  constructor(minGap, day1Date, day1Day, workingHoursLimit, schedule) {
    this.day1Date = day1Date; // the first date of the week
    this.weekSchedule = schedule; // ordered map of day → DaySchedule
    if (!this.weekSchedule) {
        this.weekSchedule = new Map();
        this._initiateWeekSchedule(minGap, day1Date, day1Day, workingHoursLimit);
    }
  }

  /** @returns {Map<string, DaySchedule>} the full week schedule */
  getWeekSchedule() {
    return this.weekSchedule;
  }

  /** @returns {ScheduleDate} the first date of the week */
  getFirstDate() {
    return this.day1Date;
  }

  /**
   * @param {ScheduleDate} date 
   * @returns {string|null} the day of the week corresponding to the given date
   */
  getDayFromDate(date) {
    for (const day of DAYS) {
      const schedule = this.getScheduleForDay(day);
      if (schedule && schedule.getDate().equals(date)) {
        return day;
      }
    }
    return null;
  }

  /**
   * @param {string} day 
   * @returns {DaySchedule} the schedule for the specified day
   */
  getScheduleForDay(day) {
    return this.weekSchedule.get(day);
  }

  /**
   * @param {string} day 
   * @param {RigidEvent} event 
   */
  addEvent(day, event) {
    this.weekSchedule.get(day).addEvent(event);
  }

  /**
   * @param {string} day 
   * @param {FlexibleEvent} event 
   * @param {number} startTime 
   * @param {number} endTime 
   * @throws {EventConflictError}
   * @throws {WorkingLimitExceededError}
   */
  addFlexibleEvent(day, event, startTime, endTime) {
    this.weekSchedule.get(day).addFlexibleEvent(event, startTime, endTime);
  }

  /**
   * Locates the time block for a given event.
   * @param {Event} event 
   * @returns {TimeBlock|null}
   */
  locateTimeBlockForEvent(event) {
    const flag = event instanceof RigidEvent ? 'rigid' :
                 event instanceof FlexibleEvent ? 'flexible' : null;
    if (!flag) return null;

    for (const day of DAYS) {
      const schedule = this.weekSchedule.get(day);
      for (const timeBlock of schedule) {
        if (timeBlock.getName() === event.getName() && timeBlock.getType() === flag) {
          return timeBlock;
        }
      }
    }

    return null;
  }

  /**
   * Adds the same break to all days of the week.
   * @param {Break} breakTime 
   */
  addBreakToFullWeek(breakTime) {
    for (const day of DAYS) {
      this.weekSchedule.get(day).addBreak(breakTime);
    }
  }

  /**
   * Adds a break to a specific day.
   * @param {string} day 
   * @param {Break} breakTime 
   */
  addBreak(date, breakTime) {
    let dayToAdd = ''
    for (const day of DAYS) {
        const schedule = this.getScheduleForDay(day);
        if (schedule && schedule.getDate().equals(date)) {
          dayToAdd = day
          break
        }
    }
    this.weekSchedule.get(dayToAdd).addBreak(breakTime);
  }

  /**
   * Removes an event from a specific day's schedule.
   * @param {string} day 
   * @param {Event} event 
   */
  removeEvent(day, event) {
    this.weekSchedule.get(day).removeEvent(event);
  }

  /**
   * Removes a break from a specific day's schedule.
   * @param {string} day 
   * @param {Break} breakTime 
   */
  removeBreak(day, breakTime) {
    this.weekSchedule.get(day).removeBreak(breakTime);
  }

  /**
   * @returns {number} total occupied hours for the entire week
   */
  calculateTotalOccupiedHours() {
    let totalMinutes = 0;
    for (const day of DAYS) {
      const schedule = this.weekSchedule.get(day);
      for (const timeBlock of schedule) {
        if (timeBlock.getType() !== 'break') {
          totalMinutes += timeBlock.getDuration();
        }
      }
    }
    return totalMinutes / 60;
  }

  /**
   * Iterator over all the day schedules in the week.
   * @returns {Iterator<DaySchedule>}
   */
  [Symbol.iterator]() {
    return this.weekSchedule.values();
  }

  /**
   * Initializes the full 7-day week schedule starting from a specific day and date.
   * @private
   * @param {number} minGap 
   * @param {ScheduleDate} day1Date 
   * @param {string} day1Day 
   * @param {number} workingHoursLimit 
   */
  _initiateWeekSchedule(minGap, day1Date, day1Day, workingHoursLimit) {
    let index = DAYS.indexOf(day1Day);
    let currDate = day1Date;

    for (let i = 0; i < 7; i++) {
      const dayName = DAYS[index % 7];
      const schedule = new DaySchedule(dayName, currDate, minGap, workingHoursLimit, [], [], []);
      this.weekSchedule.set(dayName, schedule);
      currDate = currDate.getNextDate();
      index++;
    }
  }

  toJSON() {
    return serializeWeekSchedule(this);
  }
}

export default WeekSchedule;
export { DAYS };
