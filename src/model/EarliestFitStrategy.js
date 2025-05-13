import SchedulingStrategy from './SchedulingStrategy.js';
import WeekSchedule from './WeekSchedule.js';
import Time24 from './Time24.js';
import EventConflictError from './exceptions/EventConflictError.js';
import WorkingLimitExceededError from './exceptions/WorkingLimitExceededError.js';

class EarliestFitStrategy extends SchedulingStrategy {
  /**
   * Constructs the strategy with required scheduling data from the Scheduler.
   * @param {Scheduler} scheduler 
   * @param {ScheduleDate} firstDate 
   * @param {string} firstDay 
   * @param {number} minGap 
   * @param {number} workingHoursLimit 
   */
  constructor(scheduler, firstDate, firstDay, minGap, workingHoursLimit) {
    super();
    this.breaks = scheduler.breaks;
    this.repeatedBreaks = scheduler.repeatedBreaks;
    this.rigidEvents = scheduler.rigidEvents;
    this.flexibleEvents = scheduler.flexibleEvents;
    this.eventDependencies = scheduler.eventDependencies;

    this.earliestFitSchedule = new WeekSchedule(minGap, firstDate, firstDay, workingHoursLimit);
  }

  /**
   * Generates the schedule using earliest-fit strategy.
   * @param {number} earliestStartTime 
   * @param {number} latestEndTime 
   * @returns {WeekSchedule}
   */
  generateSchedule(earliestStartTime, latestEndTime) {
    const startTime = new Time24(earliestStartTime);
    const endTime = new Time24(latestEndTime);

    this._scheduleBreaks();
    this._scheduleEvents(startTime, endTime);

    return this.earliestFitSchedule;
  }

  /**
   * Schedules all breaks (both fixed and repeated).
   * @private
   */
  _scheduleBreaks() {
    for (const entry of this.breaks) {
      const [day, breakTime] = entry;
      this.earliestFitSchedule.addBreak(day, breakTime);
    }

    for (const breakTime of this.repeatedBreaks) {
      this.earliestFitSchedule.addBreakToFullWeek(breakTime);
    }
  }

  /**
   * Schedules all events in dependency-respecting order.
   * @param {Time24} earliestStartTime 
   * @param {Time24} latestEndTime 
   * @private
   */
  _scheduleEvents(earliestStartTime, latestEndTime) {
    const scheduled = new Set();
    const minGap = this.earliestFitSchedule.getScheduleForDay('Monday').getMinGap();

    // Schedule rigid events
    for (const rigidEvent of this.rigidEvents) {
      const day = this.earliestFitSchedule.getDayFromDate(rigidEvent.getDate());
      this.earliestFitSchedule.addEvent(day, rigidEvent);
      scheduled.add(rigidEvent);
    }

    // Topologically sort flexible events and schedule
    const sorted = this.topologicalSortOfEvents(this.eventDependencies, this.flexibleEvents);
    for (const event of sorted) {
      if (!scheduled.has(event)) {
        const hasDeps = this.eventDependencies.getDependenciesForEvent(event);
        if (!hasDeps || hasDeps.length === 0) {
          this._scheduleDependency(event, event.getDeadline(), latestEndTime, scheduled, minGap, earliestStartTime, latestEndTime);
        } else {
          this._scheduleAfterDependencies(event, event.getDeadline(), scheduled, minGap, earliestStartTime, latestEndTime);
        }
      }
    }
  }

  /**
   * Schedules a dependency recursively, ensuring all its dependencies are also scheduled.
   * @private
   */
  _scheduleDependency(dependency, beforeDate, lastTimeOnDate, scheduled, minGap, earliestStartTime, latestEndTime) {
    if (scheduled.has(dependency)) return;

    const dependencies = this.eventDependencies.getDependenciesForEvent(dependency);
    if (dependencies) {
      for (const dep of dependencies) {
        if (!scheduled.has(dep)) {
          this._scheduleDependency(dep, beforeDate, lastTimeOnDate, scheduled, minGap, earliestStartTime, latestEndTime);
        }
      }
    }

    for (const daySchedule of this.earliestFitSchedule) {
      const date = daySchedule.getDate();
      if (date.isAfter(beforeDate)) continue;

      const endTime = date.equals(beforeDate) ? lastTimeOnDate : latestEndTime;
      const slot = this.findAvailableSlot(daySchedule, dependency.getDuration(), earliestStartTime, endTime, minGap);

      if (slot) {
        try {
          daySchedule.addFlexibleEvent(dependency, slot[0], slot[1]);
          scheduled.add(dependency);
          return;
        } catch (e) {
          if (!(e instanceof WorkingLimitExceededError)) {
            // Unexpected error, rethrow
            throw e;
          }
          // Else skip and try next day
        }
      }
    }
  }

  /**
   * Schedules a flexible event after all its dependencies.
   * @private
   */
  _scheduleAfterDependencies(event, beforeDate, scheduled, minGap, earliestStartTime, latestEndTime) {
    const dependencies = this.eventDependencies.getDependenciesForEvent(event);
    let afterDate = null;
    let earliestTimeOnDate = null;

    for (const dep of dependencies) {
      const block = this.earliestFitSchedule.locateTimeBlockForEvent(dep);
      if (!afterDate || block.getDate().isAfter(afterDate)) {
        afterDate = block.getDate();
        earliestTimeOnDate = block.getEndTime();
      }
    }

    for (const daySchedule of this.earliestFitSchedule) {
      const date = daySchedule.getDate();
      if (date.isBefore(afterDate)) continue;
      if (date.isAfter(beforeDate)) continue;

      const startTime = date.equals(afterDate) ? earliestTimeOnDate : earliestStartTime;
      const slot = this.findAvailableSlot(daySchedule, event.getDuration(), startTime, latestEndTime, minGap);

      if (slot) {
        try {
          daySchedule.addFlexibleEvent(event, slot[0], slot[1]);
          scheduled.add(event);
          return;
        } catch (e) {
          if (!(e instanceof WorkingLimitExceededError)) {
            throw e;
          }
        }
      }
    }
  }
}

export default EarliestFitStrategy;
