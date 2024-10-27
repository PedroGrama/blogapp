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
//app.use(bodyParser.json())
// Handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

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
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.get('/posts', (req, res) => {
  res.send("Pagina de posts")
})
app.use('/admin', admin);

// Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
