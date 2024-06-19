import { sortObjectArray } from "../services/util.js";

class DataService {
    static #instance = null;
    #data = [];

    constructor() {
        if (DataService.#instance) return DataService.#instance;
        DataService.#instance = this;
    }

    /**
     * Get all items
     * @returns {TodoItem[]} Array of TodoItems
     */
    getAll() {
        return [...this.#data];
    }

    /**
     * Set all items (overwrites existing list)
     * @param {TodoItem[]} data Array of TodoItems
     */
    setAll(data) {
        this.#data = data || [];
    }

    /**
     * Get one item by id
     * @param {string | number} id item id
     * @returns {TodoItem | undefined} found item or undefined
     */
    getById(id) {
        return this.#data.find(x => String(x.id) === String(id));
    }

    /**
     * Add a new item
     * @param {TodoItem} todoItem new item
     */
    add(todoItem) {
        this.#data.push(todoItem);
    }

    /**
     * Updates an existing item (matches item by id)
     * @param {TodoItem} todoItem item to be updated
     * @returns {boolean} true if item was found and updated, otherwise false
     */
    update(todoItem) {
        const index = this.#data.findIndex(x => String(x.id) === String(todoItem.id));
        if (index > -1) {
            this.#data[index] = todoItem;
        }
        return index > -1
    }

    /**
     * Delete item with given id
     * @param {string | number} id item's id
     * @returns {boolean} true if item was found and deleted, otherwise false
     */
    delete(id) {
        const index = this.#data.findIndex(x => String(x.id) === String(id));
        if (index > -1) {
            this.#data.splice(index, 1);
        }
        return index > -1;
    }

    /**
     * Get a sorted and filtered list as per parameters.
     * @param {string} sortBy field name to be used for sorting
     * @param {'asc' | 'desc'} sortMode asc | desc (ascending/descending)
     * @param {'open' | undefined} filter optional: 'open' to filter for open items
     * @returns {TodoItem[]}
     */
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

    /**
     * Get total number of items (no filter)
     * @returns {number} number of items
     */
    getCount() {
        return this.#data.length;
    }
}



export { DataService }
