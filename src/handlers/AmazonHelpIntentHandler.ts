import { HandlerInput } from "ask-sdk";
import { Response } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";

export class AmazonHelpIntentHandler extends RequestHandlerBase {
    constructor() {
        super({
            IntentName: "AMAZON.HelpIntent",
            RequestType: "IntentRequest"
        });
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        console.log("Handling AMAZON.HelpIntent.");

        return this.buildHelpResponse(handlerInput);
    }
}
