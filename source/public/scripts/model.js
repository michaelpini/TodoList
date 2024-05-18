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
}

export default Data
