const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

// Definindo o esquema da Categoria
const CategoriaSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now // Não é necessário invocar Date.now(), apenas referenciar
    }
});

// Registrando o modelo 'categorias' com o Mongoose
mongoose.model('categorias', CategoriaSchema);
