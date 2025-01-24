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

            var FATradeApproved = new EmbedBuilder()
            .setTitle('FA Trade Approved')
            .setDescription(`${user1}`)
            .setColor('Green')
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
                embeds: [FATradeApproved]
            });

            await interaction.reply('Trade approved.');

        }
        else {

            const user2 = tradeData.user2;

            var P2PTradeApproved = new EmbedBuilder()
            .setTitle('P2P Trade Approved')
            .setDescription(`${user1} - ${user2}`)
            .setColor('Green')
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
                embeds: [P2PTradeApproved]
            });

            await interaction.reply('Trade approved.');

        }

    },
    name: 'approve-trade',
    description: 'approve a trade request',
    options: [
        {
            name: 'id',
            description: 'id of the trade',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],

}