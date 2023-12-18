const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {

    callback: (client, interaction ) => {
        
        var user = interaction.options.get('user')?.value || "";
        if ( user != "") {
            user = ` <@${user}>`;
        }

        interaction.reply(`READ THE RULES${user}!!!\nREAD THE RULES${user}!!!\nREAD THE RULES${user}!!!\nREAD THE RULES${user}!!!\nREAD THE RULES${user}!!!\nREAD THE RULES${user}!!!\nREAD THE RULES${user}!!!\nREAD THE RULES${user}!!!\nREAD THE RULES${user}!!!\nREAD THE RULES${user}!!!`);

    },

    name: 'rules',
    description: 'READ THE RULES',
    options: [
        {
            name: 'user',
            description: 'user to spam ping',
            type: ApplicationCommandOptionType.Mentionable,
            required: false,
        }
    ]

}