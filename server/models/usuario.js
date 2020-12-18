const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
// let rolesValidos = {
//     values: ['ADMIN_ROLE,USER_ROLE'],
//     message: '{VALUE} no es un rol válido'
// }

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        require: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        require: [true, 'El email es necesario']
    },
    password: {
        type: String,
        require: [true, 'El password es necesario']
    },
    img: {
        type: String,
        require: false
    },
    role: {
        type: String,
        default: 'USER_ROLE'
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObjetc = user.toObject();
    delete userObjetc.password;

    return userObjetc;
}

usuarioSchema.plugin(uniqueValidator, { messages: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Usuario', usuarioSchema);