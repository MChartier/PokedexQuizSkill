import Question from "./Question";

export default interface SessionState {
    CorrectAnswers: number;
    CurrentQuestion: Question;
    NumberOfQuestions: number;
    QuestionsAnswered: number;
}