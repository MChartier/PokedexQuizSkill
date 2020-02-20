import Question from "./Question";

export default interface SessionState {
    CorrectAnswers: number;
    Questions: Question[];
    QuestionsAnswered: number;
}