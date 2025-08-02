const axios = require('axios');
require('dotenv').config();
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        var id = interaction.options.get('id').value;

        const [tradeData] = await dbconnection.promise().query(
            `SELECT * FROM trade WHERE id = ?`, 
            [id]
        );

        if (tradeData.length === 0) {
            return interaction.reply({ content: 'Trade not found.', ephemeral: true });
        }

        const trade = tradeData[0];
        const { type, user, otherUser, trading, tradingFor, week } = trade;

        var tradesChan = client.channels.cache.find(channel => channel.id === process.env.TRADES_ID);

        if (type == 'FA') {

            var FATradeDenied = new EmbedBuilder()
            .setTitle('FA Trade Denied')
            .setDescription(`${user}`)
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
                value: `${week}`,
                inline: true,
            });

            await tradesChan.send({
                embeds: [FATradeDenied]
            });

        }
        else {

            var user2 = tradeData.user2;

            var P2PTradeDenied = new EmbedBuilder()
            .setTitle('P2P Trade Denied')
            .setDescription(`${user} - ${otherUser}`)
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
                value: `${week}`,
                inline: true,
            });

            await tradesChan.send({
                embeds: [P2PTradeDenied]
            });

        }

        await interaction.reply('Trade denied.');

        await dbconnection.promise().query(
            `UPDATE trade SET status = 'denied' WHERE id = ?`,
            [id]
        );

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