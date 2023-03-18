import express from "express";
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil } from "../controllers/UsuarioController.js";
import { checkAuth } from "../helpers/index.js";

const router = express.Router();

//Autenticación, Registro y confirmación de usuarios
router.post("/", registrar);
router.post("/login", autenticar);
router.get("/confirmar/:token", confirmar);
router.post("/olvide-password/", olvidePassword);
router.get("/olvide-password/:token", comprobarToken);
router.post("/olvide-password/:token", nuevoPassword);

router.get('/perfil', checkAuth, perfil)

export default router;