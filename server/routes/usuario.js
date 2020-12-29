const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const bodyParser = require('body-parser');
const app = express();
const Usuario = require('../models/usuario');
const { verificaToken, verificaRole } = require('../middlewares/autenticacion');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.get('/usuario', verificaToken, (req, res) => {

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;

    Usuario.find({ estado: true })
        .skip(desde)
        .limit(limite)
        .exec((err, usuariosDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            Usuario.count({ estado: true }, (err, cont) => {
                res.json({
                    ok: true,
                    Nusuarios: cont,
                    usuariosDB

                });
            })

        })
});

app.post('/usuario', [verificaToken, verificaRole], function(req, res) {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        // usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id', [verificaToken, verificaRole], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuario/:id', [verificaToken, verificaRole], function(req, res) {
    let id = req.params.id;
    let cambioEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambioEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (usuarioBorrado) {
            res.json({
                ok: true,
                usuario: usuarioBorrado
            });
        } else {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
    })
});

module.exports = app;