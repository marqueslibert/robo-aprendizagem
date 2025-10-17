// --- 1. REFERÊNCIAS AOS ELEMENTOS --- ?
// Nenhuma mudança aqui
const questionTextElement = document.getElementById('question-text');
const optionsContainerElement = document.getElementById('options-container');
const feedbackTextElement = document.getElementById('feedback-text');
const robotElement = document.getElementById('robot');
const nextButton = document.getElementById('next-button');

// --- 2. DADOS ---
// O QUE MUDOU: A lista de dados foi removida daqui!
// Agora teremos uma variável para guardar os dados que virão do servidor.
let quizData = []; 

// --- 3. VARIÁVEIS DE ESTADO ---
// Nenhuma mudança aqui
let currentQuestionIndex = 0;

// --- 4. FUNÇÕES ---
// As funções displayQuestion, checkAnswer e nextQuestion continuam as mesmas de antes.
// A única diferença é que elas só vão rodar DEPOIS que os dados forem buscados.

function displayQuestion() {
    // Pega a pergunta atual da nossa lista de dados
    const currentQuestion = quizData[currentQuestionIndex];
    questionTextElement.textContent = currentQuestion.question;
    optionsContainerElement.innerHTML = ''; 
    robotElement.classList.remove('robot-energized');
    
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.disabled = false; // Garante que os botões estejam habilitados
        button.addEventListener('click', () => checkAnswer(option));
        optionsContainerElement.appendChild(button);
    });
}

function checkAnswer(selectedOption) {
    const currentQuestion = quizData[currentQuestionIndex];
    if (selectedOption === currentQuestion.correctAnswer) {
        feedbackTextElement.textContent = "Correto! Você energizou o robô!";
        feedbackTextElement.style.color = "#4CAF50";
        robotElement.classList.add('robot-energized');
    } else {
        feedbackTextElement.textContent = `Incorreto. Dica: ${currentQuestion.hint}`;
        feedbackTextElement.style.color = "#f44336";
    }
    const allButtons = optionsContainerElement.querySelectorAll('button');
    allButtons.forEach(button => button.disabled = true);
    nextButton.classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        displayQuestion();
        feedbackTextElement.textContent = '';
        nextButton.classList.add('hidden');
    } else {
        questionTextElement.textContent = "Parabéns, você completou o desafio!";
        optionsContainerElement.innerHTML = '';
        feedbackTextElement.textContent = 'Você demonstrou um conhecimento sólido!';
        nextButton.classList.add('hidden');
    }
}

// --- 5. INICIALIZAÇÃO ---
// O QUE MUDOU: Toda a nossa inicialização agora é focada em buscar os dados!
nextButton.addEventListener('click', nextQuestion);

// Função principal que inicia o aplicativo
async function startQuiz() {
    try {
        // O "pedido" para o nosso servidor usando fetch
        const response = await fetch ('http://localhost:3000/api/perguntas');
        
        // Verificamos se o "garçom" respondeu com sucesso
        if (!response.ok) {
            throw new Error('Não foi possível buscar as perguntas do servidor.');
        }
        
        // Pegamos os dados da resposta e transformamos em um formato que o JS entende
        const data = await response.json();
        
        // Guardamos os dados na nossa variável
        quizData = data;
        
        // AGORA SIM, com os dados em mãos, mostramos a primeira pergunta
        displayQuestion();

    } catch (error) {
        // Se algo der errado (servidor desligado, etc.), mostramos uma mensagem de erro
        console.error("Erro ao iniciar o quiz:", error);
        questionTextElement.textContent = "Oops! Não conseguimos carregar o quiz. Tente novamente mais tarde.";
    }
}

// --- 6. CÓDIGO NOVO PARA SUGESTÕES ---
const sugestoesBtn = document.getElementById('buscar-sugestoes-btn');
const sugestoesDiv = document.getElementById('sugestoes-div');

sugestoesBtn.addEventListener('click', async () => {
    const userId = 1; // Vamos usar Alice (ID 1) como exemplo
    sugestoesDiv.innerHTML = '<p>Buscando sugestões...</p>';

    try {
        // A URL corresponde ao novo endpoint que criamos
        const response = await fetch(`http://localhost:3000/api/sugestoes/${userId}`);
        if (!response.ok) {
            throw new Error('Falha na resposta do servidor.');
        }
        const sugestoes = await response.json();

        // Limpa a div e exibe as sugestões
        sugestoesDiv.innerHTML = '';
        if (sugestoes.length === 0) {
            sugestoesDiv.innerHTML = '<p>Você já está apto a iniciar todos os conceitos disponíveis!</p>';
        } else {
            const lista = document.createElement('ul');
            sugestoes.forEach(sugestao => {
                const item = document.createElement('li');
                item.textContent = `${sugestao.conceptName} (Trilha: ${sugestao.trackName})`;
                lista.appendChild(item);
            });
            sugestoesDiv.appendChild(lista);
        }
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        sugestoesDiv.innerHTML = '<p>Não foi possível carregar as sugestões no momento.</p>';
    }
});

// Chamamos a função principal para dar início a tudo!
startQuiz();