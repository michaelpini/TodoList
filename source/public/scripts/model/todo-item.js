import { DateTime } from "../../libraries/luxon.js";

class TodoItem {
    name = '';
    description = '';
    importance = 3;
    completed = false;
    dueDate;
    createdDate;

    /**
     * TodoItem: all parameters optional, when omitted a blank open item will be created with importance 3 and current date as due date
     * @param {string?} name task name / title
     * @param {string?} description task details
     * @param {string?} dueDate as ISO string, default now
     * @param {1,2,3,4,5?} importance default 3
     * @param {boolean?} completed default false
     */
    constructor( name, description, dueDate, importance, completed ) {
        const now = DateTime.now().toISODate();
        const due = DateTime.fromISO(dueDate);
        this.name = name || '';
        this.description = description || '';
        this.dueDate = due.isValid ? due.toISODate() : now;
        this.importance = +importance || 3;
        this.completed = completed || false;
        this.createdDate = now;
    }
}

export { TodoItem }
