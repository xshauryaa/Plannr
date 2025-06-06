import Schedule from "./Schedule.js";
import EarliestFitStrategy from "./EarliestFitStrategy.js";
import BalancedWorkStrategy from "./BalancedWorkStrategy.js";
import DeadlineOrientedStrategy from "./DeadlineOrientedStrategy.js";
import convertDateToScheduleDate from "../utils/dateConversion.js";
import Time24 from "./Time24.js";
import Break from "./Break.js";

/**
 * Manages the rescheduling of tasks on user request.
 */
class Rescheduler {
    /**
     * @param {Schedule} schedule - The schedule to be rescheduled.
     */
    constructor(schedule) {
        this._extractBreaks(schedule);
        this._extractRigidEvents(schedule);
        this._extractFlexibleEvents(schedule);
        this._extractDependencies(schedule);
        this._extractCompletedTimeBlocks(schedule);
        this.strategy = schedule.strategy;
        this.numDays = schedule.numDays;
        this.firstDate = schedule.day1Date;
        this.firstDay = schedule.day1Day;
        this.minGap = schedule.minGap;
        this.workingHoursLimit = schedule.workingHoursLimit;
        this.startTime = schedule.startTime.toInt();
        this.endTime = schedule.endTime.toInt();
    }

    /**
     * @param {Schedule} schedule 
     */
    _extractBreaks(schedule) {
        this.breaks = [];
        schedule.getAllDatesInOrder().forEach(date => {
            const day = schedule.getScheduleForDate(date);
            if (day) {
                day.getBreaks().forEach(breakTime => {
                    this.breaks.push({ date: date, breakTime: breakTime });
                });
            }
        });
    }

    /**
     * @param {Schedule} schedule
     */
    _extractRigidEvents(schedule) {
        this.rigidEvents = [];
        schedule.getAllDatesInOrder().forEach(date => {
            const day = schedule.getScheduleForDate(date);
            if (day) {
                day.getRigidEvents().forEach(event => {
                    this.rigidEvents.push(event);
                });
            }
        });
    }

    /**
     * @param {Schedule} schedule
     */
    _extractFlexibleEvents(schedule) {
        this.flexibleEvents = [];
        schedule.getAllDatesInOrder().forEach(date => {
            const day = schedule.getScheduleForDate(date);
            if (day) {
                day.getFlexibleEvents().forEach(event => {
                    this.flexibleEvents.push(event);
                });
            }
        });
    }

    /**
     * @param {Schedule} schedule
     */
    _extractDependencies(schedule) {
        this.dependencies = schedule.eventDependencies;
    }

    /**
     * @param {Schedule} schedule
     */
    _extractCompletedTimeBlocks(schedule) {
        this.completedTimeBlocks = [];
        schedule.getAllDatesInOrder().forEach(date => {
            const day = schedule.getScheduleForDate(date);
            if (day) {
                day.getTimeBlocks().forEach(block => {
                    if (!block.isCompleted) return;
                    this.completedTimeBlocks.push(block);
                });
            }
        });
    }

    /**
     * @param {Schedule} schedule
     * @return {Schedule} the rescheduled schedule with all missing tasks replaced into an upcoming time block
     */
    missedTasksReplacement(schedule) {
        const now = new Date();
        const currentDate = convertDateToScheduleDate(now);
        const currentTime = new Time24(now.getHours() * 100 + now.getMinutes());

        const toReschedule = [];

        schedule.getAllDatesInOrder().forEach(date => {
            const day = schedule.getScheduleForDate(date);
            if (!day) return;

            day.getFlexibleEvents().forEach(event => {
                const tb = schedule.locateTimeBlockForEvent(event);
                if (!tb || tb.isCompleted) return;

                const dateOfDay = day.getDate();
                if (dateOfDay.isBefore(currentDate) ||
                    (dateOfDay.equals(currentDate) && tb.getEndTime().isBefore(currentTime)) ||
                    dateOfDay.isAfter(currentDate) ||
                    (dateOfDay.equals(currentDate) && tb.getStartTime().isAfter(currentTime))) {
                        toReschedule.push(event);
                        day.removeEvent(event);
                }
            });
        });

        if (toReschedule.length === 0) return schedule;

        let strat;
        switch (this.strategy) {
            case 'earliest-fit':
                strat = new EarliestFitStrategy({numDays: this.numDays, breaks: [], repeatedBreaks: [], rigidEvents: [], flexibleEvents: [], eventDependencies: this.dependencies}, this.firstDate, this.firstDay, this.minGap, this.workingHoursLimit);
                strat.reschedule(schedule, toReschedule, currentDate, currentTime);
                break;
            case 'balanced-work':
                strat = new BalancedWorkStrategy({numDays: this.numDays, breaks: [], repeatedBreaks: [], rigidEvents: [], flexibleEvents: [], eventDependencies: this.dependencies}, this.firstDate, this.firstDay, this.minGap, this.workingHoursLimit);
                strat.reschedule(schedule, toReschedule, currentDate, currentTime);
                break;
            case 'deadline-oriented':
                strat = new DeadlineOrientedStrategy({numDays: this.numDays, breaks: [], repeatedBreaks: [], rigidEvents: [], flexibleEvents: [], eventDependencies: this.dependencies}, this.firstDate, this.firstDay, this.minGap, this.workingHoursLimit);
                strat.reschedule(schedule, toReschedule, currentDate, currentTime);
                break;
            default:
                throw new Error(`Unknown strategy: ${this.strategy}`);
        }

        return schedule;
    }

    /**
     * @param {Schedule} schedule
     * @param {Event[]} newEvents - New events to be added to the schedule.
     * @param {Break[]} newBreaks - New breaks to be added to the schedule.
     * @return {Schedule} the schedule with new time blocks added
     */
    addNewTimeBlocks(schedule, newEvents, newBreaks) {
        // This method should implement the logic to add new time blocks
        // based on the new events and breaks provided.
        // For now, it returns a placeholder message.
        return "New time blocks addition logic not implemented yet.";
    }

    /**
     * @param {Schedule} schedule
     * @param {string} newStrategy - The new scheduling strategy to be applied.
     * @return {Schedule} the schedule with the new strategy applied
     */
    strategySwitch(schedule, newStrategy) {
        // This method should implement the logic to switch the scheduling strategy
        // for the current schedule.
        // For now, it returns a placeholder message.
        return `Switching strategy to ${newStrategy} is not implemented yet.`;
    }
}

export default Rescheduler;