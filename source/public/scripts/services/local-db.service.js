import { openDB } from "../../libraries/idb.js";

/**
 * Local database service, using the browsers ``IndexedDB`` feature to store data locally
 *
 * Using idb library (https://www.npmjs.com/package/idb) for easier syntax
 */
class LocalDbService {
    static #db = null;

    /**
     * Opens the db ``todo-db`` and assigns it to ``#db``
     *
     * If not initialized yet, creates ``todo-db`` and adds objectStore ``items``
     * @returns {Promise<boolean>}
     */
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

    /**
     * Returns an array of all list items
     * @returns {Promise<items[]>}
     */
    static async getAll() {
        if (!this.#db) await this.init();
        return this.#db.getAll('items');
    }

    /**
     * Returns the item for a given id
     * @param {string} id the item's id
     * @returns {Promise<item|boolean>} the item or false
     */
    static async getById(id) {
        if (!id) return false;
        if (!this.#db) await this.init();
        return this.#db.get('items', id);
    }

    /**
     * Saves an item:
     * - adds as new item if data.id is missing
     * - updates the item with the corresponding id
     * @param {item} data the item to be saved
     * @returns {Promise<item|boolean>} the saved item (including server assigned id)
     */
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

    /**
     * Add multiple items at once
     * @param {items[]} data array of items to add
     * @returns {Promise<items[]|boolean>} array of all items
     */
    static async addMultiple(data) {
        if (!data) return false;
        if (!this.#db) await this.init();
        const tx = this.#db.transaction('items', 'readwrite');
        const txArray = data.map(item => tx.store.add(item))
        await Promise.all([...txArray, tx.done]);
        return this.getAll();
    }

    /**
     * Delete the item for a given id
     * @param {string} id the id of the item to delete
     * @returns {Promise<void>} void
     */
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