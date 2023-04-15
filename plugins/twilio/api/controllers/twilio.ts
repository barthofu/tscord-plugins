import { Context, Controller, PlatformContext, Post, UseBefore } from "@tsed/common"
import { BaseController } from "@utils/classes"
import bodyParser from "body-parser"
import { injectable } from "tsyringe"
import { webhook as TwilioWebhook } from 'twilio'
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse'
import { twilioConfig } from "../../configs"
import { Twilio } from "../../services"
import { resolveDependency } from "@utils/functions"

@Controller('/twilio')
@injectable()
export class TwilioController extends BaseController {

    private twilio: Twilio

    constructor() {
        super()

        resolveDependency(Twilio).then(twilio => this.twilio = twilio)
    }


    @Post('/sms')
    @UseBefore(TwilioWebhook( { validate: twilioConfig.apiValidateSource } ))
    async status(@Context() { request }: PlatformContext) {

        this.twilio.emit("sms", {
            messageSid: request.body.MessageSid,
            smsSid: request.body.SmsSid,
            accountSid: request.body.AccountSid,
            messagingServiceSid: request.body.MessagingServiceSid,
            body: request.body.Body,
            from: request.body.From,
            to: request.body.To,
            geo: {
                from: {
                    country: request.body.FromCountry,
                    state: request.body.FromState,
                    city: request.body.FromCity,
                    zip: request.body.FromZip,
                },
                to: {
                    country: request.body.ToCountry,
                    state: request.body.ToState,
                    city: request.body.ToCity,
                    zip: request.body.ToZip,
                }
            },
            apiVersion: request.body.ApiVersion
        })

        return new MessagingResponse()
    }
}