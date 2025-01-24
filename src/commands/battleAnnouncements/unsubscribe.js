require('dotenv').config();
const axios = require('axios');
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        //if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        var to = interaction.options.get('user').value;
        var user = await client.users.fetch(interaction.member.id);
        var toPost = client.users.cache.get(`${to}`);

        const response = await axios.get(`https://sheetdb.io/api/v1/bhsilqd4lqdy7?sheet=botData`);

        const rowData = response.data;
        const rowToDelete = rowData.find(row => row.subscribed === user.username && row.to === toPost.username);

        if (rowToDelete) {
            try {
                const rowIdToDelete = rowToDelete.id;
                const deleteResponse = await axios.delete(`https://sheetdb.io/api/v1/bhsilqd4lqdy7/id/${rowIdToDelete}?sheet=botData`);
                interaction.reply('Unsubscribed successfully.');
            } catch (error) {
                console.error('Error:', error);
                interaction.reply('An error occurred while unsubscribing.');
            }
        } else {
            interaction.reply('No subscription found to remove.');
        }

    },

    name: 'unsubscribe',
    description: 'subscribe to a user\'s battles',
    options: [
        {
            name: 'user',
            description: 'user to unsubscribe to',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        }
    ]

}