import { TodoItemStore } from "../services/todo-item-store.js";

const db = new TodoItemStore();

/**
 * Get all items in database <br>
 * ```response: item[] | []```
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getAll = async (req, res) => {
    const data = await db.getAll();
    res.json(data).statusCode = data ? 200 : 204;
}

/**
 * Get item by id <br>
 * ```response: item | null```
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getById = async (req, res) => {
    const data = await db.getOne(req.params.id);
    res.json(data).statusCode = data ? 200 : 404;
}

/**
 * Add new item <br>
 * ```response: item```  _(containing assigned id)_
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const addItem = async (req, res) => {
    const item = req.body;
    const data = await db.addOne(item);
    res.json(data).statusCode = 201;
}

/**
 * Update / replace item (match by id) <br>
 * ```response: item | null```
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const updateItem = async (req, res) => {
    const item = req.body;
    const data = await db.updateOne(item);
    res.json(data || null).statusCode = data ? 200 : 404;
}

/**
 * Delete item (match by id) <br>
 * ```response: id | null```  _(success: deleted id)_
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const deleteItem = async (req, res) => {
    const id = await db.deleteOne(req.params.id);
    res.json(id).statusCode = id ? 200 : 404;
}

export { getAll, getById, addItem, updateItem, deleteItem }
