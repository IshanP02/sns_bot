const dbconnection = require('./dbconnection');

async function setupDatabase() {

    const createPokemonTable = `
    CREATE TABLE IF NOT EXISTS pokemon (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        gen VARCHAR(255),
        color VARCHAR(255),
        type VARCHAR(255),
        previousLetter VARCHAR(255),
        currentLetter VARCHAR(255),
        nextLetter VARCHAR(255),
        tier VARCHAR(255)
    );
    `;

    const createPickTable = `
    CREATE TABLE IF NOT EXISTS pick (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pokemon VARCHAR(255),
        user VARCHAR(255),
        nextBlock VARCHAR(255)
    );
    `;

    try {
        console.log("Setting up the database...");

        await dbconnection.query(`USE customer_923555_SnS`);
        console.log("Switched to database 'customer_923555_SnS'.");

        await dbconnection.query(createPokemonTable);
        console.log("Table 'pokemon' created or already exists.");

        // await dbconnection.query(`DROP TABLE IF EXISTS pick`);
        // console.log("Table 'pick' dropped.");

        await dbconnection.query(createPickTable);
        console.log("Table 'pick' created or already exists.");

        console.log("Database setup complete.");
    } catch (err) {
        console.error("Error setting up database:", err.message);
    }
}

setupDatabase();