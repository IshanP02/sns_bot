require('dotenv').config();
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const axios = require('axios');

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        const pokemon = interaction.options.get('pokemon').value;
        const user = await client.users.fetch(interaction.member.id);

        const rows = await axios.get(`https://sheetdb.io/api/v1/bhsilqd4lqdy7?sheet=botData`);
        const rowData = rows.data;

        var currentPick = Math.max.apply(null, rowData.map(item => item.id)) + 1;
        if (currentPick == NaN) {
            currentPick = 0;
        }

        //rob, remi, altro, hailie, pocket, harry, rey, ghant, strict, silas, zmc, ishan, shaqtus, starling, will, owen, manatsu, meli, eric, chris
        const playersById = [ `202241017057902593`, `186820843894996992`, `135927721019572225`, `206519138649243649`, `213125543971913739`, `342973790118215680`, `685992148835106875`, `246024472325259264`, `516456049105174548`, `613161005937328156`, 
            `87804552895533056`, `125395426948939776`, `227898618110148611`, `93453076534407168`, `201845831215611905`, `271732710651854848`, `226879501697548288`, `186958826145054721`, `220992748260425729`, `282505061513560064` ];

        var round = Math.ceil(currentPick / 20);

        var nextPlayerId;

        if ( round % 2 !== 1 ) {
            const playersByIdReversed = playersById.reverse();
            const currentPickInRound = currentPick % 20;
            if (currentPickInRound == 0) {
                nextPlayerId = playersByIdReversed[19];
            }
            else {
                nextPlayerId = playersByIdReversed[currentPickInRound - 1];
            }
        }
        else {
            const currentPickInRound = currentPick % 20;
            if (currentPickInRound == 0) {
                nextPlayerId = playersById[19];
            }
            else {
                nextPlayerId = playersById[currentPickInRound - 1];
            }
        }

        interaction.reply(`Round ${round}: ${user} has picked ${pokemon}! Next pick: <@${nextPlayerId}>`);

        axios.post(`https://sheetdb.io/api/v1/bhsilqd4lqdy7?sheet=botData`, {
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