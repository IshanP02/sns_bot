require('dotenv').config();
const axios = require('axios');
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });
        
        const to = interaction.options.get('user').value;
        const user = await client.users.fetch(interaction.member.id);

        try {
            const toPost = client.users.cache.get(`${to}`);

            if (!toPost) {
                interaction.reply('Invalid user provided.');
                return;
            }

            const response = await axios.post('https://sheetdb.io/api/v1/bhsilqd4lqdy7?sheet=botData', {
                data: {
                    id: 'INCREMENT',
                    subscribed: `${user.username}`,
                    to: `${toPost.username}`,
                }
            });

            interaction.reply('Subscribed successfully.');
        } catch (error) {
            console.error('Subscribe Error:', error);
            interaction.reply('An error occurred while subscribing.');
        }
    },

    name: 'subscribe',
    description: 'subscribe to a user\'s battles',
    options: [
        {
            name: 'user',
            description: 'user to subscribe to',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        }
    ]

}