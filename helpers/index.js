import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import nodemailer from 'nodemailer'

export const generarId = () => {
    return ( Math.random().toString(32).substring(2) + Date.now().toString(32));
}
export const generarJWT = (id) => {
    //Sign primero toma el objeto que va a pasar por el token, luego la palabra secreta y luego objeto de configuración
    return (jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"30d"}))
}
export const checkAuth = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v");
            return next();
        } catch (error) {
            return res.status(404).json({msg:"Hubo un error"})
        }
    };
    if(!token){
        const error = new Error('Token no válido');
        return res.status(404).json({msg:error.message});
    }
    next();
}
export const emailRegistro = async (datos, mensaje, url) => {
    const {email, nombre, token } = datos;

    // TODO: Mover hacia variables de entorno
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
    });
    //Información del email
    const info = await transport.sendMail({
        from:'"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to:email,
        subject:`UpTask - ${mensaje}`,
        text:`${mensaje} en UpTask`,
        html:`
            <p>Hola: ${nombre} ${mensaje} en UpTask</p>
            <p>Tu cuenta ya casi está lista, sólo necesitas comprobarla dando click en el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/${url}/${token}">${mensaje}</a>
            <p>Si tú no hiciste esta petición, puedes ignorar el mensaje</p>
        `
    })


}
