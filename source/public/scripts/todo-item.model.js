import { DateTime } from "../ext-modules/luxon.js";

class TodoItem {
    name = '';

    description = '';

    importance = 3;

    completed = false;

    dueDate;

    createdDate;

    id = null;
    
    constructor(
        name,
        description,
        dueDate,
        importance,
        completed,
        id
    ) {
        const now = DateTime.now().toISODate();
        const due = DateTime.fromISO(dueDate);
        this.name = name || '';
        this.description = description || '';
        this.dueDate = due.isValid ? due.toISODate() : now;
        this.importance = +importance || 3;
        this.completed = completed || false;
        this.createdDate = now;
        if (id) {
            this.id = id
        } else {
            delete this.id
        }
    }
}

export default TodoItem