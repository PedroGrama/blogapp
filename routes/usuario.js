const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuarios')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

// Rota de Registro de Usuário
router.post('/registro', (req, res) => {
    const erros = []

    // Validações
    if (!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        erros.push({ texto: 'Nome inválido' })
    }

    if (!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        erros.push({ texto: 'Email inválido' })
    }

    if (!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        erros.push({ texto: 'Senha inválida' })
    }

    if (req.body.senha.length <= 4) {
        erros.push({ texto: 'Senha muito curta!' })
    }

    if (req.body.senha !== req.body.senha2) {
        erros.push({ texto: 'Senhas diferentes, tente novamente!' })
    }

    if (erros.length > 0) {
        return res.render('usuarios/registro', { erros, isAuthenticated: req.isAuthenticated() })
    } else {
        // Verificação de usuário existente
        Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {
            if (usuario) {
                req.flash('error_msg', 'Já existe uma conta com este email em nosso sistema!')
                return res.redirect('/usuarios/registro')
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                // Criptografar a senha e salvar o usuário
                bcrypt.genSalt(10, (erro, salt) => {
                    if (erro) {
                        req.flash('error_msg', 'Houve um erro durante a criptografia da senha')
                        return res.redirect('/usuarios/registro')
                    }

                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário')
                            return res.redirect('/usuarios/registro')
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário criado com sucesso!')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente!')
                            res.redirect('/usuarios/registro')
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    }
})

// Rota para exibir o formulário de registro
router.get('/registro', (req, res) => {
    res.render('usuarios/registro', { isAuthenticated: req.isAuthenticated() })
})

// Rota para exibir o formulário de login
router.get('/login', (req, res) => {
    res.render('usuarios/login', { isAuthenticated: req.isAuthenticated() })
})

// Rota de Login do Usuário
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            req.flash('error_msg', 'Email ou senha inválidos.')
            return res.redirect('/usuarios/login')
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err)
            }
            req.flash('success_msg', `Bem-vindo, ${user.nome}!`)
            return res.redirect('/')
        })
    })(req, res, next)
})

// Rota para logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash('error_msg', 'Houve um erro ao deslogar.')
            return res.redirect('/')
        }
        req.flash('success_msg', 'Deslogado com sucesso!')
        res.redirect('/')
    })
})

module.exports = router


// // Rota de Registro de Usuário e essa refatoracao de usuario foi por IA 
// router.post('/registro', (req, res) => {
//     const erros = []
    
//     // Validações
//     if (!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
//         erros.push({ texto: 'Nome inválido' })
//     }

//     if (!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
//         erros.push({ texto: 'Email inválido' })
//     }

//     if (!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
//         erros.push({ texto: 'Senha inválida' })
//     }

//     if (req.body.senha.length <= 4) {
//         erros.push({ texto: 'Senha muito curta!' })
//     }

//     if (req.body.senha !== req.body.senha2) {
//         erros.push({ texto: 'Senhas diferentes, tente novamente!' })
//     }

//     // Verificar se há erros e renderizar a página de registro novamente
//     if (erros.length > 0) {
//         res.render('usuarios/registro', { erros })
//     } else {
//         // Verificação de usuário existente
//         Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {
//             if (usuario) {
//                 req.flash('error_msg', 'Já existe uma conta com este email em nosso sistema!')
//                 return res.redirect('/usuarios/registro')
//             } else {
//                 const novoUsuario = new Usuario({
//                     nome: req.body.nome,
//                     email: req.body.email,
//                     senha: req.body.senha
//                 })
                
//                 // Criptografar a senha e salvar o usuário
//                 bcrypt.genSalt(10, (erro, salt) => {
//                     if (erro) {
//                         req.flash('error_msg', 'Houve um erro durante a criptografia da senha')
//                         return res.redirect('/usuarios/registro')
//                     }
                    
//                     bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
//                         if (erro) {
//                             req.flash('error_msg', 'Houve um erro durante o salvamento do usuário')
//                             return res.redirect('/usuarios/registro')
//                         }
                        
//                         novoUsuario.senha = hash
                        
//                         novoUsuario.save().then(() => {
//                             req.flash('success_msg', 'Usuário criado com sucesso!')
//                             res.redirect('/')
//                         }).catch((err) => {
//                             req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente!')
//                             res.redirect('/usuarios/registro')
//                         })
//                     })
//                 })
//             }
//         }).catch((err) => {
//             req.flash('error_msg', 'Houve um erro interno')
//             res.redirect('/')
//         })
//     }
// })

// // Rota para exibir o formulário de registro
// router.get('/registro', (req, res) => {
//     res.render('usuarios/registro')
// })

// // Rota para exibir o formulário de login
// router.get('/login', (req, res) => {
//     res.render('usuarios/login')
// })

// // Rota de Login do Usuário
// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//         successRedirect: '/',
//         failureRedirect: '/usuarios/login',
//         failureFlash: true
//     })(req, res, next)
// })

// // Configuração para deserializar o usuário
// passport.deserializeUser(async (id, done) => {
//     try {
//         const usuario = await Usuario.findById(id).lean()
//         done(null, usuario)
//     } catch (err) {
//         done(err, null)
//     }
// })
// router.get('/logout', (req, res) => {
//     req.logout((err) => {
//         if (err) {
//             req.flash('error_msg', 'Houve um erro ao deslogar.')
//             return res.redirect('/');
//         }
//         req.flash('success_msg', 'Deslogado com sucesso!');
//         res.redirect('/');
//     });
// });


// module.exports = router
