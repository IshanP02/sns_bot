require('dotenv').config();
const axios = require('axios');
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        const opponent = interaction.options.get('opponent').value;
        const link = interaction.options.get('link').value;
        const week = interaction.options.get('week').value;
        const user = await client.users.fetch(interaction.member.id);
        otherUser = client.users.cache.get(`${opponent}`);

        const announcement = new EmbedBuilder()
        .setTitle('Live game!')
        .setDescription(`${user.username}`)
        .setColor('Random')
        .addFields({
            name: 'Matchup',
            value: `${user} vs ${otherUser}`,
            inline: true,
        })
        .addFields({
            name: 'Week',
            value: `${week}`,
            inline: true,
        })
        .addFields({
            name: 'Link',
            value: `${link}`,
            inline: false,
        });

        const responseData = await axios.get('https://sheetdb.io/api/v1/bhsilqd4lqdy7?sheet=botData');
        const rowData = responseData.data;
        
        const userSubscriptions = rowData.filter(row => row.to === user.username);
        const otherUserSubscriptions = rowData.filter(row => row.to === otherUser.username);
        
        const mentionedUsers = new Set();

        const getUserIDByUsername = (username) => {
            const user = client.users.cache.find(user => user.username === username);
            return user ? user.id : null;
        };

        userSubscriptions.forEach(sub => {
            const userID = getUserIDByUsername(sub.subscribed);
            if (userID) {
                mentionedUsers.add(userID);
            }
        });

        otherUserSubscriptions.forEach(sub => {
            const userID = getUserIDByUsername(sub.subscribed);
            if (userID) {
                mentionedUsers.add(userID);
            }
        });

        const mentionedUsersList = Array.from(mentionedUsers).map(userID => `<@${userID}>`).join(' ');


        const liveGamesChan = client.channels.cache.find(channel => channel.id === process.env.LIVE_GAMES_ID);

        const response = await liveGamesChan.send({
            content: `${mentionedUsersList}`,
            embeds: [announcement],
        });

        interaction.reply(`Live game posted, good luck!`);

    },

    name: 'live-game',
    description: 'announce your battle',
    options: [
        {
            name: 'opponent',
            description: 'person you are battling',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'link',
            description: 'link to watch the battle',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'week',
            description: 'week the battle is taking place',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ]

}