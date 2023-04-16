import { injectable } from "tsyringe";
import { Client, ArgsOf } from "discordx"

import { Discord, On } from "@decorators"
import { Database, EventManager } from "@services"
import { resolveDependency } from "@utils/functions"
import { StarBoard, StarBoardMessage } from "../entities"

@Discord()
@injectable()
export default class messageReactionAddEvent {

    constructor(
        private eventManager: EventManager
    ) { }

    @On('messageReactionAdd')
    async messageReactionAddHandler(
        [reaction, user]: ArgsOf<"messageReactionAdd">,
        client: Client
    ) {

        // Using partial to get older messages
        if (reaction.message.partial) await reaction.message.fetch()
        // Resolve entities repository
        const db = await resolveDependency(Database)
        const starboardRepo = db.get(StarBoard)
        const starMessageRepo = db.get(StarBoardMessage)
        // Check if GuildId exists in the DB
        const chanStars = await starboardRepo.findOne({ guildId: reaction.message.guildId }, { cache: ["star_guild_" + reaction.message.guildId, 60_1000] }) // 1 minute
        if (!chanStars) return
        // Check if starred message is in the starboard channel
        if (chanStars && chanStars.channelId === reaction.message.channelId) return
        // If the reaction is different than the guild emoji, then return.
        if ((reaction.emoji.id ?? reaction.emoji.toString()) !== chanStars.emoji) return
        // Set the minimum reactions needed
        if (reaction.message.reactions.cache.get(chanStars.emoji)!.count < chanStars.minStar) return
        // Check if the message is already in the StarBoard channel
        const starMessage = await starMessageRepo.findOne({ srcMessage: reaction.message.id }, { cache: ["star_message_" + reaction.message.id, 60_1000] }) // 1 minute
        // If the message is not in the StarBoard channel, then create a new one
        if (!starMessage) {
            this.eventManager.emit("newStar", starMessage, reaction, chanStars)
        }

        // If the message is in the StarBoard channel and the count changed, then update it
        else if (starMessage.starCount < reaction.message.reactions.cache.get(chanStars.emoji)!.count) {
            this.eventManager.emit("updateStar", starMessage, reaction, chanStars)
        }
    }
}