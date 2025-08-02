require('dotenv').config();
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const dbconnection = require('../../database/dbconnection');

// let activeTimeout = null;

// async function startPickTimeout(draftChan, currentPlayerId, nextPlayerId) {

//     if (activeTimeout) {
//         clearTimeout(activeTimeout);
//         activeTimeout = null;
//         console.log('active timeout cleared');
//     }

//     activeTimeout = setTimeout(async () => {
//         const [lastPick] = await dbconnection.query(
//             `SELECT * FROM pick WHERE id = (SELECT MAX(id) FROM pick)`
//         );
    
//         if (lastPick[0].user === currentPlayerId) {
//             console.error(`Pick already made by <@${currentPlayerId}>. Timer aborted.`);
//             return;
//         }
    
//         await draftChan.send({
//             content: `Time's up! <@${currentPlayerId}>'s turn is skipped. Next pick: <@${nextPlayerId}>`,
//         });
    
//         await dbconnection.query(
//             `INSERT INTO pick (pokemon, user, nextBlock) VALUES (NULL, ?, NULL)`,
//             [currentPlayerId]
//         );
    
//         const randomNumber = Math.floor(Math.random() * 4);
//         const blocks = ['type', 'color', 'letter', 'gen'];
//         const nextBlock = blocks[randomNumber];

//         await dbconnection.query(
//             `UPDATE pick SET nextBlock = ? WHERE user = ? ORDER BY id DESC LIMIT 1`,
//             [nextBlock, currentPlayerId]
//         );
    
//         await draftChan.send({
//             content: `The next block is ${nextBlock}!`,
//         });
    
//         activeTimeout = null;
//     }, 8 * 60 * 60 * 1000);
// }

