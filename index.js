const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
const port = process.env.PORT || 3000;

db.connect();

let quiz = [];
db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows;
  }
  // Do NOT close db here
});

let totalCorrect = 0;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  res.render("index", { question: currentQuestion });
});

app.post("/submit", (req, res) => {
  const answer = req.body.answer.trim();
  let isCorrect = false;

  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  }

  nextQuestion();
  res.render("index", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
