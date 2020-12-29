const jwt = require("jsonwebtoken");


//verificar tokendo
let verificaToken = (req, res, next) => {
    let token = req.get('token'); // con el req.get se obtienen los headers

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({ //no autorizado
                ok: false,
                err
            })
        }

        req.usuario = decoded.usuario;
        next();
    });


};

let verificaRole = (req, res, next) => {
    let usuario = req.usuario;
    console.log(usuario.role, usuario.nombre);

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es un administrador'
            }
        })
    }
}

module.exports = { verificaToken, verificaRole }