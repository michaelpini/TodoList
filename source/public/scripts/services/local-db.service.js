import { openDB } from "../../libraries/idb.js";

/**
 * Local database service, using the browsers ``IndexedDB`` feature to store data locally. ⚠️ Data will be lost after clearing cache! <br>
 * Using idb library (https://www.npmjs.com/package/idb) for easier syntax <br>
 * Singleton class, instantiates only once
 * @example
 * const persistenceService = new LocalDBService(); // Singleton
 */
class LocalDbService {
    static #instance = null;
    #db = null;

    /**
     * Get singleton instance of LocalDbService
     * @returns {LocalDbService}
     */
    static getInstance() {
        if (LocalDbService.#instance) return LocalDbService.#instance;
        return new LocalDbService();
    }

    constructor() {
        LocalDbService.#instance = this;
        this.#init();
    }

    /**
     * Opens the db ``todo-db`` and assigns it to ``#db``
     *
     * If not initialized yet, creates ``todo-db`` and adds objectStore ``items``
     * @returns {Promise<boolean>}
     */
    async #init(){
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
    async getAll() {
        return this.#db.getAll('items');
    }

    /**
     * Returns the item for a given id
     * @param {string} id the item's id
     * @returns {Promise<item|boolean>} the item or false
     */
    async getById(id) {
        if (!id) return false;
        return this.#db.get('items', id);
    }

    /**
     * Adds or updates an item:
     * - adds as new item if data.id is missing
     * - updates the item with the corresponding id
     * @param {item} data the item to be saved
     * @returns {Promise<item|boolean>} the saved item (including server assigned id)
     */
    async save(data) {
        const saveData = {...data, lastEditDate: new Date().toISOString()};
        const tx = this.#db.transaction('items', 'readwrite');
        const [id] = await Promise.all([
            saveData.id ? tx.store.put(saveData) : tx.store.add(saveData),
            tx.done
        ]);
        return this.getById(id);
    }

    /**
     * Adds an item
     * @param {item} data the item to be added
     * @returns {Promise<item|boolean>} Promise -> the added item (including server assigned id)
     */
    async add(data) {
        return this.save(data);
    }

    /**
     * Updates an item (match by id)
     * @param {item} data the item to be updated
     * @returns {Promise<item|boolean>} Promise -> the updated item
     */
    async update(data) {
        return this.save(data);
    }

    /**
     * Add multiple items at once
     * @param {items[]} data array of items to add
     * @returns {Promise<items[]|boolean>} array of all items
     */
    async addMultiple(data) {
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
    async delete(id) {
        if (!id) throw new Error('no id')
        const tx = this.#db.transaction('items', 'readwrite');
        await Promise.all([
            tx.store.delete(id),
            tx.done
        ]);
    }

}

export { LocalDbService }
