import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

export const obtenerProyectos = async (req, res) => {
    const proyecto = await Proyecto.find({'$or':[
        {'colaboradores':{$in:req.usuario}},
        {'creador':{$in:req.usuario}},
    ]}).select('-tareas')
    res.json(proyecto)
};

export const nuevoProyectos = async (req, res) => {
    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error);
    }
};

export const obtenerProyecto = async (req, res) => {
    const {id} = req.params
    const proyecto = await Proyecto.findById(id)
        .populate({path:"tareas", populate:{path:"completado", select:"nombre"}})
        .populate('colaboradores', "nombre email");
    //Hay proyectos con ese ID?
    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg:error.message})
    };
    //Coincide proyecto con el creador
    if(req.usuario._id.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error("No está afiliado a ese proyecto")
        return res.status(401).json({msg:error.message})
    }

    res.json(proyecto)
};

export const editarProyecto = async (req, res) => {
    const {id} = req.params
    const proyecto = await Proyecto.findById(id);
    //Hay proyectos con ese ID?
    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg:error.message})
    };
    //Coincide proyecto con el creador
    if(req.usuario._id.toString() !== proyecto.creador.toString()){
        const error = new Error("No está afiliado a ese proyecto")
        return res.status(401).json({msg:error.message})
    }
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error);
    }
};

export const eliminarProyecto = async (req, res) => {
    const {id} = req.params
    const proyecto = await Proyecto.findById(id);
    //Hay proyectos con ese ID?
    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg:error.message})
    };
    //Coincide proyecto con el creador
    if(req.usuario._id.toString() !== proyecto.creador.toString()){
        const error = new Error("No está afiliado a ese proyecto")
        return res.status(401).json({msg:error.message})
    }
    try {
        await proyecto.deleteOne();
        res.json({msg:"Proyecto eliminado correctamente"})
    } catch (error) {
        console.log(error);
    }

};

export const buscarColaborador = async (req, res) => {
    const {email} = req.body;
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');
    if(!usuario){
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg:error.message})
    }

    res.json(usuario);
};

export const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    if(!proyecto){
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({msg:error.message})    
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Únicamente el creador del proyecto puede agregar colaboradores');
        return res.status(404).json({msg:error.message})    
    }
    const {email} = req.body;
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');
    if(!usuario){
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg:error.message})
    }
    //El colaborador no es el ADMIN del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error('El creador del proyecto no puede ser colaborador');
        return res.status(404).json({msg:error.message})
    }
    //Que no esté agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error('El Usuario ya pertenece al proyecto');
        return res.status(404).json({msg:error.message})
    }

    //Está bien, se puede agregar
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json({msg:'Colaborador Agregado Correctamente'});
};

export const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    if(!proyecto){
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({msg:error.message})    
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Únicamente el creador del proyecto puede eliminar colaboradores');
        return res.status(404).json({msg:error.message})    
    }
    proyecto.colaboradores.pull(req.body.id);

    await proyecto.save();
    res.json({msg:'Colaborador Eliminado Correctamente'});
};


