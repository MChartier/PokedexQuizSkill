import { HandlerInput } from "ask-sdk";
import { Response } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";
import QuizProctor from "../QuizProctor";

/**
 * Alexa intent handler for GiveUpIntent.
 */
export class GiveUpIntentHandler extends RequestHandlerBase {
    private readonly quizProctor: QuizProctor;
    
    constructor() {
        super({
            IntentName: "GiveUpIntent",
            RequestType: "IntentRequest"
        });

        this.quizProctor = new QuizProctor();
    }

    canHandle(handlerInput: HandlerInput): boolean {
        return super.canHandle(handlerInput) && this.getSessionState(handlerInput) != null;
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        return this.quizProctor.HandleGiveUp(handlerInput);
    }
}