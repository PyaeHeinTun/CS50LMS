import { makeToast } from "./toast.js";

const questions = [];

export function addQuiz() {
    const questionForm = document.getElementById("addFormModal");
    const answersDiv = document.getElementById("answers");
    const addAnswerBtn = document.getElementById("addAnswerBtn");
    const addQuestionBtn = document.getElementById("addQuestionBtn");

    // Add new answer input field
    addAnswerBtn.removeEventListener("click", addAnswerBtnListener);
    addAnswerBtn.addEventListener("click", addAnswerBtnListener);

    // Add question to array and reset form
    addQuestionBtn.removeEventListener("click", addQuestionBtnListener);
    addQuestionBtn.addEventListener("click", addQuestionBtnListener);
}

export function getQuizList() {
    return questions
}


function addAnswerBtnListener() {
    const questionForm = document.getElementById("addFormModal");
    const answersDiv = document.getElementById("answers");
    const addAnswerBtn = document.getElementById("addAnswerBtn");
    const addQuestionBtn = document.getElementById("addQuestionBtn");

    const answerIndex = answersDiv.children.length;
    const newAnswerDiv = document.createElement("div");
    newAnswerDiv.classList.add("grid", "grid-cols-6", "gap-4", "mt-2");
    newAnswerDiv.innerHTML = `
        <input type="radio" name="correctAnswer" value="${answerIndex}" class="col-span-1 text-blue-600 focus:ring-blue-500" required />
        <input type="text" name="answer" placeholder="Answer ${answerIndex + 1}" 
            class="col-span-5 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
    `;
    answersDiv.appendChild(newAnswerDiv);
}

export function addQuestionBtnListener() {
    const questionForm = document.getElementById("addFormModal");
    const answersDiv = document.getElementById("answers");
    const addAnswerBtn = document.getElementById("addAnswerBtn");
    const addQuestionBtn = document.getElementById("addQuestionBtn");
    const questionInput = document.getElementById("question");
    const answerInputs = document.getElementsByName("answer");
    const correctAnswerInput = document.querySelector('input[name="correctAnswer"]:checked');

    if (!questionInput.value || answerInputs.length < 2 || !correctAnswerInput) {
        alert("Please fill in the question, at least two answers, and select the correct answer.");
        return;
    }

    // Collect answers
    const answers = Array.from(answerInputs).map((input) => input.value);

    // Add to questions array
    questions.push({
        question: questionInput.value,
        answers,
        correctAnswer: parseInt(correctAnswerInput.value),
    });

    // Reset the form
    questionForm.reset();
    answersDiv.innerHTML = `
        <div class="grid grid-cols-6 gap-4">
            <input type="radio" name="correctAnswer" value="0" class="col-span-1 text-blue-600 focus:ring-blue-500" required />
            <input type="text" name="answer" placeholder="Answer 1" 
                class="col-span-5 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
        </div>
        <div class="grid grid-cols-6 gap-4">
            <input type="radio" name="correctAnswer" value="1" class="col-span-1 text-blue-600 focus:ring-blue-500" required />
            <input type="text" name="answer" placeholder="Answer 2" 
                class="col-span-5 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
        </div>
    `;
    
    makeToast("Success","Question added to cache.")
}

export function renderQuiz(quizList) {
    // Quiz Data
    var quizData = quizList.map((value)=>{
        return {
            question: value['question'],
            options: value['choices'],
            answer: value['answer'],
        }
    })
    // Quiz State
    let currentQuestion = 0;
    let score = 0;

    // DOM Elements
    const questionEl = document.getElementById("question");
    const answersEl = document.getElementById("answers");
    const questionCounterEl = document.getElementById("question-counter");
    const nextBtn = document.getElementById("next-btn");
    const scoreContainer = document.getElementById("score-container");
    const scoreEl = document.getElementById("score");
    const restartBtn = document.getElementById("restart-btn");

    // Initialize Quiz
    function loadQuestion() {
        // Clear previous options
        answersEl.innerHTML = "";
        nextBtn.classList.add("hidden");

        // Load question and options
        const currentQuiz = quizData[currentQuestion];
        questionEl.textContent = currentQuiz.question;
        questionCounterEl.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;

        currentQuiz.options.forEach((option) => {
            const li = document.createElement("li");
            li.className = "border rounded-lg px-4 py-2 cursor-pointer hover:bg-indigo-100";
            li.textContent = option;

            // Handle option selection
            li.addEventListener("click", () => {
                // Deselect other options
                const allOptions = answersEl.querySelectorAll("li");
                allOptions.forEach((el) => el.classList.remove("bg-indigo-600", "text-white"));

                // Select clicked option
                li.classList.add("bg-indigo-600", "text-white");
                nextBtn.classList.remove("hidden");

                // Save user answer
                li.dataset.selected = true;
            });

            answersEl.appendChild(li);
        });
    }

    // Next Question
    nextBtn.addEventListener("click", () => {
        // Get selected option
        const selectedOption = answersEl.querySelector("[data-selected]");
        if (!selectedOption) return;

        // Check answer
        if (selectedOption.textContent === quizData[currentQuestion].answer) {
            score++;
        }

        // Move to next question or finish
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showScore();
        }
    });

    // Show Score
    function showScore() {
        document.getElementById("quiz-container").querySelector("div").classList.add("hidden");
        scoreContainer.classList.remove("hidden");
        scoreEl.textContent = `You scored ${score} out of ${quizData.length}!`;
    }

    // Restart Quiz
    restartBtn.addEventListener("click", () => {
        currentQuestion = 0;
        score = 0;
        scoreContainer.classList.add("hidden");
        document.getElementById("quiz-container").querySelector("div").classList.remove("hidden");
        loadQuestion();
    });

    // Load the first question
    loadQuestion();
}