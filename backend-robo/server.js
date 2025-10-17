// 1. IMPORTAÇÕES
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

// 2. INICIALIZAÇÃO
const app = express();
const port = 3000;

// 3. CONFIGURAÇÃO DO CORS
app.use(cors());

// 4. CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS
const dbConfig = {
    host: '108.167.132.54',
    user: 'libe4727_gemini',
    password: '@XQIB4vng',
    database: 'libe4727_robo_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
const pool = mysql.createPool(dbConfig);


// 5. DEFINIÇÃO DAS ROTAS

// ROTA ATUALIZADA PARA O QUIZ
app.get('/api/perguntas', async (req, res) => {
    console.log("-> Pedido GET recebido na rota /api/perguntas!");

    // MUDANÇA 1: A consulta agora busca na tabela 'LearningObjects'
    // e filtra apenas os objetos que são perguntas de múltipla escolha.
    const query = "SELECT content FROM LearningObjects WHERE object_type = 'QUESTION_MC';";

    try {
        const connection = await pool.getConnection();
        console.log("Conexão com o MySQL estabelecida com sucesso!");

        const [rows] = await connection.query(query);
        connection.release();

        // MUDANÇA 2: "Traduzir" os dados para o formato que o front-end espera.
        // O banco de dados retorna [{ content: '{"prompt": "...", "options": ...}' }, ...]
        // Precisamos transformar em [{ question: "...", options: [...] }, ...]
        const perguntasFormatadas = rows.map(row => {
            const content = row.content; // O 'content' já vem como um objeto JSON
            return {
                question: content.prompt,
                options: content.options,
                correctAnswer: content.answer,
                hint: content.hint || "Tente pensar na definição do conceito." // Adiciona uma dica padrão
            };
        });

        console.log("Dados formatados e enviados para o cliente:", perguntasFormatadas.length, "perguntas.");
        res.json(perguntasFormatadas);

    } catch (error) {
        console.error("ERRO ao conectar ou consultar o banco de dados:", error);
        res.status(500).json({ message: 'Erro ao buscar perguntas do banco de dados.' });
    }
});

// ADICIONAR ESTA NOVA ROTA NO SEU server.js

app.get('/api/sugestoes/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`-> Pedido de sugestão recebido para o usuário: ${userId}`);

    const query = `
        SELECT
            c.concept_id,
            c.concept_name AS 'conceptName',
            lt.track_name AS 'trackName'
        FROM Concepts AS c
        JOIN LearningTracks AS lt ON c.track_id = lt.track_id
        WHERE
            c.concept_id NOT IN (SELECT concept_id FROM UserConceptMastery WHERE user_id = ?)
            AND (
                NOT EXISTS (SELECT 1 FROM ConceptPrerequisites WHERE concept_id = c.concept_id)
                OR (
                    (SELECT COUNT(*) FROM ConceptPrerequisites WHERE concept_id = c.concept_id) =
                    (SELECT COUNT(*)
                     FROM ConceptPrerequisites cp
                     JOIN UserConceptMastery ucm ON cp.prerequisite_id = ucm.concept_id
                     WHERE cp.concept_id = c.concept_id AND ucm.user_id = ? AND ucm.status = 'MASTERED')
                )
            );
    `;

    try {
        const [sugestoes] = await pool.execute(query, [userId, userId]);
        res.json(sugestoes);
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 6. INICIANDO O SERVIDOR
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});