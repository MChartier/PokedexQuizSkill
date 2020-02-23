import { HandlerInput } from "ask-sdk";
import { Response, IntentRequest, Slot } from "ask-sdk-model";
import SessionState from "./models/SessionState";

/**
 * Implements logic for administering a quiz. 
 * Responsible for updating state and generating responses to the player based on their answers to each question.
 */
export default class QuizProctor {

    /**
     * Generates a response and updates session state in response to the player providing an answer.
     * @param handlerInput Input to the original intent handler.
     * @returns Response to be returned to the caller.
     */
    public HandleAnswer(handlerInput: HandlerInput): Response {
        console.trace();

        // Extract IntentRequest from HandlerInput
        const intentRequest: IntentRequest = handlerInput.requestEnvelope.request as IntentRequest;
        if (!intentRequest || !intentRequest.intent || !intentRequest.intent.slots) {
            throw new Error("Invalid IntentRequest");
        }

        // Get the current session state
        const state: SessionState | null = this.getSessionState(handlerInput);
        if (!state) {
            throw new Error("Failed to read session state.");
        }

        // Compare the player's answer to the correct answer
        const playerAnswer = this.getPokemonName(intentRequest.intent.slots["PokemonName"]);
        const correctAnswer = state.Questions[state.QuestionsAnswered].Answer;
        const isAnswerCorrect: boolean = playerAnswer == correctAnswer;

        // Update session state
        if (isAnswerCorrect) {
            state.CorrectAnswers++;
        }
        state.QuestionsAnswered++;
        this.updateSessionState(handlerInput, state);

        // Tell the player that they got the answer correct, or what the actual answer was
        const answerResponseIntro: string = isAnswerCorrect ?
            "That's right!" : 
            `That's not right. The correct answer was: ${correctAnswer}.`;

        return this.buildAnswerResponse(handlerInput, answerResponseIntro);
    }

    /**
     * Generates a response and updates session state in response to a player that has declined to answer a question.
     * Updates state of the quiz to reflect that a question has been answered incorrectly.
     * @param handlerInput Input to the original intent handler.
     * @returns Response to be returned to the caller.
     */
    public HandleGiveUp(handlerInput: HandlerInput): Response {
        console.trace();

        // Get current SessionState
        const state: SessionState | null = this.getSessionState(handlerInput);
        if (!state) {
            throw new Error("Failed to read session state.");
        }

        // Update state to proceed to the next question
        state.QuestionsAnswered++;
        this.updateSessionState(handlerInput, state);

        // Tell the player the correct answer
        const correctAnswer = state.Questions[state.QuestionsAnswered].Answer;
        const answerResponseIntro = `Okay, I'll tell you the answer. The correct answer was: ${correctAnswer}.`;

        return this.buildAnswerResponse(handlerInput, answerResponseIntro);
    }

    public HandleStartQuiz(handlerInput: HandlerInput): Response {
        console.trace();

        // Get current SessionState
        const state: SessionState | null = this.getSessionState(handlerInput);
        if (!state) {
            throw new Error("Failed to read session state.");
        }
        
        // Start the quiz and ask the first question
        const quizIntro = `Let's take a quiz! I'll ask you ${state.Questions.length} questions.`;
        const questionIntro = "Here's question 1.";
        const questionPrompt = state.Questions[state.QuestionsAnswered].Prompt;
        const speech = `${quizIntro} ${questionIntro} ${questionPrompt}`;
        return handlerInput.responseBuilder
            .speak(speech)
            .reprompt(questionPrompt)
            .getResponse();
    }

    private buildAnswerResponse(handlerInput: HandlerInput, answerResponseIntro: string): Response {
        // Get current SessionState
        const state: SessionState | null = this.getSessionState(handlerInput);
        if (!state) {
            throw new Error("Failed to read session state.");
        }

        if (state.QuestionsAnswered < state.Questions.length) {
            // If the quiz isn't over yet, acknowledge answer and ask the next question
            const nextQuestionIntro = `Here's question ${state.QuestionsAnswered + 1}.`;
            const nextQuestion = state.Questions[state.QuestionsAnswered].Prompt;
            const speech = `${answerResponseIntro} ${nextQuestionIntro} ${nextQuestion}`;
            return handlerInput.responseBuilder
                .speak(speech)
                .reprompt(nextQuestion)
                .getResponse();
        }
        else {
            // Generate a response summarizing the results of the quiz and end the session
            const summary = `You answered ${state.CorrectAnswers} out of ${state.QuestionsAnswered} correctly.`;
            const assessment = this.getAssessment(state.CorrectAnswers, state.QuestionsAnswered);
            const outro = "Thanks for playing!";
            const speech = `${answerResponseIntro} ${summary} ${assessment} ${outro}`;
            return handlerInput.responseBuilder
                .speak(speech)
                .withShouldEndSession(true)
                .getResponse();
        }
    }

    private getAssessment(numCorrect: number, numQuestions: number): string {
        const percentCorrect = numCorrect * 100 / numQuestions;
        if (percentCorrect == 100) {
            return "You are a Pokémon Master!";
        }
        else if (percentCorrect >= 60) {
            return "You know a lot about Pokémon!";
        }
        else {
            return "Keep training to increase your Pokémon knowledge!"
        }
    }

    private getPokemonName(slot: Slot): string | null {
        // Get the answer provided by the user
        let pokemonName: string | undefined = slot.value;
        if (slot && slot.resolutions && slot.resolutions.resolutionsPerAuthority && 
            slot.resolutions.resolutionsPerAuthority[0] && slot.resolutions.resolutionsPerAuthority[0].values) {
            // Use resolved value if one is available
            pokemonName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        }

        return pokemonName ?? null;
    }

    private getSessionState(handlerInput: HandlerInput): SessionState | null {
        return handlerInput.attributesManager.getSessionAttributes();
    }

    private updateSessionState(handlerInput: HandlerInput, sessionState: SessionState): void {
        handlerInput.attributesManager.setSessionAttributes(sessionState);
    }
}