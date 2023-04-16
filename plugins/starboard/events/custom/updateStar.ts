import { Client } from 'discordx'
import { injectable } from 'tsyringe'
import { Loaded } from "@mikro-orm/core"
import { MessageReaction, PartialMessageReaction, TextChannel } from "discord.js"

import { Database } from '@services'
import { Discord, OnCustom } from '@decorators'
import { StarBoard, StarBoardMessage } from '../../entities'

@Discord()
@injectable()
export default class updateStarEvent {

    constructor(
        private client: Client,
        private db: Database,  
    ) {}

    @OnCustom('updateStar')
    async updateStarHandler(
        starMessage: Loaded<StarBoardMessage, never>,
        reaction: MessageReaction | PartialMessageReaction,
        chanStars: Loaded<StarBoard, never>
    ) {
        const starboardRepo = this.db.get(StarBoard)
        const starMessageRepo = this.db.get(StarBoardMessage)

        const guild = await this.client.guilds.fetch(chanStars.guildId)
        const channel = await guild.channels.fetch(starMessage.starboardChannel ?? chanStars.channelId) as TextChannel
        const message = await channel.messages.fetch(starMessage.starboardMessage)

        if(starMessage.starboardChannel && starMessage.starboardChannel !== chanStars.channelId) {
            const newChannel = await guild.channels.fetch(chanStars.channelId) as TextChannel

            const newMessage = await newChannel.send({
                content: reaction.emoji.toString() + " " + reaction.message.reactions.cache.get(chanStars.emoji)!.count + " | " + reaction.message.channel.toString(),
                embeds: [message.embeds[0]]
            })

            starMessage.starCount = reaction.message.reactions.cache.get(chanStars.emoji)!.count
            starMessage.starboardMessage = newMessage.id
            starMessage.starboardChannel = undefined
        } else {
            await message.edit({
                content: reaction.emoji.toString() + " " + reaction.message.reactions.cache.get(chanStars.emoji)!.count + " | " + reaction.message.channel.toString(),
                embeds: [message.embeds[0]]
            })
    
            starMessage.starCount = reaction.message.reactions.cache.get(chanStars.emoji)!.count
        }

        await starMessageRepo.persistAndFlush(starMessage)
        this.db.em.clearCache("star_message_" + reaction.message.id)
    }

}