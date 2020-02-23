import { HandlerInput } from "ask-sdk";
import { Response } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";

/**
 * Alexa intent handler for AMAZON.HelpIntent.
 */
export class AmazonHelpIntentHandler extends RequestHandlerBase {
    constructor() {
        super({
            IntentName: "AMAZON.HelpIntent",
            RequestType: "IntentRequest"
        });
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        console.trace();
        return this.buildHelpResponse(handlerInput);
    }
}
