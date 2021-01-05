const express = require('express');
const fileUploads = require('express-fileupload');
const usuario = require('../models/usuario');
const producto = require('../models/producto');
const app = express();

const fs = require('fs');
const path = require('path');

app.use(fileUploads());


app.put('/upload/:tipo/:id', (req, res) => {
    let { tipo, id } = req.params;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    //Validar tipo
    const tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El tipo de no es valido, los tipos validos son: ' + tiposValidos.join(', '),
                tipo
            }
        })
    }

    let archivo = req.files.archivo; //la variable que se envia desde el postman debe de tener el mismo nombre
    //En este caso 'archivo'

    //Extensiones validas 
    const extenciones = ['png', 'jpg', 'gif', 'jpeg'];
    let nombreArchivo = archivo.name.split('.');
    let extensionArchivo = nombreArchivo[nombreArchivo.length - 1];

    if (extenciones.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'La extension del archivo no es valida, las extensiones validas son: ' + extenciones.join(', '),
                extensionArchivo
            }
        })
    }

    //Cambiar el nombre del archivo
    let nuevoNombre = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`

    archivo.mv(`uploads/${tipo}/${nuevoNombre}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //Aqui la imagen ya esta cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nuevoNombre);
        } else {
            imagenProducto(id, res, nuevoNombre);
        }
    })
});


//Funcion para que la imagen no se repita
function imagenUsuario(id, res, nuevoNombre) {
    usuario.findById(id, (err, usuarioBD) => {
        if (err) {
            borrarArchivo(nuevoNombre, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD) {
            borrarArchivo(nuevoNombre, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado en la base de datos'
                }
            });
        }

        borrarArchivo(usuarioBD.img, 'usuarios');

        usuarioBD.img = nuevoNombre; //Se actualiza la imagen del usuario
        usuarioBD.save((err, usuarioGuardado) => { //se guarda en la base de datos
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nuevoNombre
            });
        });
    });
};

function imagenProducto(id, res, nuevoNombre) {
    producto.findById(id, (err, productoBD) => {
        if (err) {
            borrarArchivo(nuevoNombre, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoBD) {
            borrarArchivo(nuevoNombre, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado en la base de datos'
                }
            });
        }

        borrarArchivo(productoBD.img, 'productos');

        productoBD.img = nuevoNombre; //Se actualiza la imagen 
        productoBD.save((err, productoGuardado) => { //se guarda en la base de datos
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nuevoNombre
            });
        });
    })
};

function borrarArchivo(nombreImagen, tipo) {
    //Se guarda el path de la imagen
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    //Si el path existe se borra y se guarla nueva
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
};

module.exports = app;