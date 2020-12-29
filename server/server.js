require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

//configuración global de rutas
app.use(require('./routes/index'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//habilitar la carpeta public, el middlerware path lo que hace es corregir la direccion por una aceptada
app.use(express.static(path.resolve(__dirname, '../public')));


mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');

})

app.listen(process.env.PORT, () => {
    console.log("listen on port 3000");
});