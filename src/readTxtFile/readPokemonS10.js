const fs = require('fs');
const path = require('path');
const dbconnection = require('../database/dbconnection');
const filePath = path.join(__dirname, 'tierlist.txt');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

async function importPokemon() {
    try {
        const [rows] = await dbconnection.query('SELECT COUNT(*) AS count FROM pokemon');
        
        if (rows[0].count > 0) {
            console.log('Pokemon table is not empty. Skipping data import.');
            return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const lines = fileContent.split('\n').filter(line => line.trim() !== '');

        const query = `
        INSERT INTO pokemon (name, gen, color, type, previousLetter, currentLetter, nextLetter, tier)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const connection = await dbconnection.getConnection();
        await connection.beginTransaction();

        for (const line of lines) {
            let [name, gen, color, type, previousLetter, currentLetter, nextLetter, tier] = line.split(',');

            // Capitalize the first letter of the Pokémon name
            name = capitalizeFirstLetter(name);

            await connection.query(query, [name, gen, color, type, previousLetter, currentLetter, nextLetter, tier]);
        }

        await connection.commit();

        console.log('All Pokémon data has been imported successfully.');
    } catch (err) {
        console.error('Error importing Pokémon data:', err.message);
    }
}

importPokemon();