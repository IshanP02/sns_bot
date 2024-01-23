const axios = require('axios');
require('dotenv').config();
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        var otherPlayer = interaction.options.get('other-player')?.value || "";
        const trading = interaction.options.get('trading').value;
        const tradingFor = interaction.options.get('trading-for').value;
        const currentWeek = interaction.options.get('current-week').value;
        const user = await client.users.fetch(interaction.member.id);

        if ( otherPlayer == "" ) {

            const typeOfTrade = "FA";

            const FATrade = new EmbedBuilder()
            .setTitle('FA Trade')
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

            const FATradeApproved = new EmbedBuilder()
            .setTitle('FA Trade Approved')
            .setDescription(`${user.username}`)
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
                value: `${currentWeek}`,
                inline: true,
            });

            const FATradeDenied = new EmbedBuilder()
            .setTitle('FA Trade Denied')
            .setDescription(`${user.username}`)
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
                value: `${currentWeek}`,
                inline: true,
            });

            const approve = new ButtonBuilder()
                .setCustomId('approve')
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success);
    
            const deny = new ButtonBuilder()
                .setCustomId('deny')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(approve, deny);

            const adminChan = client.channels.cache.find(channel => channel.id === process.env.ADMIN_CHAN_ID);
            const tradesChan = client.channels.cache.find(channel => channel.id === process.env.TRADES_ID);
            const response = await adminChan.send({ 
                embeds: [FATrade],
                components: [row],
            });

            await interaction.reply(`FA trade requested for ${user}`);

            const collectorFilter = i => i.user.id === interaction.user.id;
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter });

            if (confirmation.customId === 'approve') {
                await tradesChan.send({
                    content: `Trade approved for: ${user}.`,
                    embeds: [FATradeApproved],
                });
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
            else if (confirmation.customId === 'deny') {
                await tradesChan.send({
                    content: `Trade denied for: ${user}.`,
                    embeds: [FATradeDenied],
                });
            }

        }
        else {
            const typeOfTrade = "P2P";

            otherUser = client.users.cache.get(`${otherPlayer}`);

            const P2PTrade = new EmbedBuilder()
            .setTitle('P2P Trade')
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

            const P2PTradeApproved = new EmbedBuilder()
            .setTitle('P2P Trade Approved')
            .setDescription(`${user.username} - ${otherUser.username}`)
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
                value: `${currentWeek}`,
                inline: true,
            });

            const P2PTradeDenied = new EmbedBuilder()
            .setTitle('P2P Trade Denied')
            .setDescription(`${user.username} - ${otherUser.username}`)
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
                value: `${currentWeek}`,
                inline: true,
            });

            const approve = new ButtonBuilder()
                .setCustomId('approve')
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success);
    
            const deny = new ButtonBuilder()
                .setCustomId('deny')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(approve, deny);

            const adminChan = client.channels.cache.find(channel => channel.id === process.env.ADMIN_CHAN_ID);
            const tradesChan = client.channels.cache.find(channel => channel.id === process.env.TRADES_ID);
            const response = await adminChan.send({ 
                embeds: [P2PTrade],
                components: [row],
            });

            await interaction.reply(`P2P Trade between ${user} and <@${otherPlayer}> requested`);

            const collectorFilter = i => i.user.id === interaction.user.id;
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter });

            if (confirmation.customId === 'approve') {

                await tradesChan.send({
                    content: `Trade between ${user} and <@${otherPlayer}> approved`,
                    embeds: [P2PTradeApproved],
                });
                axios.post(`https://sheetdb.io/api/v1/bhsilqd4lqdy7`, {
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
            else if (confirmation.customId === 'deny') {
                await tradesChan.send({
                    content: `Trade between ${user} and <@${otherPlayer}> denied`,
                    embeds: [P2PTradeDenied],
                });
            }

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