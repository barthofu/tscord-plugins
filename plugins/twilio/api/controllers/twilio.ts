import { Post, JsonController, UseBefore, Req } from "routing-controllers"
import { Request } from 'express'
import { injectable } from "tsyringe"
import { webhook as TwilioWebhook } from 'twilio'
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse'
import bodyParser from "body-parser"

import { BaseController } from "@utils/classes"
import { Twilio } from "../../services"
import { twilioConfig } from "../../config"

@JsonController('/twilio')
@UseBefore(bodyParser.urlencoded({ extended: false }))
@injectable()
export class TwilioController extends BaseController {

    constructor(
        private twilio: Twilio
    ){
        super()
    }

    @Post("/sms")
    @UseBefore(TwilioWebhook( { validate: twilioConfig.apiValidateSource } ))
    async status(@Req() req: Request) {
        this.twilio.emit("sms", {
            messageSid: req.body.MessageSid,
            smsSid: req.body.SmsSid,
            accountSid: req.body.AccountSid,
            messagingServiceSid: req.body.MessagingServiceSid,
            body: req.body.Body,
            from: req.body.From,
            to: req.body.To,
            geo: {
                from: {
                    country: req.body.FromCountry,
                    state: req.body.FromState,
                    city: req.body.FromCity,
                    zip: req.body.FromZip,
                },
                to: {
                    country: req.body.ToCountry,
                    state: req.body.ToState,
                    city: req.body.ToCity,
                    zip: req.body.ToZip,
                }
            },
            apiVersion: req.body.ApiVersion
        })

        return new MessagingResponse();
    }
}