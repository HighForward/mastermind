import Game, {GAME_STATE} from './game.js'
import {MessageEmbed} from "discord.js";

export default class Mastermind
{

    constructor(gameChannel) {
        this.channel = gameChannel
        this.games = []
        this.gameCount = 0
    }

    sendHeader()
    {
        this.channel.send(":fleur_de_lis: :umbrella: :fleur_de_lis: ** MasterMind ** :fleur_de_lis: :umbrella: :fleur_de_lis:")

    }

    showRules()
    {
        const rulesEmbed = new MessageEmbed()
            .setTitle('RatusBot')
            .setDescription('**:red_circle:  :yellow_circle:     Joue à MasterMind     :green_circle:  :blue_circle:**')
            .addFields(
            {name: ':busts_in_silhouette: Jouer en multi-joueur [à venir]', value: '- /create pour créer une game\n- /start pour commencer la game (propriétaire uniquement)\n- /join [game_name] pour rejoindre une game (à venir)\n- /delete pour supprimer ou quitter la game en cours'},
                {name: ':bust_in_silhouette: Jouer seul', value: '- /play pour lancer une game'}
            )
            .setTimestamp()
            .setFooter('paypal/ratus_le_fou');

        this.channel.send({ embeds: [rulesEmbed] });
    }

    showGames()
    {
        console.log(this.games.length)
        this.games.forEach((game) => {
            this.channel.send(`Game de ${game.author.username}`)
        })
    }

    createGame(author, mastermind)
    {
        let game = this.games.find((game) => {
            return game.author.id === author.id
        })

        if (!game)
        {
            this.games.push(new Game(author, this.gameCount, mastermind))
            this.gameCount++
            this.channel.send(`:sparkles: ${author.username} a créé une game.`)
        }
        else
        {
            this.channel.send(`:warning: Tu es déjà propriétaire d'une game ${author.username}.`)
        }
    }


    startGame(author, cmd)
    {

        let game = this.games.find((game) => {return game.author.id === author.id})
        if (game && game.state === GAME_STATE.CREATING)
        {
            if (game.players.length === 1)
            {
                game.startGame(author, cmd)
                let string = `:crossed_swords: La game **#game-${game.id}-${author.username.toLowerCase()}** à commencé.`
                this.channel.send(string)
                game.gameTimeOut = setTimeout((e) => {
                    if (game.state === GAME_STATE.IN_GAME)
                    {
                        game.deleteGame(game, -1, this)
                        this.channel.send(`:hourglass: TIMEOUT **10:00**`)
                    }
                }, 600000)
            }
        }
        else if (game && game.state !== GAME_STATE.CREATING)
        {
            this.channel.send(`:warning: Tu as déjà une game en cours ${author.username}.`)
        }
        else if (!game)
        {
            this.channel.send(`:warning: Tu n'as pas de game en cours ${author.username}.`)

        }
    }
}