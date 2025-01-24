const axios = require('axios');
require('dotenv').config();
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        var id = interaction.options.get('id').value;

        var rows = await axios.get(`https://sheetdb.io/api/v1/bhsilqd4lqdy7?sheet=botData`);
        var rowData = rows.data;

        var tradeData = rowData.find(row => row.id == id);

        var type = tradeData.type;
        var user1 = tradeData.user1;
        var trading = tradeData.trading;
        var tradingFor = tradeData.for;
        var currentWeek = tradeData.currentWeek;

        var tradesChan = client.channels.cache.find(channel => channel.id === process.env.TRADES_ID);

        if (type == 'FA') {

            var FATradeDenied = new EmbedBuilder()
            .setTitle('FA Trade Denied')
            .setDescription(`${user1}`)
            .setColor('Red')
            .addFields({
                name: 'Trading',
                value: `${trading}`,
                inline: true,
            })
            .addFields({
                name: 'For',
                value: `${tradingFor}`,
                inline: true,
            })
            .addFields({
                name: 'Week',
                value: `${currentWeek}`,
                inline: true,
            });

            await tradesChan.send({
                embeds: [FATradeDenied]
            });

            await interaction.reply('Trade denied.');

        }
        else {

            var user2 = tradeData.user2;

            var P2PTradeDenied = new EmbedBuilder()
            .setTitle('P2P Trade Denied')
            .setDescription(`${user1} - ${user2}`)
            .setColor('Red')
            .addFields({
                name: 'Trading',
                value: `${trading}`,
                inline: true,
            })
            .addFields({
                name: 'For',
                value: `${tradingFor}`,
                inline: true,
            })
            .addFields({
                name: 'Week',
                value: `${currentWeek}`,
                inline: true,
            });

            await tradesChan.send({
                embeds: [P2PTradeDenied]
            });

            await interaction.reply('Trade denied.');

        }

    },
    name: 'deny-trade',
    description: 'deny a trade request',
    options: [
        {
            name: 'id',
            description: 'id of the trade',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],

}