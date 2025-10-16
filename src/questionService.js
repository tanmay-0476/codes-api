const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'questions.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function readQuestions() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  if (!raw.trim()) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    // If file is corrupted, fallback to empty list to avoid server crash
    return [];
  }
}

function writeQuestions(questions) {
  // JSON.stringify handles proper escaping of special characters in strings (e.g., \n, \" )
  const serialized = JSON.stringify(questions, null, 2);
  fs.writeFileSync(DATA_FILE, serialized, 'utf8');
}

function getAllQuestions() {
  return readQuestions();
}

function getQuestionById(id) {
  const questions = readQuestions();
  return questions.find((q) => Number(q.id) === Number(id)) || null;
}

function addQuestion(question) {
  const questions = readQuestions();
  if (questions.some((q) => Number(q.id) === Number(question.id))) {
    const err = new Error('Question with this id already exists');
    err.status = 400;
    throw err;
  }
  const newQuestion = {
    id: Number(question.id),
    title: String(question.title ?? ''),
    code: String(question.code ?? '')
  };
  questions.push(newQuestion);
  writeQuestions(questions);
  return newQuestion;
}

function updateQuestion(id, updates) {
  const questions = readQuestions();
  const idx = questions.findIndex((q) => Number(q.id) === Number(id));
  if (idx === -1) {
    const err = new Error('Question not found');
    err.status = 404;
    throw err;
  }
  const updated = {
    ...questions[idx],
    ...(updates.id !== undefined ? { id: Number(updates.id) } : {}),
    ...(updates.title !== undefined ? { title: String(updates.title) } : {}),
    ...(updates.code !== undefined ? { code: String(updates.code) } : {})
  };
  // If id is changed, ensure uniqueness
  if (
    updated.id !== questions[idx].id &&
    questions.some((q, i) => i !== idx && Number(q.id) === Number(updated.id))
  ) {
    const err = new Error('Another question with this id already exists');
    err.status = 400;
    throw err;
  }
  questions[idx] = updated;
  writeQuestions(questions);
  return updated;
}

function deleteQuestion(id) {
  const questions = readQuestions();
  const idx = questions.findIndex((q) => Number(q.id) === Number(id));
  if (idx === -1) {
    const err = new Error('Question not found');
    err.status = 404;
    throw err;
  }
  const [removed] = questions.splice(idx, 1);
  writeQuestions(questions);
  return removed;
}

module.exports = {
  getAllQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion
};

