const axios = require('axios');
require('dotenv').config();
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const dbconnection = require('../../database/dbconnection');

module.exports = {

    callback: async (client, interaction) => {

        //if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        var otherPlayer = interaction.options.get('other-player')?.value || "";
        const trading = interaction.options.get('trading').value;
        const tradingFor = interaction.options.get('trading-for').value;
        const currentWeek = interaction.options.get('current-week').value;
        const bid = interaction.options.get('bid')?.value || 0;
        const user = await client.users.fetch(interaction.member.id);

        if ( otherPlayer == "" || !otherPlayer ) {

            const typeOfTrade = "FA";

            const [userTeam] = await dbconnection.query(
                `SELECT * FROM team WHERE user = ? AND (a1 = ? OR b1 = ? OR b2 = ? OR c1 = ? OR c2 = ? OR d1 = ? OR e1 = ? OR free1 = ? OR free2 = ? OR free3 = ?)`,
                [user, trading, trading, trading, trading, trading, trading, trading, trading, trading, trading]
            );

            if (userTeam.length === 0) {
                return interaction.reply({ content: 'You do not own the Pokemon you are trying to trade.', ephemeral: true });
            }

            const [conflictingTrade] = await dbconnection.query(
                `SELECT * FROM team WHERE a1 = ? OR b1 = ? OR b2 = ? OR c1 = ? OR c2 = ? OR d1 = ? OR e1 = ? OR free1 = ? OR free2 = ? OR free3 = ?`,
                [tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor]
            );

            if (conflictingTrade.length > 0) {
                return interaction.reply({ content: 'The Pokemon you are trading for is already owned by another team.', ephemeral: true });
            }

            await dbconnection.query(
                `INSERT INTO trade (user, otherUser, trading, tradingFor, week, status, type, bid) 
                VALUES (?, NULL, ?, ?, ?, 'pending', 'FA', ?)`,
                [user, trading, tradingFor, currentWeek, bid]
            );

            return interaction.reply({
                content: `FA trade requested for ${user}`,
                ephemeral: true
            });

        }
        else {
            const typeOfTrade = "P2P";

            otherUser = client.users.cache.get(`${otherPlayer}`);

            const [userTeam] = await dbconnection.query(
                `SELECT * FROM team WHERE user = ? AND (a1 = ? OR b1 = ? OR b2 = ? OR c1 = ? OR c2 = ? OR d1 = ? OR e1 = ? OR free1 = ? OR free2 = ? OR free3 = ?)`,
                [user, trading, trading, trading, trading, trading, trading, trading, trading, trading, trading]
            );

            if (userTeam.length === 0) {
                return interaction.reply({ content: 'You do not own the Pokemon you are trying to trade.', ephemeral: true });
            }

            const [otherUserTeam] = await dbconnection.query(
                `SELECT * FROM team WHERE user = ? AND (a1 = ? OR b1 = ? OR b2 = ? OR c1 = ? OR c2 = ? OR d1 = ? OR e1 = ? OR free1 = ? OR free2 = ? OR free3 = ?)`,
                [otherUser, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor, tradingFor]
            );

            if (otherUserTeam.length === 0) {
                return interaction.reply({ content: 'The other user does not own the Pokemon you are trying to trade for.', ephemeral: true });
            }

            await dbconnection.query(
                `INSERT INTO trade (user, otherUser, trading, tradingFor, week, status, type, bid) 
                VALUES (?, ?, ?, ?, ?, 'pending', 'P2P', NULL)`,
                [user, otherUser, trading, tradingFor, currentWeek]
            );

            await interaction.reply(`P2P Trade between ${user} and <@${otherPlayer}> requested`);

        }

    },

    name: 'make-trade',
    description: 'Post a trade request',
    options: [
        {
            name: 'trading',
            description: 'what you are trading',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'trading-for',
            description: 'what you are trading for',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'current-week',
            description: 'the week this trade is being made',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'other-player',
            description: '@ of other player involved in trade',
            type: ApplicationCommandOptionType.Mentionable,
            required: false,
        },
        {
            name: 'bid',
            description: 'the bid for the trade',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
    ],

}