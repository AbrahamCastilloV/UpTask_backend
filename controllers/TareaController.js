import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyecto.js";

export const agregarTarea = async (req, res) => {
    const proyecto = await Proyecto.findById(req.body.proyecto);
    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg:error.message})
    };
    if(req.usuario._id.toString() !== proyecto.creador.toString()){
        const error = new Error("No está afiliado a ese proyecto")
        return res.status(401).json({msg:error.message})
    }

    try {
        const almacenarTarea = await Tarea.create(req.body);
        //Almacenar ID en el proyecto
        proyecto.tareas.push(almacenarTarea._id);
        await proyecto.save();
        res.json(almacenarTarea)
    } catch (error) {
        console.log(error);
    }
};

export const obtenerTarea = async (req, res) => {
    const id = req.params.id;
    const tarea = await Tarea.findById(id).populate("proyecto");
    if(!tarea){
        const error = new Error("Tarea no encontrado")
        return res.status(404).json({msg:error.message})
    };
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("La tarea no te pertenece a éste proyecto")
        return res.status(403).json({msg:error.message})
    }
    res.json(tarea);
};

export const actualizarTarea = async (req, res) => {
    const id = req.params.id;
    const tarea = await Tarea.findById(id).populate("proyecto");
    if(!tarea){
        const error = new Error("Tarea no encontrado")
        return res.status(404).json({msg:error.message})
    };
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("La tarea no te pertenece a éste proyecto")
        return res.status(403).json({msg:error.message})
    }
    /* Editando Variables */
    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
    try {
        const tareaAlmacenada = await tarea.save();
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error);
    }
};

export const eliminarTarea = async (req, res) => {
    const {id} = req.params
    const tarea = await Tarea.findById(id).populate("proyecto");
    //Hay proyectos con ese ID?
    if(!tarea){
        const error = new Error("Tarea no encontrado")
        return res.status(404).json({msg:error.message})
    };
    //Coincide proyecto con el creador
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("La tarea no te pertenece a éste proyecto")
        return res.status(403).json({msg:error.message})
    }
    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        // ? Función para no bloquear eliminar la tarea y eliminar el registro de la tarea en el Proyecto
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne() ])
        res.json({msg:"Tarea eliminada correctamente"})
    } catch (error) {
        console.log(error);
    }
};

export const cambiarEstadoTarea = async (req, res) => {
    const {id} = req.params
    const tarea = await Tarea.findById(id).populate("proyecto")
    console.log(tarea);
    //Hay proyectos con ese ID?
    if(!tarea){
        const error = new Error("Tarea no encontrado")
        return res.status(404).json({msg:error.message})
    };
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error("La tarea no te pertenece a éste proyecto")
        return res.status(403).json({msg:error.message})
    }
    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;


    await tarea.save();
    const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate("completado"); 

    res.json(tareaAlmacenada);
};
