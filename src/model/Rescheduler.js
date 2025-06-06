import Schedule from "./Schedule";

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
                    if (!block.isCompleted()) return;
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
        // This method should implement the logic to replace missed tasks
        // based on the current schedule and the rescheduling strategy.
        // For now, it returns a placeholder message.
        return "Missed tasks replacement logic not implemented yet.";
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