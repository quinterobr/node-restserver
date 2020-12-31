const express = require('express');
let { verificaToken, verificaRole } = require('../middlewares/autenticacion');
let Categoria = require('../models/categoria');
const bodyParser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//Todas las categorias
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                categorias
            });
        })
});


//Categoria by ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no encontrado en la base de datos'
                }
            })
        }
        res.json({
            ok: true,
            message: 'Categoria encontrada',
            categoria: categoriaDB
        });
    })
});


//Crear nueva categoria
app.post('/categoria', verificaToken, (req, res) => {
    //Regresa la nueva categoria
    // req.usuario._id para mostrar el ID del usuario que creo la categoria
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB) => {
        if (err) { // error interno
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) { // error creando la categoria
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});


//Actualizar categoria
app.put('/categoria/:id', (req, res) => {
    //descripcion de la categoria
    let id = req.params.id;
    let desCategoria = {
        descripcion: req.body.descripcion
    };

    Categoria.findByIdAndUpdate(id, desCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ //internal error
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({ //no se pudo 
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});


//Todas las categorias
app.delete('/categoria/:id', [verificaToken, verificaRole], (req, res) => {
    //Eliminarla completamente de la base de datos
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ //internal error
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({ //no se pudo 
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            message: 'Categoria eliminada de la base de datos',
            categoria: categoriaDB
        });
    })
});


module.exports = app;