require('dotenv').config();
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const dbconnection = require('../../database/dbconnection');

module.exports = {
    callback: async (client, interaction) => {
        try {
            const [trades] = await dbconnection.query(
                `SELECT id, user, otherUser, trading, tradingFor, week, type FROM trade WHERE status = 'pending' ORDER BY id ASC`
            );

            if (trades.length === 0) {
                return interaction.reply({ content: 'No pending trades found.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Pending Trades')
                .setColor('Yellow')
                .setDescription('Here are all the currently pending trades.')
                .setFooter({ text: `Total Pending Trades: ${trades.length}` });

            let tradeList = '';

            trades.forEach((trade) => {
                tradeList += `**ID:** ${trade.id} | **User:** <@${trade.user}> ${trade.otherUser ? `↔ <@${trade.otherUser}>` : ''}\n`;
                tradeList += `📌 **Trading:** ${trade.trading} → ${trade.tradingFor} | **Week:** ${trade.week} | **Type:** ${trade.type}\n\n`;
            });

            embed.setDescription(tradeList);

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching pending trades:', error);
            return interaction.reply({ content: 'An error occurred while fetching pending trades.', ephemeral: true });
        }
    },

    name: 'pending-trades',
    description: 'Displays all pending trades in a table format',
};