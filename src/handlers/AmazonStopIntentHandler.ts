import { HandlerInput } from "ask-sdk";
import { Response } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";

export class AmazonStopIntentHandler extends RequestHandlerBase {
    constructor() {
        super({
            IntentName: "AMAZON.StopIntent",
            RequestType: "IntentRequest"
        });
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        console.log("Handling AMAZON.StopIntent.");

        return handlerInput.responseBuilder
            .speak("Good luck on your Pokemon journey!")
            .withShouldEndSession(true)
            .getResponse();
    }
}
