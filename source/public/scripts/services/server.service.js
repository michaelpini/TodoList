const urlBase = (new URL(window.location.href)).origin;
const urlApi = `${urlBase}/api`;

const urlGetAll = `${urlApi}/`;
const urlGetById = `${urlApi}/:id`;
const urlAddItem = `${urlApi}/`;
const urlUpdateItem = `${urlApi}/:id`;
const urlDeleteItem = `${urlApi}/:id`;

/**
 * Server service using AJAX requests connecting to express.js server <br>
 * Use ``getInstance()`` to instantiate
 * | --- API  URL --- | Method | Description            |
 * |------------------|--------|------------------------|
 * | ``/api/``        | GET    | Get all items          |
 * | ``/api/:id``     | GET    | Get one item by id     |
 * | ``/api/``        | POST   | Add one item           |
 * | ``/api/:id``     | PATCH  | Update one item  by id |
 * | ``/api/:id``     | DELETE | Delete one item by id  |
 * @example
 * const persistenceService = ServerService.getInstance();
 */
class ServerService {
    static #instance = null;

    /**
     * Get singleton instance of ServerService
     * @returns {ServerService}
     */
    static getInstance() {
        if (ServerService.#instance) return ServerService.#instance;
        return new ServerService();
    }

    constructor() {
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
        const method = id ? 'PATCH' : 'POST';
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
     * @param method {'GET'|'PATCH'|'POST'|'DELETE'} HTTP method (e.g. 'GET')
     * @param url {string} api URL (e.g. '/api/:id
     * @param data {json} payload object (e.g. TodoItem)
     * @returns {Promise<json>} Promise -> response object (e.g. TodoItem)
     */
    // pure sub function only used in this class -> not using this:
    // eslint-disable-next-line class-methods-use-this
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
