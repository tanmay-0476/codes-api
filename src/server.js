const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const questionService = require('./questionService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Questions API is running' });
});

// Routes
app.get('/questions', (req, res) => {
  const questions = questionService.getAllQuestions();
  res.json(questions);
});

app.get('/questions/:id', (req, res) => {
  const question = questionService.getQuestionById(req.params.id);
  if (!question) return res.status(404).json({ error: 'Not found' });
  res.json(question);
});

app.post('/questions', (req, res) => {
  try {
    const created = questionService.addQuestion(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Error creating question' });
  }
});

app.put('/questions/:id', (req, res) => {
  try {
    const updated = questionService.updateQuestion(req.params.id, req.body);
    res.json(updated);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Error updating question' });
  }
});

app.delete('/questions/:id', (req, res) => {
  try {
    const removed = questionService.deleteQuestion(req.params.id);
    res.json(removed);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Error deleting question' });
  }
});

// Serve the data file statically for convenience (read-only)
app.use('/data', express.static(path.join(__dirname, '..', 'questions.json')));

app.listen(PORT, () => {
  console.log(`Questions API listening on http://localhost:${PORT}`);
});

