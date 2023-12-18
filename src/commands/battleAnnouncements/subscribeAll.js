require('dotenv').config();
const axios = require('axios');
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });
        
        try {
            interaction.reply('Subscribing to all players...');
            
            const user = await client.users.fetch(interaction.member.id);
    
            await interaction.guild.members.fetch();
            const role = interaction.guild.roles.cache.find(role => role.name === "Players");
            const allPlayers = role.members.map(m => m.id);
    
            const subscribedSet = new Set();
    
            const concurrency = 5;
            const chunks = [];
            for (let i = 0; i < allPlayers.length; i += concurrency) {
                chunks.push(allPlayers.slice(i, i + concurrency));
            }
    
            const subscribePromises = chunks.map(async chunk => {
                const promises = chunk.map(async playerID => {
                    try {
                        const player = await client.users.fetch(playerID);
                        console.log('Fetched player:', player.username);
    
                        const uniqueID = Date.now().toString();
                        if (!subscribedSet.has(uniqueID)) {
                            const response = await axios.post('https://sheetdb.io/api/v1/bhsilqd4lqdy7', {
                                data: {
                                    id: uniqueID,
                                    subscribed: user.username,
                                    to: player.username,
                                }
                            });
                            console.log('Subscription successful:', response.data);
                            
                            subscribedSet.add(uniqueID);
    
                            return response;
                        } else {
                            console.log('Duplicate ID:', uniqueID);
                        }
                    } catch (error) {
                        console.error('Error subscribing to player:', error);
                        return { error };
                    }
                });
                return Promise.allSettled(promises);
            });
    
            await Promise.all(subscribePromises);
            console.log('Subscribed to all players.');
    
            interaction.followUp('Subscribed to all players.');
        } catch (error) {
            console.error('Error:', error);
        }
    },
    name: 'subscribe-all',
    description: 'subscribe all users',

}