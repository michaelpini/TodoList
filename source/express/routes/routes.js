import { Router } from 'express';
import { getAll, getById, addItem, updateItem, deleteItem } from "../controller/api-controller.js";

const router = Router();
const apiUrl = '/api';

router.get(`${apiUrl}/`, getAll);
router.get(`${apiUrl}/:id`, getById);
router.post(`${apiUrl}/`, addItem);
router.patch(`${apiUrl}/:id`, updateItem);
router.delete(`${apiUrl}/:id`, deleteItem);

export { router as apiRoutes };
