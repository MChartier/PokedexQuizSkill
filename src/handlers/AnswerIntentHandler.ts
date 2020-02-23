import { HandlerInput } from "ask-sdk";
import { Response, IntentRequest, Slot } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";
import SessionState from "../models/SessionState";

export class AnswerIntentHandler extends RequestHandlerBase {
    constructor() {
        super({
            IntentName: "AnswerIntent",
            RequestType: "IntentRequest"
        });
    }

    canHandle(handlerInput: HandlerInput): boolean {
        return super.canHandle(handlerInput) && this.getSessionState != null;
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        console.log("Handling AnswerIntent...");

        // Defensive check on input
        const responseBuilder = handlerInput.responseBuilder;
        const intentRequest: IntentRequest = handlerInput.requestEnvelope.request as IntentRequest;
        if (!intentRequest || !intentRequest.intent || !intentRequest.intent.slots) {
            throw new Error("Invalid IntentRequest");
        }

        const state: SessionState | null = this.getSessionState(handlerInput);
        if (!state) {
            throw new Error("Failed to read session state.");
        }

        const pokemonName = this.getPokemonName(intentRequest.intent.slots["PokemonName"]);

        // Check whether the provided answer is correct
        const correctAnswer = state.Questions[state.QuestionsAnswered].Answer;
        const isAnswerCorrect: boolean = pokemonName == correctAnswer;

        // Update state based on whether the player got the answer right
        if (isAnswerCorrect) {
            state.CorrectAnswers++;
        }
        state.QuestionsAnswered++;
        this.updateSessionState(handlerInput, state);

        // Tell the player that they got the answer correct, or what the actual answer was
        const answerResponse: string = isAnswerCorrect ?
            "That's right!" : 
            `That's not right. The correct answer was: ${correctAnswer}.`;

        if (state.QuestionsAnswered < state.Questions.length) {
            // If the quiz isn't over yet, acknowledge answer and ask the next question
            const nextQuestionIntro = `Here's question ${state.QuestionsAnswered + 1}.`;
            const nextQuestion = state.Questions[state.QuestionsAnswered].Prompt;
            const speech = `${answerResponse} ${nextQuestionIntro} ${nextQuestion}`;
            return responseBuilder
                .speak(speech)
                .reprompt(nextQuestion)
                .getResponse();
        }
        else {
            // Generate a response summarizing the results of the quiz and end the session
            const summary = `You answered ${state.CorrectAnswers} out of ${state.QuestionsAnswered} correctly.`;
            const assessment = this.getAssessment(state.CorrectAnswers, state.QuestionsAnswered);
            const speech = `${answerResponse} ${summary} ${assessment}`;
            return responseBuilder
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
}