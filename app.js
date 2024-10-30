//Carregando modulos
const express = require('express');
const handlebars = require('express-handlebars');
//const bodyParser = require('body-parser');
const admin = require('./routes/admin');
const path = require("path")
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const app = express();
const postagens = require('./models/Postagem')
require ('./models/Categoria')
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')

//require('./models/Categoria');

//const admin = ('./routes/admin')
// Configurações
app.use(session({
  secret: 'cursonode',
  resave: true,
  saveUninitialized: true
}))
app.use(flash())
//Midleware
app.use((req, res, next)=>{
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})
// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(bodyParser.urlencoded({extended: true}))
//app.use(bodyParser.json()) Metodo antigo
// Handlebars
app.engine('handlebars', handlebars.engine({
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
// Mongoose
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log("MongoDB conectado")
  })
  .catch((err) => {
    console.log("Erro ao se conectar" + err);
  })

//Public
app.use(express.static(path.join(__dirname, "public")))
app.use((req, res, next)=>{
  console.log('Ola eu sou um midleware');
  next();
})
//app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.get('/', (req, res)=>{
  Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
    res.render('index', {postagens: postagens})
  }).catch((err)=>{
    req.flash('error_msg', 'Houve um erro interno!')
    res.redirect('/404')
  })
})
app.get('/postagem/:slug',(req, res)=>{
  Postagem.findOne({slug: req.params.slug}).then((postagem)=>{
    if(postagem){
      res.render('postagem/index', {postagem: postagem})
    }else{
      req.flash('error_msg', 'Essa postagem não existe!')
      res.redirect('/')
    }
  }).catch((err)=>{
    req.flash('error_msg', 'Houve um erro interno')
    res.redirect('/')
  })
})
app.get('/categorias', (req, res) => {
  Categoria.find().sort({nome: 'asc'}).then((categorias) => {
      res.render('categorias/index', { categorias: categorias });
  }).catch((err) => {
      req.flash('error_msg', 'Houve um erro interno ao listar as categorias');
      res.redirect('/');
  })
})
app.get('/categorias/:slug', (req, res) => {
  Categoria.findOne({ slug: req.params.slug }).then(categoria => {
      if (categoria) {
          Postagem.find({ categoria: categoria._id }).then(postagens => {
              res.render('categorias/postagens', { postagens, categoria });
          }).catch(err => {
              req.flash('error_msg', 'Houve um erro ao listar os posts!');
              res.redirect('/');
          });
      } else {
          req.flash('error_msg', 'Esta categoria não existe!');
          res.redirect('/');
      }
  }).catch(err => {
      req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria');
      res.redirect('/');
  })
})
app.get('/404', (req, res)=>{
  res.send('Erro 404')
})
app.get('/posts', (req, res) => {
  res.send("Lista de posts")
})
app.use('/admin', admin);

// Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
