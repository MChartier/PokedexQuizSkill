import { HandlerInput } from "ask-sdk";
import { Response } from "ask-sdk-model";
import { RequestHandlerBase } from "./RequestHandlerBase";

/**
 * Alexa launch request handler.
 */
export class LaunchRequestHandler extends RequestHandlerBase {
    constructor() {
        super({
            RequestType: "LaunchRequest"
        });
    }

    async handle(handlerInput: HandlerInput): Promise<Response> {
        console.trace();
        return this.buildHelpResponse(handlerInput);
    }
}
