import { sortObjectArray } from "../services/util.js";

class Data {
    static #data = [];

    static getAll() {
        return [...this.#data];
    }

    static setAll(data) {
        this.#data = data || [];
    }

    static getById(id) {
        return this.#data.find(x => String(x.id) === String(id));
    }

    static add(todoItem) {
        this.#data.push(todoItem);
    }

    static update(todoItem) {
        const index = this.#data.findIndex(x => String(x.id) === String(todoItem.id));
        if (index > -1) {
            this.#data[index] = todoItem;
        }
        return index > -1
    }

    static delete(id) {
        const index = this.#data.findIndex(x => String(x.id) === String(id));
        if (index > -1) {
            this.#data.splice(index, 1);
        }
        return index > -1;
    }

    static getSortedFiltered(sortBy, sortMode, filter) {
        let data = [...this.#data];
        sortObjectArray(data, sortBy, sortMode === 'desc');
        switch (filter) {
            case 'open':
                data = data.filter(x => !x.completed);
                break;
            default:
        }
        return data;
    }
}

export default Data
