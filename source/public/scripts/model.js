import { DateTime } from "../ext-modules/luxon.js";

class TodoItem {
    name = '';
    description = '';
    importance = 1;
    completed = false;
    dueDate;
    createdDate;
    id = '';
    
    constructor(
        name,
        description,
        dueDate,
        importance,
        completed,
        id
    ) {
        const now = DateTime.now().toISO();
        const due = DateTime.fromISO(dueDate);
        this.name = name || '';
        this.description = description || '';
        this.dueDate = due.isValid ? due.toISO() : now;
        this.importance = importance || 3;
        this.completed = completed;
        this.id = id || '';
        this.createdDate = now;
  }
}

export default TodoItem