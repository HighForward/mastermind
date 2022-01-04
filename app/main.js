import Mastermind from "./class/mastermind.js";

import { Client, Intents, MessageEmbed } from 'discord.js'
import {GAME_STATE} from "./class/game.js";


export const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})
const GAME_CHANNEL_ID = "904214170310967296"

let mastermind = null


client.login('')

client.once('ready',() => {

    const channelGame = client.channels.cache.get(GAME_CHANNEL_ID)
    mastermind = new Mastermind(channelGame)

    mastermind.sendHeader()
    mastermind.showRules()

    client.on('messageCreate', async (cmd) => {

        if (cmd.content === '/create' && cmd.channelId === GAME_CHANNEL_ID)
        {
            mastermind.createGame(cmd.author, mastermind)
        }

        if (cmd.content === '/games' && cmd.channelId === GAME_CHANNEL_ID)
        {
            mastermind.showGames()
        }

        if (cmd.content === '/start' && cmd.channelId === GAME_CHANNEL_ID)
        {
            mastermind.startGame(cmd.author, cmd)
        }

        if (cmd.content === '/play' && cmd.channelId === GAME_CHANNEL_ID)
        {
            mastermind.createGame(cmd.author, mastermind)
            mastermind.startGame(cmd.author, cmd)
        }

        if (cmd.content === '/delete' && cmd.channelId === GAME_CHANNEL_ID)
        {
            let index = mastermind.games.findIndex((game) => {return cmd.author.id === game.author.id})
            let game = null
            if (index !== 1)
                game = mastermind.games.at(index)

            if (game)
                game.deleteGame(game, index, mastermind)

            if (!game)
                mastermind.channel.send(`:warning: Tu n'es pas propriétaire d'une game ${cmd.author.username}.`)
        }
    })

    client.on('interactionCreate', async (interaction) => {
        if (interaction.isButton())
        {
            let game = mastermind.games.find((game) => {return game.channel.id === interaction.channelId })

            if (game)
            {
                await game.receivePlays(interaction.customId, interaction.user, interaction, mastermind)
            }

        }
    })

})