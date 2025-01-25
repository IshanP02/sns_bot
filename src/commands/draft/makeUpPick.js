require('dotenv').config();
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const dbconnection = require('../../database/dbconnection');

module.exports = {

    callback: async (client, interaction) => {

        //if (!interaction.member.permissions.has(PermissionsBitField.Administrator)) return interaction.reply({ content: 'You can't do that', ephemeral: true});

        const pokemon = interaction.options.get('pokemon').value;
        const user = await client.users.fetch(interaction.member.id);
        const number = interaction.options.get('number').value;

        const draftChan = client.channels.cache.find(channel => channel.id === process.env.DRAFT_CHAN);

        const [missedPick] = await dbconnection.query(
            `SELECT * FROM pick WHERE id = ?`,
            [number]
        );
        
        if (missedPick[0].length == 0) {
            return interaction.reply({ content: 'That pick number does not exist.', ephemeral: true });
        }

        if (missedPick[0].pokemon !== null) {
            return interaction.reply({ content: 'That pick has already been made.', ephemeral: true });
        }

        const [prevPick] = await dbconnection.query(
            `SELECT * FROM pick WHERE id = ?`,
            [number - 1]
        );

        const block = prevPick[0].nextBlock;
        const prevPokemon = prevPick[0].pokemon;

        const [mon] = await dbconnection.query(
            `SELECT * FROM pokemon WHERE name = ?`,
            [pokemon]
        );

        if (mon.length == 0) {
            return interaction.reply({ content: 'That Pokemon does not exist.', ephemeral: true });
        }

        const [prevMonData] = await dbconnection.query(
            `SELECT * FROM pokemon WHERE name = ?`,
            [prevPokemon]
        );

        if (block === 'type' && mon[0].type === prevMonData[0].type) {
            return interaction.reply({ content: `Illegal pick, type is blocked by ${prevPokemon}, try again.`, ephemeral: true });
        }
        else if (block === 'color' && mon[0].color === prevMonData[0].color) {
            return interaction.reply({ content: `Illegal pick, color is blocked by ${prevPokemon}, try again.`, ephemeral: true });
        }
        else if (block === 'letter' && (mon[0].currentLetter === prevMonData[0].previousLetter || mon[0].currentLetter === prevMonData[0].nextLetter || mon[0].currentLetter === prevMonData[0].currentLetter)) {
            return interaction.reply({ content: `Illegal pick, letter is blocked by ${prevPokemon}, try again.`, ephemeral: true });
        }
        else if (block === 'gen' && mon[0].gen === prevMonData[0].gen) {
            return interaction.reply({ content: `Illegal pick, gen is blocked by ${prevPokemon}, try again.`, ephemeral: true });
        }
        else {
            const [userPicked] = await dbconnection.query(
                `SELECT * FROM pick WHERE id = ?`,
                [number]
            );
            draftChan.send ({
                content: `${user} has made up skipped pick ${number}: ${pokemon} for <@${userPicked[0].user}>!`,
            });
        }

        await dbconnection.query(
            `UPDATE pick SET pokemon = ? WHERE id = ?`,
            [pokemon, number]
        );

    },

    name: 'make-up-pick',
    description: 'Make up a missed pick.',
    options: [
        {
            name: 'pokemon',
            type: ApplicationCommandOptionType.String,
            description: 'The Pokemon you want to pick.',
            required: true,
        },
        {
            name: 'number',
            type: ApplicationCommandOptionType.Integer,
            description: 'The number of the pick you want to make up.',
            required: true,
        },
    ],

};