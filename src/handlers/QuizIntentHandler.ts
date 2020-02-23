import { HandlerInput } from "ask-sdk";
import { Response } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";
import PokemonDatabase from "../database/PokemonDatabase";
import SessionState from "../models/SessionState";
import QuestionBuilder from "../QuestionBuilder";
import Question from "../models/Question";
import QuizGenerator from "../QuizGenerator";
import QuizProctor from "../QuizProctor";

/**
 * Alexa intent handler for QuizIntent.
 */
export class QuizIntentHandler extends RequestHandlerBase {
    private readonly NumQuestions = 5;
    
    private readonly quizGenerator: QuizGenerator;
    private readonly quizProctor: QuizProctor;

    constructor() {
        super({
            IntentName: "QuizIntent",
            RequestType: "IntentRequest"
        });

        this.quizGenerator = new QuizGenerator(new PokemonDatabase(), new QuestionBuilder());
        this.quizProctor = new QuizProctor();
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        console.trace();

        // Check whether there is any existing session state
        let state: SessionState | null = this.getSessionState(handlerInput);
        if (state?.QuestionsAnswered) {
            console.log("Session state already exists. Reprompting player with current question.");

            // If there is already session state, we shouldn't be starting a new quiz.
            // Reprompt with the current question.
            const quizStartedIntro = "You've already started a quiz."
            const questionPrompt = state.Questions[state.QuestionsAnswered].Prompt;
            return handlerInput.responseBuilder
                .speak(`${quizStartedIntro} ${questionPrompt}`)
                .reprompt(questionPrompt)
                .getResponse();
        }

        // Generate quiz and set initial session state
        const questions: Question[] = await this.quizGenerator.Generate(this.NumQuestions);
        state = {
            CorrectAnswers: 0,
            Questions: questions,
            QuestionsAnswered: 0
        };
        this.updateSessionState(handlerInput, state);

        return this.quizProctor.HandleStartQuiz(handlerInput);
    }
}