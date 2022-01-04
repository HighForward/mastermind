import {MessageActionRow, MessageButton, Permissions} from "discord.js";
import {client} from "../main.js";

export const GAME_STATE = {
    CREATING: "CREATING",
    IN_GAME: "IN_GAME"
}

const COLORS = {
    RED: ':red_circle:',
    BLUE: ':blue_circle:',
    YELLOW: ':yellow_circle:',
    GREEN: ':green_circle:'
}


export default class Game
{
    constructor(author, id) {
        this.author = author
        this.players = [author]
        this.state = GAME_STATE.CREATING
        this.patern = []
        this.currentGame = []

        this.channel = null
        this.id = id
        this.gameTry = 0
        this.gameTimeOut = 0
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    deleteGame(game, index_interaction, mastermind, win = false)
    {
        let string = `:put_litter_in_its_place: **#game-${game.id}-${game.author.username.toLowerCase()}** à été supprimé.`
        if (game.state === GAME_STATE.IN_GAME && game.channel) {
            game.channel.delete()
        }

        let index

        if (index_interaction !== -1)
            index =  index_interaction
        else
            index = mastermind.games.findIndex((g) => { return (g.author.id === game.author.id)})

        console.log(index)
        if (index !== -1)
        {
            mastermind.gameCount--

            delete mastermind.games.at(index)
            mastermind.games.splice(index, 1)
            if (!win)
                mastermind.channel.send(string)
        }
    }

    generateMasterMind()
    {
        for (let i = 0; i < 4; i++)
        {
            let random_number = this.getRandomInt(0, 3)
            this.patern.push(Object.values(COLORS)[random_number])
        }
        console.log('####',this.patern,'####')
    }

    async ComparePatern(interaction, userMoves, mastermind) {
        let result = ""
        let win_point = 0
        // console.log('usermove.length', userMoves.length)

        for (let i = 0; i < userMoves.length; i++) {
            console.log('passage loop:', i, userMoves[i], this.patern[i])
            if (userMoves[i] === this.patern[i]) {
                result += ':white_check_mark:'
                win_point++;
            } else
                result += ':octagonal_sign:'
        }

        this.gameTry++

        if (win_point === 4) {
            await interaction.reply(`:woman_raising_hand: ${result} **YOU WON**`)
            this.channel.send(':warning: Le channel va être supprimer dans 3 sec.')

            clearTimeout(this.gameTimeOut)

            await setTimeout(async (e) => {
                this.deleteGame(this, -1, mastermind, true)
                let msg = await mastermind.channel.send(`:trophy: **${this.author.username}** à remporter une game en **${this.gameTry} coups**.`)
                await msg.react('👍');
                await msg.react('👎');
                // console.log(msg)
            }, 3000)

            // this.deleteGame(this, -1, mastermind)
        } else if (win_point < 4) {
            await interaction.reply(`:woman_gesturing_no: ${result} - **TRY AGAIN**`)
        }
    }

    async receivePlays(custom_id, user, interaction, mastermind)
    {
        let substring = ['red', 'green', 'blue', 'yellow']
        let substring_color = [COLORS.RED, COLORS.GREEN, COLORS.BLUE, COLORS.YELLOW]

        let sub = substring.find((item) => {
            if (custom_id.includes(item))
                return item
        })

        let userGame = this.currentGame.find((u) => { return u.play === true })
        if (userGame.user.id === user.id )
        {
            let index = substring_color.findIndex((s) => { return s === `:${sub}_circle:`} )
            // console.log(sub, index)
            userGame.moves.push(substring_color.at(index))
            // console.log(userGame.moves)
            if (userGame.moves.length < 4)
            {
                await interaction.reply(':raccoon: :speech_balloon: Ratus réfléchit')
                await interaction.deleteReply()
            }
            else if (userGame.moves.length === 4)
            {
                await this.ComparePatern(interaction, userGame.moves, mastermind)
                userGame.moves = []
            }
        }
        else
        {
            interaction.reply({ content: `:no_entry: Ce n'est pas à toi de jouer.`, ephemeral: true })
        }

    }

    sendButton()
    {
        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId(`red-${this.id}`).setLabel(``).setStyle('SECONDARY').setEmoji('🔴'),
            new MessageButton().setCustomId(`green-${this.id}`).setLabel('').setStyle('SECONDARY').setEmoji('🟢'),
            new MessageButton().setCustomId(`blue-${this.id}`).setLabel('').setStyle('SECONDARY').setEmoji('🔵'),
            new MessageButton().setCustomId(`yellow-${this.id}`).setLabel('').setStyle('SECONDARY').setEmoji('🟡')
        )

        this.channel.send({ content: `:brain: Trouve la bonne combinaison pour gagner`, components: [row]})
    }

    gameLoop()
    {
        if (this.patern.length === 0)
            this.generateMasterMind()

        let string_ping = ""

        this.players.forEach((user) => {
            if (string_ping.length)
                string_ping += ' '
            string_ping += user.toString()
            this.currentGame.push({user: user, moves: [], play: false})
        })

        this.currentGame[0].play = true

        this.channel.send(`:loudspeaker: ${string_ping} La game a commencé.\n`)

        this.sendButton()

    }

    async startGame(author, cmd) {
        if (this.state === GAME_STATE.CREATING) {


            const category = client.channels.cache.get('904211959610753056')
            // console.log(category)

            this.channel = await cmd.guild.channels.create(`game-${this.id}-${author.username}`, {
                type: 'text',
                parent: category,
                permissionOverwrites: [
                    {
                        id: author.id, //To make it be seen by a certain role, user an ID instead
                        allow: [Permissions.FLAGS.SEND_MESSAGES], //Allow permissions
                    },
                    {
                        id: cmd.guild.id,
                        deny: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.START_EMBEDDED_ACTIVITIES]
                    }

                ],
            })

            if (this.channel) {
                this.state = GAME_STATE.IN_GAME
                this.gameLoop()
            }
            return true
        }
        else
            return false
    }
}