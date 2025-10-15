// 1. IMPORTAÇÕES
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Usamos '/promise' para código mais moderno!

// 2. INICIALIZAÇÃO
const app = express();
const port = 3000;

// 3. CONFIGURAÇÃO DO CORS
app.use(cors());

// 4. CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS
// Pense nisso como o "número de telefone" da nossa cozinha.
const dbConfig = {
    host: '108.167.132.54',      // Geralmente 'localhost' se o BD estiver na mesma máquina
    user: 'libe4727_gemini', // <-- SUBSTITUA PELO SEU USUÁRIO
    password: '@XQIB4vng', // <-- SUBSTITUA PELA SUA SENHA
    database: 'libe4727_robo_db'     // O nome do banco de dados que criamos
};
// Criamos um "pool" de conexões. É muito mais eficiente que criar uma nova a cada pedido.
const pool = mysql.createPool(dbConfig);

// AVISO DE SEGURANÇA IMPORTANTE:
// Nunca coloque senhas diretamente no código em um projeto real que irá para o GitHub!
// Mais tarde, aprenderemos a usar "variáveis de ambiente" (.env) para isso.

// 5. DEFINIÇÃO DAS ROTAS
app.get('/api/perguntas', async (req, res) => { // A rota agora é 'async'
    console.log("-> Pedido GET recebido na rota /api/perguntas!");

    try {
        // Pega uma conexão do nosso pool
        const connection = await pool.getConnection();
        console.log("Conexão com o MySQL estabelecida com sucesso!");

        // Executa a consulta SQL para buscar todas as perguntas
        const [rows] = await connection.query('SELECT * FROM perguntas;');

        // Libera a conexão de volta para o pool
        connection.release();

        // Enviamos os resultados do banco de dados como resposta!
        console.log("Dados enviados para o cliente:", rows.length, "perguntas.");
        res.json(rows);

    } catch (error) {
        // Se algo der errado na comunicação com o banco de dados
        console.error("ERRO ao conectar ou consultar o banco de dados:", error);
        res.status(500).json({ message: 'Erro ao buscar perguntas do banco de dados.' });
    }
});

// 6. INICIANDO O SERVIDOR
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});