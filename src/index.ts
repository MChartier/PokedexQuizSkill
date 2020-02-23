/**
 * This script is the entry point executed to handle requests for PokedexQuizSkill.
 */

import { SkillBuilders } from "ask-sdk";
import { LambdaHandler } from "ask-sdk-core/dist/skill/factory/BaseSkillFactory";

import { LaunchRequestHandler } from "./handlers/LaunchRequestHandler";
import { AmazonCancelIntentHandler } from "./handlers/AmazonCancelIntentHandler";
import { AmazonStopIntentHandler } from "./handlers/AmazonStopIntentHandler";
import { SessionEndedHandler } from "./handlers/SessionEndedHandler";
import { CustomErrorHandler } from "./handlers/CustomErrorHandler";
import { AmazonHelpIntentHandler } from "./handlers/AmazonHelpIntentHandler";
import { QuizIntentHandler } from "./handlers/QuizIntentHandler";
import { AnswerIntentHandler } from "./handlers/AnswerIntentHandler";
import { GiveUpIntentHandler } from "./handlers/GiveUpIntentHandler";

function buildLambdaSkill(): LambdaHandler {
    const skillBuilder = SkillBuilders.standard();
    return skillBuilder
        .addRequestHandlers(
            new AmazonCancelIntentHandler(),
            new AmazonHelpIntentHandler(),
            new AmazonStopIntentHandler(),
            new AnswerIntentHandler(),
            new GiveUpIntentHandler(),
            new LaunchRequestHandler(),
            new SessionEndedHandler(),
            new QuizIntentHandler()
        )
        .addErrorHandlers(new CustomErrorHandler())
        .lambda();
}

// Lambda handler - entry point for skill
export const handler = buildLambdaSkill();