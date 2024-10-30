const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')

router.get('/', (req, res) => {
    res.render('admin/index')
})
router.get('/posts', (req, res) => {
    res.send('Pagina dos Posts')
})
router.get('/categorias', (req, res) => {
    Categoria.find().sort({ nome:'asc', date: 'desc' }).lean().then((categorias) => {
        res.render('admin/categorias', { categorias, categorias })
    }).catch((err) => {
        req.flash('erro_msg', 'Houve um erro ao listar as categorias')
        res.redirect('/admin')
    })

})
router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias', { erros: [] });
})
router.post('/categorias/nova', (req, res) => {
    var erros = []
    if (!req.body.nome && typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome Invalido' })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug Invalido' })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: 'Nome da Categoria muito pequeno' })
    }
    if (erros.length > 0) {
        return res.render('admin/addcategorias', { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criado com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente!')
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editCategorias', { categoria })
    }).catch((err) => {
        req.flash('error_msg', 'Essa categoria não existe.')
        res.redirect('/admin/categorias');
    })
})

router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a edição da categoria!');
            res.redirect('/admin/categorias');
        });
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria!')
        res.redirect('/admin/categorias')
    })
})
router.post('/categorias/deletar', (req, res) => {
    Categoria.findByIdAndDelete(req.body.id)
        .then(() => {
            req.flash('success_msg', 'Categoria deletada com sucesso!');
            res.redirect('/admin/categorias');
        })
        .catch(err => {
            req.flash('error_msg', 'Houve um erro ao deletar a categoria: ' + err.message);
            res.redirect('/admin/categorias');
        });
});
router.get('/postagens', (req, res) => {
    Postagem.find().populate('categoria').sort({ data: 'desc' }).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('admin ')
    })

})
router.get('/postagens/add', (req, res) => {
    Categoria.find().sort({ nome: 'asc'}).lean().then((categorias) => {
        res.render('admin/addpostagens', { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario!')
        req.redirect('/admin')
    })
})
router.post('/postagens/nova', (req, res) => {
    var erros = []
    if (req.body.categoria == '0') {
        erros.push({ texto: 'Categoria invalida, registre uma categoria!' })
    }
    if (erros.length > 0) {
        return res.render('admin/addpostagens', { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao criar a postagem!')
            res.redirect('/admin/postagens')
        })
    }
})
router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        if (postagem) {
            Categoria.find().sort({ nome: 'asc' }).lean().then((categorias) => {
                res.render('admin/editpostagens', { postagem, categorias });
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao carregar categorias.');
                res.redirect('/admin/postagens');
            });
        } else {
            req.flash('error_msg', 'Essa postagem não existe.');
            res.redirect('/admin/postagens');
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição.');
        res.redirect('/admin/postagens');
    });
});
router.post('/postagem/edit', (req, res) => {
    let erros = [];

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: 'Título inválido' });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug inválido' });
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({ texto: 'Descrição inválida' });
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: 'Conteúdo inválido' });
    }

    if (req.body.titulo.length < 3) {
        erros.push({ texto: 'Título muito pequeno' })
    }

    if (req.body.slug.length < 3) {
        erros.push({ texto: 'Slug muito pequeno' })
    }

    if (erros.length > 0) {
        return res.render('admin/editpostagem', { erros: erros });
    } else {
        Postagem.findOne({ _id: req.body.id })
        .then((postagem) => {
          postagem.titulo = req.body.titulo
          postagem.slug = req.body.slug
          postagem.descricao = req.body.descricao
          postagem.conteudo = req.body.conteudo
          postagem.categoria = req.body.categoria
      
          return postagem.save();
        })
        .then(() => {
          req.flash('success_msg', 'Postagem editada com sucesso!')
          res.redirect('/admin/postagens')
        })
        .catch((err) => {
          console.error(err);
          req.flash('error_msg', 'Erro ao editar postagem!')
          res.redirect('/admin/postagens')
        })
    }
})
router.post('/postagens/deletar/:id', (req, res)=>{
    Postagem.findByIdAndDelete(req.params.id).then(()=>{
        req.flash('success_msg', 'Postagem deletada com sucesso!');
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar postagem: ' + err.message)
        res.redirect('/admin/postagens')
      })
})
module.exports = router;