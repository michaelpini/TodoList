import {sortObjectArray} from "./util.js";

class DataService {
    static #todoList = [];

    static getList(options) {
        const arr = [...this.#todoList];
        if (!options) {
            return arr;
        }
        if ('name|description|dueDate|createdDate|importance|completed'.includes(options.sortBy)) {
            sortObjectArray(arr, options.sortBy, options.sortDescending);
        }
        return options.filterOpen ? arr.filter(x => !x.completed) : arr;
    }

    static setList(data) {
        this.#todoList = data || [];
    }

    static getItem(id) {
        return this.#todoList.find(x => x.id === id);
    }
    
    static addItem(todoItem) {
        this.#todoList.push(todoItem);
    }

    static updateItem(todoItem) {
        const index = this.#todoList.findIndex(x => x.id === todoItem.id);
        if (index > -1) {
            this.#todoList[index] = todoItem;
        }
        return index > -1
    }

}

export default DataService
