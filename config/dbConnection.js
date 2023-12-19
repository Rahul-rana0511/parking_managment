import 'dotenv/config';
import { connect } from 'mongoose';

async function connectDB() {
    try {
        await connect(process.env.MONGOOSE_URI);
        console.log('Database connected');
    } catch (error) {
        console.error('Error connecting to database:', error.message);
        process.exit(1);
    }
}

export default connectDB;