const axios = require('axios');
require('dotenv').config();
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        var id = interaction.options.get('id').value;

        const [tradeData] = await dbconnection.query(
            `SELECT * FROM trade WHERE id = ?`, 
            [id]
        );

        if (tradeData.length === 0) {
            return interaction.reply({ content: 'Trade not found.', ephemeral: true });
        }

        const trade = tradeData[0];
        const { type, user, otherUser, trading, tradingFor, week } = trade;

        var tradesChan = client.channels.cache.find(channel => channel.id === process.env.TRADES_ID);

        async function swapPokemon(userId, oldPokemon, newPokemon) {
            const [teamData] = await dbconnection.query(
                `SELECT * FROM team WHERE user = ?`,
                [userId]
            );

            if (teamData.length === 0) return false;

            let team = teamData[0];
            let updateFields = [];

            for (let key of Object.keys(team)) {
                if (team[key] === oldPokemon) {
                    updateFields.push({ key, value: newPokemon });
                }
            }

            if (updateFields.length === 0) return false;

            await dbconnection.query(
                `UPDATE team SET ${updateFields.join(', ')} WHERE user = ?`,
                [userId]
            );

            return true;
        }

        if (type == 'FA') {

            const success = await swapPokemon(user, trading, tradingFor);

            if (!success) {
                return interaction.reply({ content: 'Error: Pokémon not found in user’s team.', ephemeral: true });
            }

            var FATradeApproved = new EmbedBuilder()
            .setTitle('FA Trade Approved')
            .setDescription(`${user}`)
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
                value: `${week}`,
                inline: true,
            });

            await tradesChan.send({
                embeds: [FATradeApproved]
            });

        }
        else {

            const userSuccess = await swapPokemon(user, trading, tradingFor);
            const otherUserSuccess = await swapPokemon(otherUser, tradingFor, trading);

            if (!userSuccess || !otherUserSuccess) {
                return interaction.reply({ content: 'Error: One or both Pokémon not found in teams.', ephemeral: true });
            }

            var P2PTradeApproved = new EmbedBuilder()
            .setTitle('P2P Trade Approved')
            .setDescription(`${user} - ${otherUser}`)
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
                value: `${week}`,
                inline: true,
            });

            await tradesChan.send({
                embeds: [P2PTradeApproved]
            });

        }

        await dbconnection.promise().query(
            `UPDATE trade SET status = 'approved' WHERE id = ?`,
            [id]
        );

        await interaction.reply('Trade approved.');

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