import { openDB } from '../ext-modules/idb.js';

/**
 * Local database service, using the browsers IndexedDB feature to store data locally
 * Using idb library (https://www.npmjs.com/package/idb) for easier syntax
 */
class LocalDbService {
    static #db = null;

    static async init(){
        this.#db = await openDB('todo-db', 1, {
            upgrade (db) {
                if (!db.objectStoreNames.contains('items')) {
                    db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
                }
            }
        })
        return true;
    }

    static async getAll() {
        if (!this.#db) await this.init();
        const items = await this.#db.getAll('items');
        return items;
    }

    static async getById(id) {
        if (!id) return false;
        if (!this.#db) await this.init();
        const item = await this.#db.get('items', id);
        return item;
    }

    static async save(data) {
        if (!data) return false;
        if (!this.#db) await this.init();
        const tx = this.#db.transaction('items', 'readwrite');
        const [id] = await Promise.all([
            data.id ? tx.store.put(data) : tx.store.add(data),
            tx.done
        ]);
        return this.getById(id);
    }

    static async addMultiple(data) {
        if (!data) return false;
        if (!this.#db) await this.init();
        const tx = this.#db.transaction('items', 'readwrite');
        const txArray = data.map(item => tx.store.add(item))
        await Promise.all([...txArray, tx.done]);
        return this.getAll();
    }

    static async delete(id) {
        if (!id) throw new Error('no id')
        if (!this.#db) await this.init();
        const tx = this.#db.transaction('items', 'readwrite');
        await Promise.all([
            tx.store.delete(id),
            tx.done
        ]);
    }

}

export default LocalDbService;