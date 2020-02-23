import { HandlerInput } from "ask-sdk";
import { Response, IntentRequest, Slot } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";
import SessionState from "../models/SessionState";

export class GiveUpIntentHandler extends RequestHandlerBase {
    constructor() {
        super({
            IntentName: "GiveUpIntent",
            RequestType: "IntentRequest"
        });
    }

    canHandle(handlerInput: HandlerInput): boolean {
        return super.canHandle(handlerInput) && this.getSessionState != null;
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        console.log("Handling GiveUpIntent...");

        // Defensive check on input
        const responseBuilder = handlerInput.responseBuilder;
        const intentRequest: IntentRequest = handlerInput.requestEnvelope.request as IntentRequest;
        if (!intentRequest || !intentRequest.intent || !intentRequest.intent.slots) {
            throw new Error("Invalid IntentRequest");
        }

        let state: SessionState | null = this.getSessionState(handlerInput);
        if (!state) {
            throw new Error("Failed to read session state.");
        }

        // Update state to proceed to the next question
        state = this.updateSessionState(handlerInput, {
            CorrectAnswers: state.CorrectAnswers,
            Questions: state.Questions,
            QuestionsAnswered: state.QuestionsAnswered + 1
        });
        if (!state) {
            throw new Error("Failed to update session state.");
        }

        // TODO: Avoid code duplication between this and AnswerIntentHandler
        // Tell the player the correct answer
        const correctAnswer = state.Questions[state.QuestionsAnswered].Answer;
        const answerResponse = `Okay, I'll tell you the answer. The correct answer was: ${correctAnswer}.`;

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
}