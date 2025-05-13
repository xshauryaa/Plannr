import CircularDependencyError from './exceptions/CircularDependencyError.js';

/**
 * Represents a collection of events mapped to their dependencies.
 */
class EventDependencies {
  constructor() {
    // Map from Event instances to arrays of dependent Event instances
    this.dependencies = new Map(); // preserves insertion order like LinkedHashMap
  }

  /**
   * @returns {Map} the map of event dependencies
   */
  getDependencies() {
    return this.dependencies;
  }

  /**
   * Adds a dependency to an event.
   * @param {Event} event 
   * @param {Event} dependency 
   * @throws {CircularDependencyError} if the dependency introduces a cycle
   */
  addDependency(event, dependency) {
    if (!this.dependencies.has(event)) {
      this.dependencies.set(event, []);
    }
    this.dependencies.get(event).push(dependency);

    if (this._hasCycle()) {
      this.dependencies.get(event).pop(); // revert the change
      throw new CircularDependencyError(dependency.toString(), event.toString());
    }
  }

  /**
   * Removes a dependency from an event.
   * @param {Event} event 
   * @param {Event} dependency 
   */
  removeDependency(event, dependency) {
    const deps = this.dependencies.get(event);
    if (deps) {
      this.dependencies.set(event, deps.filter(d => !d.equals(dependency)));
    }
  }

  /**
   * Gets the dependencies for a specific event.
   * @param {Event} event 
   * @returns {Event[]} list of dependencies for the event
   */
  getDependenciesForEvent(event) {
    return this.dependencies.get(event) || [];
  }

  /**
   * @returns {boolean} true if there is a cycle in the dependencies
   */
  _hasCycle() {
    const visited = new Set();
    const stack = new Set();

    for (const event of this.dependencies.keys()) {
      if (this._dfsCycleCheck(event, visited, stack)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Recursive helper for cycle detection.
   * @param {Event} current 
   * @param {Set} visited 
   * @param {Set} stack 
   * @returns {boolean}
   */
  _dfsCycleCheck(current, visited, stack) {
    if (stack.has(current)) return true;
    if (visited.has(current)) return false;

    visited.add(current);
    stack.add(current);

    const deps = this.dependencies.get(current) || [];
    for (const dep of deps) {
      if (this._dfsCycleCheck(dep, visited, stack)) {
        return true;
      }
    }

    stack.delete(current);
    return false;
  }
}

export default EventDependencies;
