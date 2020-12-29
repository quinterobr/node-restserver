//puerto
process.env.PORT = process.env.PORT || 3000;
//variable de entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
//vencimineto del token 

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//seed de autenticacion

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//conexion base de datos
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

//MONGO_URI y SEED son varibales declaradas en heroku : 
// heroku config: set SEED="este-es-el-seed-produccion"
//para verlas es con el comando heroku config