require('dotenv').config();
const axios = require('axios');
const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        const week = interaction.options.get('week').value;
        const reason = interaction.options.get('reason').value;
        const length = interaction.options.get('length')?.value || "Default 3 days";
        const user = await client.users.fetch(interaction.member.id);

        const request = new EmbedBuilder()
            .setTitle('Extension request')
            .setDescription(`${user.username}`)
            .setColor('Yellow')
            .addFields({
                name: 'Week',
                value: `${week}`,
                inline: true,
            })
            .addFields({
                name: 'Length',
                value: `${length}`,
                inline: true,
            })
            .addFields({
                name: 'Reason',
                value: `${reason}`,
                inline: false,
            });

        const granted = new EmbedBuilder()
            .setTitle('Extension granted')
            .setDescription(`${user.username}`)
            .setColor('Green')
            .addFields({
                name: 'Week',
                value: `${week}`,
                inline: true,
            })
            .addFields({
                name: 'Length',
                value: `${length}`,
                inline: true,
            });

        const denied = new EmbedBuilder()
            .setTitle('Extension denied')
            .setDescription(`${user.username}`)
            .setColor('Red')
            .addFields({
                name: 'Week',
                value: `${week}`,
                inline: true,
            })
            .addFields({
                name: 'Length',
                value: `${length}`,
                inline: true,
            });

        const grant = new ButtonBuilder()
            .setCustomId('grant')
            .setLabel('Grant extension')
            .setStyle(ButtonStyle.Success);
        
        const deny = new ButtonBuilder()
            .setCustomId('deny')
            .setLabel('Deny extension')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(grant, deny);

        const adminChan = client.channels.cache.find(channel => channel.id === process.env.ADMIN_CHAN_ID);
        const response = await adminChan.send({ 
            embeds: [request], 
            components: [row],
        });

        await interaction.reply("Extension requested...")

        const collectorFilter = i => i.user.id === interaction.user.id;
        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter });
        const extensionsChan = client.channels.cache.find(channel => channel.id === process.env.EXTENSIONS_ID);

        if (confirmation.customId === 'grant') {
            await extensionsChan.send({
                content: `Extension granted for: ${user}.`,
                embeds: [granted],
            });
            axios.post(`https://sheetdb.io/api/v1/bhsilqd4lqdy7`, {
                data: {
                    id: 'INCREMENT',
                    extensionWeek: `${week}`,
                    length: `${length}`,
                    extensionUser: `${user.username}`,
                }
            });
        }
        else if (confirmation.customId === 'deny') {
            await extensionsChan.send({
                content: `Extension denied for: ${user}.`,
                embeds: [denied],
            });
        }
        
    },

    name: 'request-extension',
    description: "Request an extension ",
    options: [
        {
            name: 'week',
            description: 'the week you are requesting an extension for.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'reason',
            description: 'Why you need an extension',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'length',
            description: 'If you need an extension longer than the default 3 days',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],


};