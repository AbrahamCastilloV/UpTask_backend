import express from "express";
import { agregarTarea, obtenerTarea, actualizarTarea, eliminarTarea, cambiarEstadoTarea } from "../controllers/TareaController.js";
import { checkAuth } from "../helpers/index.js";

const router = express.Router();

//CRUD para Tareas 
router.post('/', checkAuth, agregarTarea)
router.route('/:id').get(checkAuth, obtenerTarea).put(checkAuth, actualizarTarea).delete(checkAuth, eliminarTarea);
router.post('/estado/:id', checkAuth, cambiarEstadoTarea)

export default router;