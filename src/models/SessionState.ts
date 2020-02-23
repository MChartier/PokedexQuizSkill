import Question from "./Question";

/**
 * Interface modeling persistent state for a PokedexQuizSkill user session.
 */
export default interface SessionState {
    /**
     * The number of questions that the player has answered correctly.
     */
    CorrectAnswers: number;

    /**
     * The questions included in the current quiz.
     */
    Questions: Question[];

    /**
     * The number of questions that the player has answered, either correctly in incorrectly.
     */
    QuestionsAnswered: number;
}