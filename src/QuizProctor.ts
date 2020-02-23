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

        return this.ReadNextQuestion(handlerInput, answerResponseIntro);
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
        const correctAnswer = state.Questions[state.QuestionsAnswered - 1].Answer;
        const answerResponseIntro = `Okay, I'll tell you the answer. The correct answer was: ${correctAnswer}.`;

        return this.ReadNextQuestion(handlerInput, answerResponseIntro);
    }

    public ReadNextQuestion(handlerInput: HandlerInput, intro: string): Response {
        // Get current SessionState
        const state: SessionState | null = this.getSessionState(handlerInput);
        if (!state) {
            throw new Error("Failed to read session state.");
        }

        if (state.QuestionsAnswered == state.Questions.length) {
            // If we've finished the quiz, read the results and end the quiz
            return this.ReadSummary(handlerInput, intro);
        }
        else {
            // Ask the next question
            const questionIntro = `Here's question ${state.QuestionsAnswered + 1}.`;
            const questionPrompt = state.Questions[state.QuestionsAnswered].Prompt;
            const speech = `${intro} ${questionIntro} ${questionPrompt}`;
            return handlerInput.responseBuilder
                .speak(speech)
                .reprompt(questionPrompt)
                .getResponse();
        }
    }

    public ReadSummary(handlerInput: HandlerInput, intro: string): Response {
        // Get current SessionState
        const state: SessionState | null = this.getSessionState(handlerInput);
        if (!state) {
            throw new Error("Failed to read session state.");
        }

        // Generate a response summarizing the results of the quiz and end the session
        const summary = `You answered ${state.CorrectAnswers} out of ${state.QuestionsAnswered} correctly.`;
        const assessment = this.getAssessment(state.CorrectAnswers, state.QuestionsAnswered);
        const outro = "Thanks for playing!";
        const speech = `${intro} ${summary} ${assessment} ${outro}`;
        return handlerInput.responseBuilder
            .speak(speech)
            .withShouldEndSession(true)
            .getResponse();
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