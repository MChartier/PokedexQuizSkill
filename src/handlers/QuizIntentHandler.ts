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

        if (!state?.Questions) {
            // Generate quiz and set initial session state
            const questions: Question[] = await this.quizGenerator.Generate(this.NumQuestions);
            state = {
                CorrectAnswers: 0,
                Questions: questions,
                QuestionsAnswered: 0
            };
            this.updateSessionState(handlerInput, state);

            const quizIntro = `Let's take a quiz! I'll ask you ${this.NumQuestions} questions.`;
            return this.quizProctor.ReadNextQuestion(handlerInput, quizIntro);
        }
        else {
            return this.quizProctor.ReadNextQuestion(handlerInput, "You've already started a quiz.");
        }
    }
}