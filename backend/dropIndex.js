const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function dropIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const collection = mongoose.connection.collection('users');
        console.log('Dropping index googleId_1...');
        await collection.dropIndex('googleId_1');
        console.log('Index googleId_1 dropped successfully');
    } catch (err) {
        console.log('Error or index already dropped:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

dropIndex();
