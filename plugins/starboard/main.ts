import { clientConfig } from "../../client"
import { GatewayIntentBits, Partials } from "discord.js"

// Check partials
if(!clientConfig.partials.includes(Partials.Channel)) throw new Error("You must enable the Channel partial to use this plugin !")
if(!clientConfig.partials.includes(Partials.Message)) throw new Error("You must enable the Message partial to use this plugin !")
if(!clientConfig.partials.includes(Partials.Reaction)) throw new Error("You must enable the Reaction partial to use this plugin !")

// Check intents
if(!clientConfig.intents.includes(GatewayIntentBits.GuildMessages)) throw new Error("You must enable the GuildMessages intent to use this plugin !")
if(!clientConfig.intents.includes(GatewayIntentBits.MessageContent)) throw new Error("You must enable the MessageContent intent to use this plugin !")
if(!clientConfig.intents.includes(GatewayIntentBits.GuildMessageReactions)) throw new Error("You must enable the GuildMessageReactions intent to use this plugin !")
