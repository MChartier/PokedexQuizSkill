import { HandlerInput } from "ask-sdk";
import { Response } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";

export class LaunchRequestHandler extends RequestHandlerBase {
    constructor() {
        super({
            RequestType: "LaunchRequest"
        });
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        return handlerInput.responseBuilder
            .speak("Welcome to Pokedex Quiz!")
            .addDelegateDirective({
                name: 'QuizIntent',
                confirmationStatus: 'NONE',
                slots: {}
             })
            .getResponse();
    }
}
