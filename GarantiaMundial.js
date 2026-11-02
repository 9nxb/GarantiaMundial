const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Importa o SQLite

const app = express();
app.use(express.json()); // Permite que a API entenda dados enviados em formato JSON

// 1. Conexão com o Banco de Dados
// Isso cria um arquivo chamado 'database.sqlite' na sua pasta
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite com sucesso!');
    }
});

// 2. Criação das Tabelas
// Usamos db.serialize para garantir que os comandos rodem na ordem certa
db.serialize(() => {
    // Cria a tabela de Usuários (se ela já não existir)
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            nivel_acesso TEXT DEFAULT 'padrao'
        )
    `, (err) => {
        if (err) console.error("Erro ao criar tabela de usuários:", err.message);
        else console.log("Tabela 'usuarios' pronta.");
    });
});

// 3. Rota de Teste
app.get('/', (req, res) => {
    res.send('API e Banco de Dados estão funcionando!');
});

// 4. Ligar o servidor
const PORT = 3000; // Ou 8080, se você mudou antes
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`); //rodando teste d//
});