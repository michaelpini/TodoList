class DataService {
    static #todoList = [];

    static getList() {
        return [...this.#todoList];
    }

    static setList(data) {
        this.#todoList = data || [];
    }

    static getItem(id) {
        return this.#todoList.find(x => x.id == id);
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

    static deleteItem(id) {
        const index = this.#todoList.findIndex(x => x.id === id);
        if (index > -1) {
            this.#todoList.splice(index, 1);
        }
        return index > -1;
    }
}

export default DataService
