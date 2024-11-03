const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../models/Usuarios');
const Usuario = mongoose.model('usuarios');

module.exports = function(passport) {
    const LocalStrategy = require('passport-local').Strategy;

    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'senha' }, async (email, senha, done) => {
        try {
            const usuario = await Usuario.findOne({ email: email });
            if (!usuario) {
                return done(null, false, { message: 'Usuário não encontrado' });
            }

            const isMatch = await bcrypt.compare(senha, usuario.senha);
            if (isMatch) {
                return done(null, usuario);
            } else {
                return done(null, false, { message: 'Senha incorreta' });
            }
        } catch (err) {
            return done(err);
        }
    }));

    // Serialização do usuário
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    });

    // Desserialização do usuário
    passport.deserializeUser(async (id, done) => {
        try {
            const usuario = await Usuario.findById(id).lean();
            done(null, usuario);
        } catch (err) {
            done(err, null);
        }
    });
};
