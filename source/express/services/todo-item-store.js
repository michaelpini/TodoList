import Datastore from "nedb-promises";
import { getRandomId } from "../../public/scripts/services/util.js";

/**
 * Data store using NeDB as database <br>
 * Singleton class, will only instantiate once <br>
 * Using custom ```id``` in addition to the db's ```_id```
 * @example
 * const db = new TodoItemStore();
 */
class TodoItemStore {
    static #instance = null;
    #db = null;

    constructor () {
        if (TodoItemStore.#instance) return TodoItemStore.#instance;
        TodoItemStore.#instance = this;
        this.#db = Datastore.create('./data/todoItemStore.db');
    }

    async getAll() {
        return this.#db.find({}) || [];
    }

    async getOne(id) {
        return this.#db.findOne({id});
    }

    async addOne(todoItem) {
        const data = {...todoItem, id: getRandomId(), lastEditDate: new Date().toISOString()};
        return this.#db.insert(data);
   }

    async updateOne(todoItem) {
       const data = {...todoItem, lastEditDate: new Date().toISOString()};
        return this.#db.updateOne(
           { id: data.id },
           data,
           { returnUpdatedDocs: true }
       );
   }

    async deleteOne(id) {
        const { numRemoved } = await this.#db.deleteOne({id});
        return numRemoved ? id : null;
   }
}

export { TodoItemStore }
