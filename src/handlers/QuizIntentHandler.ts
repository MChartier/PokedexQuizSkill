import { HandlerInput } from "ask-sdk";
import { Response } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";
import PokemonDatabase from "../database/PokemonDatabase";
import SessionState from "../models/SessionState";
import QuestionBuilder from "../QuestionBuilder";
import Question from "../models/Question";
import QuizGenerator from "../QuizGenerator";

export class QuizIntentHandler extends RequestHandlerBase {
    private readonly NumQuestions: number = 5;
    
    private quizGenerator: QuizGenerator;

    constructor() {
        super({
            IntentName: "QuizIntent",
            RequestType: "IntentRequest"
        });

        this.quizGenerator = new QuizGenerator(new PokemonDatabase(), new QuestionBuilder());
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        console.log("Handling QuizIntent...");

        let state: SessionState | null = this.getSessionState(handlerInput);
        if (state) {
            console.log("Session state already exists. Reprompting player with current question.");

            // If there is already session state, we shouldn't be starting a new quiz.
            // Reprompt with the current question.
            return handlerInput.responseBuilder
                .speak("You've already started a quiz.")
                .reprompt(this.getCurrentQuestion(state))
                .getResponse();
        }

        const questions: Question[] = await this.quizGenerator.Generate(this.NumQuestions);

        // Create initial session state to attach to response
        state = this.updateSessionState(handlerInput, {
            CorrectAnswers: 0,
            Questions: questions,
            QuestionsAnswered: 0
        });
        if (!state) {
            throw new Error("Failed to update state.");
        }

        // Ask the first question
        return handlerInput.responseBuilder
            .speak(`Here's question 1.`)
            .reprompt(this.getCurrentQuestion(state))
            .getResponse();
    }

    private getCurrentQuestion(state: SessionState): string {
        return state.Questions[state.QuestionsAnswered].Prompt;
    }
}