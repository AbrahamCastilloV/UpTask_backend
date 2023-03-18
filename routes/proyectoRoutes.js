import express from "express";

import { obtenerProyectos, nuevoProyectos, obtenerProyecto, editarProyecto, eliminarProyecto, agregarColaborador, eliminarColaborador, buscarColaborador  } from "../controllers/ProyectoController.js";
import { checkAuth } from "../helpers/index.js";

const router = express.Router();

//CRUD para proyectos 
router.route('/').get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyectos);
router.route('/:id').get(checkAuth, obtenerProyecto).put(checkAuth, editarProyecto).delete(checkAuth, eliminarProyecto);
//CRUD para Tareas y colaboradores
router.post('/colaboradores', checkAuth, buscarColaborador);
router.post('/colaboradores/:id', checkAuth, agregarColaborador);
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador);

export default router;