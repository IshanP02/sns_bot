require('dotenv').config();
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const axios = require('axios');

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        const pokemon = interaction.options.get('pokemon').value;
        const user = await client.users.fetch(interaction.member.id);

        interaction.reply(`${user} has picked ${pokemon}! Next pick: <TO-DO>`);

        axios.post(`https://sheetdb.io/api/v1/bhsilqd4lqdy7`, {
            data: {
                id: 'INCREMENT',
                pokemon: `${pokemon}`,
                user: `${user.username}`,
            }
        });

    },

    name: 'pick',
    description: 'Pick a pokemon',
    options: [
        {
            name: 'pokemon',
            description: 'Pokemon you are picking ',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ]
}