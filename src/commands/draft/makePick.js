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

        //rob, starling, hailie, phoenix, chris, harry, rey, ghant, strict, silas, zmc, ishan, shaqtus, pocket, will, owen, manatsu, meli, eric, remi
        const playersById = [ `202241017057902593`, `93453076534407168`, `206519138649243649`, `168168128696680448`, `282505061513560064`, `342973790118215680`, `685992148835106875`, `246024472325259264`, `516456049105174548`, `613161005937328156`, 
            `87804552895533056`, `125395426948939776`, `227898618110148611`, `213125543971913739`, `201845831215611905`, `271732710651854848`, `226879501697548288`, `186958826145054721`, `220992748260425729`, `186820843894996992` ];

        var round = Math.ceil(currentPick / 20);

        var nextPlayerId;
        var currentPlayerId;

        if ( round % 2 !== 1 ) {
            const playersByIdReversed = playersById.reverse();
            const currentPickInRound = currentPick % 20;
            if (currentPickInRound == 0) {
                nextPlayerId = playersByIdReversed[19];
            }
            else {
                nextPlayerId = playersByIdReversed[currentPickInRound - 1];
                currentPlayerId = playersByIdReversed[currentPickInRound - 2];
            }
        }
        else {
            const currentPickInRound = currentPick % 20;
            if (currentPickInRound == 0) {
                nextPlayerId = playersById[19];
            }
            else {
                nextPlayerId = playersById[currentPickInRound - 1];
                currentPlayerId = playersById[currentPickInRound - 2];
            }
        }

        const draftChan = client.channels.cache.find(channel => channel.id === process.env.DRAFT_CHAN);

        draftChan.send ({
            content: `Round ${round}: ${user} has picked ${pokemon} for <@${currentPlayerId}>! Next pick: <@${nextPlayerId}>`,
        });

        interaction.reply(`Draft pick sent.`);

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