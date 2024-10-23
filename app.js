//Carregando modulos
const express = require('express');
const handlebars = require('express-handlebars');
//const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require("path")
//const admin = ('./routes/admin')
// Configurações
// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(bodyParser.urlencoded({extended: true}))
//app.use(bodyParser.json())
// Handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Mongoose
// ...

//Public
app.use(express.static(path.join(__dirname, "public")))

// Rotas
app.get('/posts',(req, res)=>{
    res.send("Pagina de posts")
})
app.use('/admin', admin);

// Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta "+ PORT);
});
