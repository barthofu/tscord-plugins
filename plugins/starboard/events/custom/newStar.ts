import dayjs from 'dayjs'
import { Client } from 'discordx'
import { injectable } from 'tsyringe'
import { Loaded } from "@mikro-orm/core"
import { ButtonBuilder, ButtonStyle, EmbedBuilder, MessageReaction, PartialMessageReaction, TextChannel } from 'discord.js'

import { Discord, OnCustom } from '@decorators'
import { Database } from '@services'
import { StarBoard, StarBoardMessage } from '../../entities'

@Discord()
@injectable()
export default class newStarEvent {

    constructor(
        private client: Client,
        private db: Database,  
    ) {}

    @OnCustom('newStar')
    async newStarHandler(
        starMessage: Loaded<StarBoardMessage, never>,
        reaction: MessageReaction | PartialMessageReaction,
        chanStars: Loaded<StarBoard, never>
    ) {
        const starboardRepo = this.db.get(StarBoard)
        const starMessageRepo = this.db.get(StarBoardMessage)


        // define image
        let image = ""
        if (reaction.message.attachments.size > 0) {
            image = reaction.message.attachments.first()!.url
        }

        //checks if the message has an image
        if (reaction.message.embeds.length > 0) {
            if (reaction.message.embeds[0].image) {
                image = reaction.message.embeds[0].image.url
            }
        }

        let embed = new EmbedBuilder()
            .setAuthor({
                name: reaction.message.author!.username + "#" + reaction.message.author!.discriminator,
                iconURL: reaction.message.author!.avatarURL()!
            })
            .setColor("#FFD700")
            .setFooter({
                text: dayjs(reaction.message.createdAt).format("DD/MM/YYYY HH:mm"),
            })
        
        // Adds an image if there is one
        if(image) embed = embed.setImage(image)

        // Adds the message content if there is one
        if(reaction.message.content) embed = embed.setDescription(reaction.message.content)

        const btn = new ButtonBuilder()
            .setLabel("Original Message")
            .setStyle(ButtonStyle.Link)
            .setURL(reaction.message.url)

        // TODO : Fix with discord.js update 
        // const row = new ActionRowBuilder().addComponents(btn)
        
        const guild = await this.client.guilds.fetch(chanStars.guildId)
        const channel = await guild.channels.fetch(chanStars.channelId) as TextChannel

        const newStarMessageDiscord = await channel.send({
            content: reaction.emoji.toString() + " " + reaction.message.reactions.cache.get(chanStars.emoji)!.count + " | " + reaction.message.channel.toString(),
            embeds: [embed],
            components: [{
                type: 1,
                components: [
                    btn
                ]
            }]
        })

        let newStarMessage = new StarBoardMessage()
        newStarMessage.srcMessage = reaction.message.id
        newStarMessage.starboardMessage = newStarMessageDiscord.id
        newStarMessage.starCount = reaction.message.reactions.cache.get(chanStars.emoji)!.count
        newStarMessage.starboard = chanStars
        await starMessageRepo.persistAndFlush(newStarMessage)
        this.db.em.clearCache("star_message_" + reaction.message.id)
    }
}