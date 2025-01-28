require('dotenv').config()

const db = require('../db/queries'); // Adjust the path according to your project structure

console.log("script running");

async function setupDemoUser() {
    const demoUsername = "demo";
    const demoPassword = process.env.DEMO_PASSWORD;

    // Check if demo user exists
    const user = await db.findUser("username", demoUsername); // Implement this function in your db/queries.js

    if (!user) {
        // Add the demo user if not found
        await db.addUser(demoUsername, demoPassword); // Adjust function if needed
        console.log('Demo user added successfully.');
    } else {
        console.log('Demo user already exists.');
    }
}

// Execute the script
setupDemoUser()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error setting up demo user:', err);
        process.exit(1);
    });