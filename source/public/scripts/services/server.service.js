const urlBase = (new URL(window.location.href)).origin;
const urlApi = `${urlBase}/api`;

const urlGetAll = `${urlApi}/`;
const urlGetById = `${urlApi}/:id`;
const urlAddItem = `${urlApi}/`;
const urlUpdateItem = `${urlApi}/:id`;
const urlDeleteItem = `${urlApi}/:id`;

/**
 * Server service using AJAX requests connecting to express server <br>
 * Singleton class, instantiating only once
 * @example
 * const persistenceService = new ServerService();
 */
class ServerService {
    static #instance = null;

    constructor() {
        if (ServerService.#instance) return ServerService.#instance;
        ServerService.#instance = this;
    }

    /**
     * Get all items
     * @returns {Promise<TodoItem[]|undefined>} Promise -> array of TodoItems
     */
    async getAll() {
        return this.#ajax('GET', urlGetAll);
    }

    /**
     * Get a single TodoItem by id
     * @param id
     * @returns {Promise<TodoItem|undefined>} Promise -> TodoItem
     */
    async getById(id) {
        const url = urlGetById.replace(':id', id);
        return this.#ajax('GET', url);
    }

    /**
     * Adds or updates a TodoItem <br>
     * - valid item.id -> Updates the corresponding item
     * - invalid item.id -> Adds item as new TodoItem
     * @param item
     * @returns {Promise<TodoItem|undefined>} Promise -> TodoItem (with added id in case of new item)
     */
    async save(item) {
        const {id} = item;
        const url = id ? urlUpdateItem.replace(':id', id) : urlAddItem;
        const method = id ? 'PUT' : 'POST';
        return this.#ajax(method, url, item);
    }

    /**
     * Add a TodoItem <br>
     * @param item
     * @returns {Promise<TodoItem|undefined>} Promise -> TodoItem (with added id)
     */
    async add(item) {
        return this.save(item);
    }

    /**
     * Update a TodoItem (match by id) <br>
     * @param item
     * @returns {Promise<TodoItem|undefined>} Promise -> TodoItem
     */
    async update(item) {
        return this.save(item);
    }

    /**
     * Delete a TodoItem by id
     * @param id
     * @returns {Promise<TodoItem|undefined>} Promise -> deleted id
     */
    async delete(id) {
        const url = urlDeleteItem.replace(':id', id);
        return this.#ajax('DELETE', url);
    }

    /**
     * AJAX request using fetch <br>
     * Returns Promise:
     * ```
     * - resolves with json object, if ok (status 200...399)
     * - rejects with Error otherwise
     * ```
     * @param method {'GET'|'PUT'|'POST'|'DELETE'} HTTP method (e.g. 'GET')
     * @param url {string} api URL (e.g. '/api/:id
     * @param data {json} payload object (e.g. TodoItem)
     * @returns {Promise<json>} Promise -> response object (e.g. TodoItem)
     */
    async #ajax(method, url, data = undefined) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        }
        const response = await fetch(url, options);
        if (response.status >= 200 && response.status < 400) {
            return response.json();
        }
        throw new Error(response.statusText);
    }
}

export { ServerService }


