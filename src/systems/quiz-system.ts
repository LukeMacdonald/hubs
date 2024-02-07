import { HubsWorld } from "../app";
import { qsGet } from "../utils/qs_truthy";

export async function quizSystem(world: HubsWorld) {
  const quizID = qsGet("quiz");

  const token = qsGet("token");

  const response = await fetch(`http://server.canvas-hub.com/quiz/questions/${token}`);

  localStorage.setItem("connector-key", token!);

  localStorage.setItem("quiz-id", quizID!);

  const quiz: any = await response.json();

  const answers = Array(quiz.questions.length).fill(null);

  const entity: any = document.createElement("a-entity");

  entity.setAttribute("id", "canvas-quiz");

  entity.setAttribute("quiz", {
    questions: quiz.questions,
    qOptions: quiz.options,
    answers: answers,
    time_limit: quiz.time_limit
  });

  AFRAME.scenes[0].append(entity);
}
