import { HandlerInput } from "ask-sdk";
import { Response } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";

export class SessionEndedHandler extends RequestHandlerBase {
    constructor() {
        super({
            RequestType: "LaunchRequest"
        });
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        return handlerInput.responseBuilder
            .speak("Good luck on your Pokemon journey!")
            .withShouldEndSession(true)
            .getResponse();
    }
}
