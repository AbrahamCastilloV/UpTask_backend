import Usuario from "../models/Usuario.js";
import { generarId, generarJWT, emailRegistro } from "../helpers/index.js";

export const registrar = async (req, res) => {
    //Evitar registros duplicados
    const { email} = req.body;
    const existeUsuario = await Usuario.findOne({email});
    if(existeUsuario){
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg:error.message})
    }
    //Hashear passwords
    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        await usuario.save();
        //Enviar email de confirmación
        emailRegistro({email:usuario.email, nombre:usuario.nombre, token:usuario.token}, 'Comprueba tu cuenta','confirmar')
        res.json({msg:'Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta'});
    } catch (error) {
        console.log(error);
    }
};

export const autenticar = async (req, res) => {
    //Comprobar si el usuaría existe
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({email});

    if(!usuario){
        const error = new Error('Usuario no existe');
        return res.status(404).json({msg:error.message})
    }
    //Comprobar si el usuaría está confirmado
    if(!usuario.confirmado){
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(404).json({msg:error.message})
    }
    if(await usuario.comprobarPassword(password)){
        res.json({
            _id:usuario._id,
            nombre:usuario.nombre,
            email:usuario.email,
            token:generarJWT(usuario._id)
        })
    }else{
        const error = new Error('Contraseña Incorrecta');
        return res.status(404).json({msg:error.message})
    }

    //Comprobar password
};

export const confirmar = async (req, res) => {
    const {token} = req.params;
    const usuarioConfirmar = await Usuario.findOne({token});
    if(!usuarioConfirmar){
        const error = new Error("Token no válido")
        return res.status(404).json({msg:error.message});
    };
    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = '';
        await usuarioConfirmar.save();
        res.json({msg:"Usuario confirmado correctamente"})
    } catch (error) {
        console.log(error);
    }
};

export const olvidePassword = async (req, res) => {
    const { email } = req.body
    const usuario = await Usuario.findOne({email});
    if(!usuario){
        const error = new Error('El usuario no existe');
        return res.status(400).json({msg:error.message})
    }
    try {
        usuario.token = generarId();
        await usuario.save();
        //Enviamos correo
        emailRegistro({email:usuario.email, nombre:usuario.nombre, token:usuario.token}, 'Recupera tu contraseña','olvide-password')
        res.json({msg:"Hemos enviado un email con las instrucciones"})
    } catch (error) {
        console.log(error);
    }
};

export const comprobarToken = async (req, res) => {
    const {token} = req.params;
    const tokenValido = await Usuario.findOne({token});
    if(tokenValido){
        res.json({msg:'Token válido, el usuario existe'});
    }else{
        const error = new Error('token no valido');
        return res.status(400).json({msg:error.message})
    };
};

export const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;
    const usuario = await Usuario.findOne({token});
    if(usuario){
        usuario.password = password;
        usuario.token = '';
        try {
            await usuario.save();
            return res.json({msg:"Password Modificado Correctamente"})
        } catch (error) {
            console.log(error);
        }
    }else{
        const error = new Error('token no valido');
        return res.status(400).json({msg:error.message})
    };
};

export const perfil = async (req, res) => {
    const {usuario} = req;
    res.json(usuario)
};





