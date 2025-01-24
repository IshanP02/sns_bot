const axios = require('axios');
require('dotenv').config();
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        //if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        var otherPlayer = interaction.options.get('other-player')?.value || "";
        const trading = interaction.options.get('trading').value;
        const tradingFor = interaction.options.get('trading-for').value;
        const currentWeek = interaction.options.get('current-week').value;
        const user = await client.users.fetch(interaction.member.id);

        const rows = await axios.get(`https://sheetdb.io/api/v1/bhsilqd4lqdy7?sheet=botData`);
        const rowData = rows.data;

        var tradeId = Math.max.apply(null, rowData.map(item => item.id)) + 1;

        if ( otherPlayer == "" ) {

            const typeOfTrade = "FA";

            const FATrade = new EmbedBuilder()
            .setTitle(`FA Trade - #${tradeId}`)
            .setDescription(`${user.username}`)
            .setColor('Yellow')
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

            // const FATradeDenied = new EmbedBuilder()
            // .setTitle('FA Trade Denied')
            // .setDescription(`${user.username}`)
            // .setColor('Red')
            // .addFields({
            //     name: 'Trading',
            //     value: `${trading}`,
            //     inline: true,
            // })
            // .addFields({
            //     name: 'For',
            //     value: `${tradingFor}`,
            //     inline: true,
            // })
            // .addFields({
            //     name: 'Week',
            //     value: `${currentWeek}`,
            //     inline: true,
            // });

            const adminChan = client.channels.cache.find(channel => channel.id === process.env.ADMIN_CHAN_ID);
            await adminChan.send({ 
                embeds: [FATrade]
            });

            await interaction.reply(`FA trade requested for ${user}`);

            axios.post(`https://sheetdb.io/api/v1/bhsilqd4lqdy7?sheet=botData`, {
                data: {
                    id: 'INCREMENT',
                    user1: `${user.username}`,
                    user2: 'none',
                    type: `${typeOfTrade}`,
                    trading: `${trading}`,
                    for: `${tradingFor}`,
                    currentWeek: `${currentWeek}`,
                }
            });

        }
        else {
            const typeOfTrade = "P2P";

            otherUser = client.users.cache.get(`${otherPlayer}`);

            const P2PTrade = new EmbedBuilder()
            .setTitle(`P2P Trade - #${tradeId}`)
            .setDescription(`${user.username} - ${otherUser.username}`)
            .setColor('Yellow')
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

            // const P2PTradeDenied = new EmbedBuilder()
            // .setTitle('P2P Trade Denied')
            // .setDescription(`${user.username} - ${otherUser.username}`)
            // .setColor('Red')
            // .addFields({
            //     name: 'Trading',
            //     value: `${trading}`,
            //     inline: true,
            // })
            // .addFields({
            //     name: 'For',
            //     value: `${tradingFor}`,
            //     inline: true,
            // })
            // .addFields({
            //     name: 'Week',
            //     value: `${currentWeek}`,
            //     inline: true,
            // });

            const adminChan = client.channels.cache.find(channel => channel.id === process.env.ADMIN_CHAN_ID);
            await adminChan.send({ 
                embeds: [P2PTrade]
            });

            await interaction.reply(`P2P Trade between ${user} and <@${otherPlayer}> requested`);

            axios.post(`https://sheetdb.io/api/v1/bhsilqd4lqdy7?sheet=botData`, {
                data: {
                    id: 'INCREMENT',
                    user1: `${user.username}`,
                    user2: `${otherUser.username}`,
                    type: `${typeOfTrade}`,
                    trading: `${trading}`,
                    for: `${tradingFor}`,
                    currentWeek: `${currentWeek}`,
                }
            });
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
    ],

}