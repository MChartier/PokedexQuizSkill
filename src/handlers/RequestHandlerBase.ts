import { HandlerInput, RequestHandler } from "ask-sdk";
import { Response } from "ask-sdk-model";
import SessionState from "../models/SessionState";

export interface HandlerConfig {
    RequestType: string;
    IntentName?: string | undefined;
}

export abstract class RequestHandlerBase implements RequestHandler {
    private _requestType: string;
    private _intentName: string | undefined;

    constructor(handlerConfig: HandlerConfig) {
        this._requestType = handlerConfig.RequestType;
        this._intentName = handlerConfig.IntentName;
    }

    buildHelpResponse(handlerInput: HandlerInput): Response {
        const responseBuilder = handlerInput.responseBuilder;
        
        const welcome = "Welcome to Pokedex Quiz!";
        const instructions = "You can say 'give me a quiz', or, you can say exit.";
        return responseBuilder
            .speak(`${welcome} ${instructions}`)
            .reprompt(instructions)
            .getResponse();
    }

    canHandle(handlerInput: HandlerInput): boolean {
        // Can handle if request type matches and, for intent requests, the intent matches
        const request = handlerInput.requestEnvelope.request;
        return (
            request.type == this._requestType &&
            (request.type != "IntentRequest" ||
                request.intent.name == this._intentName)
        );
    }

    getSessionState(handlerInput: HandlerInput): SessionState | null {
        if (!handlerInput.requestEnvelope || !handlerInput.requestEnvelope.session || !handlerInput.requestEnvelope.session.attributes) {
            return null;
        }

        return handlerInput.requestEnvelope.session.attributes.state;
    }

    updateSessionState(handlerInput: HandlerInput, sessionState: SessionState): void {
        if (!handlerInput.requestEnvelope || !handlerInput.requestEnvelope.session || !handlerInput.requestEnvelope.session.attributes) {
            return;
        }

        handlerInput.requestEnvelope.session.attributes.state = sessionState;
    }

    abstract handle(handlerInput: HandlerInput): Promise<Response>;
}
