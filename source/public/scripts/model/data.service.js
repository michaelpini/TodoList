import { sortObjectArray } from "../services/util.js";

class DataService {
    static #instance = null;
    #data = [];

    constructor() {
        if (DataService.#instance) return DataService.#instance;
        DataService.#instance = this;
    }


    getAll() {
        return [...this.#data];
    }

    setAll(data) {
        this.#data = data || [];
    }

    getById(id) {
        return this.#data.find(x => String(x.id) === String(id));
    }

    add(todoItem) {
        this.#data.push(todoItem);
    }

    update(todoItem) {
        const index = this.#data.findIndex(x => String(x.id) === String(todoItem.id));
        if (index > -1) {
            this.#data[index] = todoItem;
        }
        return index > -1
    }

    delete(id) {
        const index = this.#data.findIndex(x => String(x.id) === String(id));
        if (index > -1) {
            this.#data.splice(index, 1);
        }
        return index > -1;
    }

    getSortedFiltered(sortBy, sortMode, filter) {
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

export { DataService }
