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
        const responseBuilder = handlerInput.responseBuilder;

        const welcome = "Welcome to Pokedex Quiz!";
        const instructions = "You can say 'give me a quiz', or, you can say exit.";
        return responseBuilder
            .speak(`${welcome} ${instructions}`)
            .reprompt(instructions)
            .getResponse();
    }
}
