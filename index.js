import express  from "express";
import conectarDB from "./config/db.js";
import dotenv from 'dotenv';
import cors from 'cors';

import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

const app = express();
//Para que express pueda leer JSON
app.use(express.json())
dotenv.config();
conectarDB();
//Configurar CORS
const whitelist = [process.env.FRONTEND_URL];
const corsOptions = {
    origin:function(origin, callback){
        if(whitelist.includes(origin)){
            //Puede consultar la API
            callback(null, true);
        }else{
            callback(new Error('Error de CORS'))
        }
    }
}
app.use(cors(corsOptions))
//Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;
const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})

/* Socket IO */
import { Server } from "socket.io";

const io = new Server(servidor, {
    pingTimeout:60000,
    cors:{
        origin:process.env.FRONTEND_URL,
    }
});
io.on("connection", (socket) => {

    //Definir event para proyecto y las tareas de ese proyecto
    socket.on('abrir proyecto', (proyecto)=>{
        socket.join(proyecto);
    }),
    socket.on('nueva tarea', tarea => {
        socket.to(tarea.proyecto).emit('tarea agregada', tarea)
    }),
    socket.on('eliminar tarea', tarea => {
        socket.to(tarea.proyecto).emit('tarea eliminada', tarea)
    }),
    socket.on('actualizar tarea', tarea => {
        socket.to(tarea.proyecto._id).emit('tarea actualizada', tarea)
    }),
    socket.on('cambiar tarea', tarea => {
        socket.to(tarea.proyecto._id).emit('nuevo estado', tarea)
    })
    socket.on('nuevo proyecto', proyecto => {
        socket.to(proyecto._id).emit('proyecto agregado', proyecto)
    })
});