module.exports = {

    callback: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Draft not currently in progress...', ephemeral: true });

        const draftChan = client.channels.cache.find(channel => channel.id === process.env.DRAFT_CHAN);

        const pokemon = interaction.options.get('pokemon').value;
        const user = await client.users.fetch(interaction.member.id);

        const [id] = await dbconnection.query(`SELECT MAX(id) AS next_id FROM pick`);
        let currentPick = id[0].next_id;  
        if (currentPick == null) {
            currentPick = 1;
            draftChan.send ({
                content: `Draft has started! The first block is gen blocking of gen 9!`,
            });
        }
        else {
            currentPick = currentPick + 1;
        }
        //SCUFFED FIX FOR S10 MESSUP, DELETE AFTER
        if (currentPick > 109) {
            currentPick = currentPick - 1;
        }

        //Fear, Naps, Scott, Rey, Tahlia, Will, Tony, Ishan, Kyle, Zach, Meli, Manatsu, Sum, Wheeler, Saint, Shaq, Curtis, Chris, Strict, Joey, Lily, Super, Emma, Harry, Rob, Owen, Ghant, Phoenix
        const playersById = [ `358030932856406019`/**fear*/, `372762243093495809`/**naps*/, `278667274519314435`/**scott*/, `685992148835106875`/**rey*/, `212098633317875713`/**tahlia*/, `201845831215611905`/**will*/, `188019219961479168`/**tony*/, 
            `125395426948939776`/**ishan*/, `424351418653212682`/**kyle*/, `87804552895533056`/**zmc*/, `186958826145054721`/**meli*/, `226879501697548288`/**manatsu*/, `309141015594532864`/**sum*/, `114450973987962880`/**wheeler*/, 
            `380494414230978589`/**saint*/, `227898618110148611`/**shaq*/, `245253160078147586`/**curtis*/, `282505061513560064`/**chris*/, `516456049105174548`/**strict*/, `185136347508506624`/**joey*/, `186820843894996992`/**lily*/,
            `351820177467244545`/**super*/, `348247655375306755`/**emma*/, `342973790118215680`/**harry*/, `202241017057902593`/**rob*/, `271732710651854848`/**owen*/, `246024472325259264`/**ghant*/, `168168128696680448`/**phoenix*/];

        var round = Math.ceil(currentPick / 28);

        var nextPlayerId;
        var currentPlayerId;

        if ( round % 2 !== 1 ) {
            const playersByIdReversed = playersById.reverse();
            const currentPickInRound = currentPick % 28;
            if (currentPickInRound == 0) {
                nextPlayerId = playersByIdReversed[27];
                currentPlayerId = playersByIdReversed[27];
            }
            else {
                nextPlayerId = playersByIdReversed[currentPickInRound];
                currentPlayerId = playersByIdReversed[currentPickInRound - 1];
            }
        }
        else {
            const currentPickInRound = currentPick % 28;
            if (currentPickInRound == 0) {
                nextPlayerId = playersById[27];
                currentPlayerId = playersById[27];
            }
            else {
                nextPlayerId = playersById[currentPickInRound];
                currentPlayerId = playersById[currentPickInRound - 1];
            }
        }
        var block;

        if (currentPick != 1) {
            const [prevId] = await dbconnection.query(`SELECT * FROM pick WHERE id = (SELECT MAX(id) FROM pick)`);
            block = prevId[0].nextBlock;
            const prevMon = prevId[0].pokemon;
            const [prevMonData] = await dbconnection.query(
                `SELECT * FROM pokemon WHERE name = ?`,
                [prevMon]
            );
        }

        if (pokemon == 'skip') {
            draftChan.send ({
                content: `<@${currentPlayerId}>'s pick has been skipped, block will remain the same! Next pick: <@${nextPlayerId}>`,
            });
            await dbconnection.query(
                `INSERT INTO pick (pokemon, user, nextBlock) VALUES (NULL, ?, ?)`,
                [currentPlayerId, block]
            );
            return interaction.reply(`Draft pick skipped.`);
        }

        const [mon] = await dbconnection.query(
            `SELECT * FROM pokemon WHERE name = ?`,
            [pokemon]
        );

        if (mon.length <= 0 ) {
            return interaction.reply({
                content: `Pokemon not found, try again.`,
                ephemeral: true
            });
        }

        const [monExists] = await dbconnection.query(
            `SELECT * FROM pick WHERE pokemon = ?`,
            [pokemon]
        );

        if (monExists.length > 0) {
            return interaction.reply({
                content: `Pokemon already picked, try again.`,
                ephemeral: true
            });
        }

        if (currentPick == 1) {
            if (mon[0].gen == 9) {
                return interaction.reply({
                    content: `Illegal pick, gen is blocked by initial block, try again.`,
                    ephemeral: true
                });
            }
            else {
                draftChan.send ({
                    content: `Round ${round}: ${user} has picked ${pokemon} for <@${currentPlayerId}>! Next pick: <@${nextPlayerId}>`,
                });
            }
        }
        else {
            const [prevId] = await dbconnection.query(`SELECT * FROM pick WHERE id = (SELECT MAX(id) FROM pick)`);
            const block = prevId[0].nextBlock;
            const prevMon = prevId[0].pokemon;
            const [prevMonData] = await dbconnection.query(
                `SELECT * FROM pokemon WHERE name = ?`,
                [prevMon]
            );
            if (block == 'type') {
                if (mon[0].type == prevMonData[0].type) {
                    return interaction.reply({
                        content: `Illegal pick, type is blocked by ${prevMon}, try again.`,
                        ephemeral: true
                    });
                }
                else {
                    draftChan.send ({
                        content: `Round ${round}: ${user} has picked ${pokemon} for <@${currentPlayerId}>! Next pick: <@${nextPlayerId}>`,
                    });
                }
            }
            else if (block == 'color') {
                if (mon[0].color == prevMonData[0].color) {
                    return interaction.reply({
                        content: `Illegal pick, color is blocked by ${prevMon}, try again.`,
                        ephemeral: true
                    });
                }
                else {
                    draftChan.send ({
                        content: `Round ${round}: ${user} has picked ${pokemon} for <@${currentPlayerId}>! Next pick: <@${nextPlayerId}>`,
                    });
                }
            }
            else if (block == 'letter') {
                if (mon[0].currentLetter == prevMonData[0].currentLetter || mon[0].currentLetter == prevMonData[0].previousLetter || mon[0].currentLetter == prevMonData[0].nextLetter) {
                    return interaction.reply({
                        content: `Illegal pick, letter is blocked by ${prevMon}, try again.`,
                        ephemeral: true
                    });
                }
                else {
                    draftChan.send ({
                        content: `Round ${round}: ${user} has picked ${pokemon} for <@${currentPlayerId}>! Next pick: <@${nextPlayerId}>`,
                    });
                }
            }
            else if (block == 'gen') {
                if (mon[0].gen == prevMonData[0].gen) {
                    return interaction.reply({
                        content: `Illegal pick, gen is blocked by ${prevMon}, try again.`,
                        ephemeral: true
                    });
                }
                else {
                    draftChan.send ({
                        content: `Round ${round}: ${user} has picked ${pokemon} for <@${currentPlayerId}>! Next pick: <@${nextPlayerId}>`,
                    });
                }
            }

        }      

        let nextBlock;
        const randomNumber = Math.floor(Math.random() * 4);
        if (randomNumber == 0) {
            nextBlock = 'type';
        }
        else if (randomNumber == 1) {
            nextBlock = 'color';
        }
        else if (randomNumber == 2) {
            nextBlock = 'letter';
        }
        else {
            nextBlock = 'gen';
        }
        draftChan.send ({
            content: `The next block is ${nextBlock}!`,
        });

        await dbconnection.query(
            `INSERT INTO pick (pokemon, user, nextBlock) VALUES (?, ?, ?)`,
            [pokemon, currentPlayerId, nextBlock]
        );

        const [team] = await dbconnection.query(
            `SELECT * FROM team WHERE user = ?`,
            [currentPlayerId]
        );

        if (mon[0].tier.trim() == "a") {
            if (team[0].a1 == null) {
                await dbconnection.query(
                    `UPDATE team SET a1 = ? WHERE user = ?`,
                    [pokemon, currentPlayerId]
                );
            }
            else if (team[0].points >= 12) {
                if (team[0].free1 == null) {
                    let points = team[0].points - 12;
                    if (points < 4) {
                        return interaction.reply(`Invalid pick, a tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free1 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free2 == null) {
                    let points = team[0].points - 12;
                    if (points < 2) {
                        return interaction.reply(`Invalid pick, a tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free2 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free3 == null) {
                    let points = team[0].points - 12;
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free3 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else {
                    return interaction.reply(`Invalid pick, a tier slots are full, and you do not have enough free points OR slots.`);
                }
            }
        }
        else if (mon[0].tier.trim() == "b") {
            if (team[0].b1 == null) {
                await dbconnection.query(
                    `UPDATE team SET b1 = ? WHERE user = ?`,
                    [pokemon, currentPlayerId]
                );
            }
            else if (team[0].b2 == null) {
                await dbconnection.query(
                    `UPDATE team SET b2 = ? WHERE user = ?`,
                    [pokemon, currentPlayerId]
                );
            }
            else if (team[0].points >= 8) {
                if (team[0].free1 == null) {
                    let points = team[0].points - 8;
                    if (points < 4) {
                        return interaction.reply(`Invalid pick, b tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free1 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free2 == null) {
                    let points = team[0].points - 8;
                    if (points < 2) {
                        return interaction.reply(`Invalid pick, b tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free2 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free3 == null) {
                    let points = team[0].points - 8;
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free3 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else {
                    return interaction.reply(`Invalid pick, b tier slots are full, and you do not have enough free points OR slots.`);
                }
            }
        }
        else if (mon[0].tier.trim() == "c") {
            if (team[0].c1 == null) {
                await dbconnection.query(
                    `UPDATE team SET c1 = ? WHERE user = ?`,
                    [pokemon, currentPlayerId]
                );
            }
            else if (team[0].c2 == null) {
                await dbconnection.query(
                    `UPDATE team SET c2 = ? WHERE user = ?`,
                    [pokemon, currentPlayerId]
                );
            }
            else if (team[0].points >= 5) {
                if (team[0].free1 == null) {
                    let points = team[0].points - 5;
                    if (points < 4) {
                        return interaction.reply(`Invalid pick, c tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free1 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free2 == null) {
                    let points = team[0].points - 5;
                    if (points < 2) {
                        return interaction.reply(`Invalid pick, c tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free2 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free3 == null) {
                    let points = team[0].points - 5;
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free3 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else {
                    return interaction.reply(`Invalid pick, c tier slots are full, and you do not have enough free points OR slots.`);
                }
            }
        }
        else if (mon[0].tier.trim() == "d") {
            if (team[0].d1 == null) {
                await dbconnection.query(
                    `UPDATE team SET d1 = ? WHERE user = ?`,
                    [pokemon, currentPlayerId]
                );
            }
            else if (team[0].points >= 3) {
                if (team[0].free1 == null) {
                    let points = team[0].points - 3;
                    if (points < 4) {
                        return interaction.reply(`Invalid pick, d tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free1 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free2 == null) {
                    let points = team[0].points - 3;
                    if (points < 2) {
                        return interaction.reply(`Invalid pick, d tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free2 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free3 == null) {
                    let points = team[0].points - 3;
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free3 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else {
                    return interaction.reply(`Invalid pick, d tier slots are full, and you do not have enough free points OR slots.`);
                }
            }
        }
        else if (mon[0].tier.trim() == "e") {
            if (team[0].e1 == null) {
                await dbconnection.query(
                    `UPDATE team SET e1 = ? WHERE user = ?`,
                    [pokemon, currentPlayerId]
                );
            }
            else if (team[0].points >= 2) {
                if (team[0].free1 == null) {
                    let points = team[0].points - 2;
                    if (points < 4) {
                        return interaction.reply(`Invalid pick, e tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free1 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free2 == null) {
                    let points = team[0].points - 2;
                    if (points < 2) {
                        return interaction.reply(`Invalid pick, e tier slots are full, and you will not have enough points for 3 free picks if you pick this.`);
                    }
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free2 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else if (team[0].free3 == null) {
                    let points = team[0].points - 2;
                    await dbconnection.query(
                        `UPDATE team SET points = ?, free3 = ? WHERE user = ?`,
                        [points, pokemon, currentPlayerId]
                    );
                }
                else {
                    return interaction.reply(`Invalid pick, e tier slots are full, and you do not have enough free points OR slots.`);
                }
            }
        }

        // await startPickTimeout(currentPick, draftChan, nextPlayerId);
    
        interaction.reply(`Draft pick sent.`);

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