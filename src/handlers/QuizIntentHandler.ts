import { HandlerInput } from "ask-sdk";
import { Response, IntentRequest } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";
import PokemonDatabase from "../database/PokemonDatabase";
import Pokemon from "../models/Pokemon";
import SessionState from "../models/SessionState";
import QuestionBuilder from "../QuestionBuilder";
import Question from "../models/Question";

export class QuizIntentHandler extends RequestHandlerBase {
    private database: PokemonDatabase;
    
    constructor() {
        super({
            IntentName: "LookupByNameIntent",
            RequestType: "IntentRequest"
        });
        this.database = new PokemonDatabase();
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        console.log("Handling QuizIntent.");

        const responseBuilder = handlerInput.responseBuilder;
        const intentRequest: IntentRequest = handlerInput.requestEnvelope.request as IntentRequest;
        if (!intentRequest || !intentRequest.intent || !intentRequest.intent.slots) {
            throw "Invalid IntentRequest";
        }

        const state: SessionState | null = this.getSessionState(handlerInput);
        if (state) {
            // If there is already session state, we shouldn't be starting a new quiz.
            // Reprompt with the current question.
            return responseBuilder
                .speak("You've already started a quiz.")
                .reprompt(state.CurrentQuestion.Prompt)
                .getResponse();
        }

        // TODO: Avoid repeating a Pokemon in the same quiz
        const pokemonDatabase: PokemonDatabase = new PokemonDatabase();
        const pokemon: Pokemon = await pokemonDatabase.GetRandomPokemon();
        const questionBuilder: QuestionBuilder = new QuestionBuilder();
        const question: Question = questionBuilder.Build(pokemon);

        // Create initial session state to attach to response
        this.updateSessionState(handlerInput, {
            CorrectAnswers: 0,
            CurrentQuestion: question,
            NumberOfQuestions: 5,
            QuestionsAnswered: 0
        });

        // Ask the first question
        return responseBuilder
            .speak(`Here's question 1.`)
            .reprompt(question.Prompt)
            .getResponse();
    }
}