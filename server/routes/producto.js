const express = require('express');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');

const app = express();
let Producto = require('../models/producto');

//optener todos los productos

app.get('/producto', verificaToken, (req, res) => {
    //trae todos los productos
    //populate: usuario, categoria
    //paginado

    let desde = Number(req.query.desde) || 0;


    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                productos
            });
        })
});


//optener producto por ID

app.get('/producto/:id', (req, res) => {
    //populate: usuario, categoria
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!productoBD) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no encontrado en la base de datos'
                    }
                })
            }
            res.json({
                ok: true,
                producto: productoBD
            });
        })
});

//Buscar un producto

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regEx = new RegExp(termino, 'i')

    Producto.find({ nombre: regEx })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                producto: productos
            });
        })
})



//Crear un producto 

app.post('/producto', verificaToken, (req, res) => {
    //Grabar el usuario
    //req.usuario._id para mostrar el ID del usuario que creo la categoria
    //Grabar una categoria del listado

    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoBD) => {
        if (err) { // error interno
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoBD) { // error creando el producto
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            producto: productoBD
        });
    })

});

//Actualizar producto
app.put('/producto/:id', (req, res) => {
    //Grabar el usuario
    //Grabar una categoria del listado

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoBD) => {
        if (err) {
            return res.status(500).json({ //internal error
                ok: false,
                err
            });
        }
        if (!productoBD) {
            return res.status(400).json({ //no se pudo actualizar el producto
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoBD
        });
    })
});

//Borrar producto
app.delete('/producto/:id', (req, res) => {
    //Poner disponibilidad en falso

    let id = req.params.id;
    let cambioDisp = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambioDisp, { new: true }, (err, productoBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (productoBD) {
            res.json({
                ok: true,
                producto: productoBD
            });
        } else {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'producto no encontrado'
                }
            });
        }
    })

});

module.exports = app;