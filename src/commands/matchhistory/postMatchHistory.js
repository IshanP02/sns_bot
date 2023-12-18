require('dotenv').config();
const { ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        const replayLink = interaction.options.get('replay-link').value;
        var victor = interaction.options.get('victor').value;
        var loser = interaction.options.get('loser').value;
        const pokemonAlive = interaction.options.get('pokemon-alive').value;
        const week = interaction.options.get('week').value;
        const user = await client.users.fetch(interaction.member.id);

        var victorUser = client.users.cache.get(`${victor}`);
        var loserUser = client.users.cache.get(`${loser}`);

        var victor = `<@${victor}>`;
        var loser = `<@${loser}>`;

        const matchHistory = new EmbedBuilder()
            .setTitle('Match history post')
            .setDescription(`${user.username}`)
            .setColor('Random')
            .addFields({
                name: 'Result',
                value: `${victor} ${pokemonAlive}-0 ${loser}`,
                inline: true,
            })
            .addFields({
                name: 'Week',
                value: `${week}`,
                inline: true,
            })
            .addFields({
                name: 'Replay Link',
                value: `${replayLink}`,
                inline: false,
            });
        
        const matchHistoryChan = client.channels.cache.find(channel => channel.id === process.env.MATCH_HISTORY_ID);
        matchHistoryChan.send({ 
            embeds: [matchHistory],
        });

        axios.post(`https://sheetdb.io/api/v1/bhsilqd4lqdy7`, {
            data: {
                id: 'INCREMENT',
                replayLink: `${replayLink}`,
                victor: `${victorUser.username}`,
                loser: `${loserUser.username}`,
                pokemonAlive: `${pokemonAlive}`,
                week: `${week}`,
            }
        });

        interaction.reply(`Match between ${victor} and ${loser} recorded`);

    },

    name: 'record-match',
    description: 'Records match history',
    options: [
        {
            name: 'replay-link',
            description: 'Replay link of the battle',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'victor',
            description: 'Player who won the battle',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'loser',
            description: 'Player who lost the battle',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'pokemon-alive',
            description: 'Pokemon alive on the victor\'s side at the end of the battle ',
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: 'week',
            description: 'Week the battle took place',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ]

}