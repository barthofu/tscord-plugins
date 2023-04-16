import { Client} from 'discordx'
import { SlashGroup, SlashOption } from '@decorators'
import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, Channel } from 'discord.js'
import { StarBoard, StarBoardMessage } from '../entities'
import { Discord, Slash } from '@decorators'
import { Guard, UserPermissions } from '@guards'
import { injectable } from "tsyringe"
import { Database } from '@services'
import { wrap, assign } from "@mikro-orm/core"


@Discord()
@injectable()
@Category('Admin')
@SlashGroup({name: 'stars', localizationSource: 'StarBoard.STARBOARD.STAR_DESC'})
@SlashGroup('stars')
export default class StarsCommand {

	constructor(
        private db: Database
    ) {}


	@Slash({
		name: "set",
		localizationSource: 'StarBoard.STARBOARD.STAR_DESC',
	})
	@Guard(
		UserPermissions(['Administrator'])
	)
	async set(
		@SlashOption({
			name: "channel",
			localizationSource: 'StarBoard.STARBOARD.STAR_SET_CHAN',
			required: false,
			type: ApplicationCommandOptionType.Channel
		})
		channel: Channel,

		@SlashOption({
			name: "emoji",
			localizationSource: 'StarBoard.STARBOARD.STAR_SET_EMOJI',
			required: false,
			type: ApplicationCommandOptionType.String
		})
		emoji: string,

		@SlashOption({
			name: "minstar",
			localizationSource: 'StarBoard.STARBOARD.STAR_MIN_EMOJI',
			required: false,
			type: ApplicationCommandOptionType.Integer

		})
		minStar: number,

		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		// Verifications
		if(!interaction.guildId) return interaction.followUp({ content: localize.StarBoard.STARBOARD.STAR_ERR_GUILD.MESSAGE(), ephemeral: true });
		if(!channel && !emoji && !minStar) return interaction.followUp({ content: localize.StarBoard.STARBOARD.STAR_ERR_PARAM.MESSAGE(), ephemeral: true });

		// parse emoji
		if(emoji) {
			const parsed = /^<a?:[A-z]+:([0-9]+)>$/.exec(emoji.trim());
			if(parsed && parsed.length === 2) emoji = parsed[1];
			else {
				if(/^\p{Extended_Pictographic}$/u.test(emoji.trim())) emoji = emoji.trim()
				else interaction.followUp({ content: localize.StarBoard.STARBOARD.STAR_ERR_EMOJI.MESSAGE(), ephemeral: true });
			}
		}

		// Fetch current config
		const starRepo = this.db.get(StarBoard)
		const starMessage = this.db.get(StarBoardMessage)
		const chanStars = await starRepo.findOne({ guildId: interaction.guildId })

		// If no config :
		if(!chanStars) {
			// If only emoji is provided :
			if(!channel) return interaction.followUp({content: localize.StarBoard.STARBOARD.STAR_SLC_CHAN.MESSAGE(), ephemeral: true });

			let starboard = new StarBoard()
			starboard.guildId = interaction.guildId
			starboard.channelId = channel.id
			if(emoji) starboard.emoji = emoji
			if(minStar) starboard.minStar = minStar

			await starRepo.persistAndFlush(starboard)
			this.db.em.clearCache("star_guild_" + interaction.guildId)
			await interaction.followUp({
				content: localize.StarBoard.STARBOARD.STAR_CHAN_SET.MESSAGE(),
				ephemeral: true
			})
		} else {
			// Update all previous starred messages
			let previousMessages = await starMessage.find({ starboard: chanStars, starboardChannel: null })
			if(previousMessages && previousMessages.length > 0) {
				await starMessage.persistAndFlush(
					previousMessages.map(el => wrap(el).assign({ starboardChannel: chanStars.channelId }))
				)
			}

			// Update the starboard
			if(emoji) chanStars.emoji = emoji
			if(minStar) chanStars.minStar = minStar
			if(channel) chanStars.channelId = channel.id

			await starRepo.persistAndFlush(chanStars)
			this.db.em.clearCache("star_guild_" + interaction.guildId)
			await interaction.followUp({
				content: localize.StarBoard.STARBOARD.STAR_CFG_UPDATED.MESSAGE(),
				ephemeral: true
			})
		}
	}
}