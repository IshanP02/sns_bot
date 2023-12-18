require('dotenv').config();
const axios = require('axios');
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        try {
            const user = await client.users.fetch(interaction.member.id);
            const response = await axios.get('https://sheetdb.io/api/v1/bhsilqd4lqdy7');
            const rowData = response.data;

            const subscriptionsToDelete = rowData.filter(row => row.subscribed === user.username);

            if (subscriptionsToDelete.length > 0) {
                await Promise.all(subscriptionsToDelete.map(async (subscription) => {
                    try {
                        const deleteResponse = await axios.delete(`https://sheetdb.io/api/v1/bhsilqd4lqdy7/id/${subscription.id}`);
                    } catch (error) {
                        console.error('Error deleting subscription:', error);
                    }
                }));

                interaction.reply('Unsubscribed from all players.');
            } else {
                interaction.reply('No subscriptions found to remove.');
            }
        } catch (error) {
            console.error('Error:', error);
            interaction.reply('An error occurred while processing your request.');
        }
    },

    name: 'unsubscribe-all',
    description: 'subscribe all users',

}