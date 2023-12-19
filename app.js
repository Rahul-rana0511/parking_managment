import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/dbConnection.js';
dotenv.config();
import userRoutes from './authRoute/UserRoute.js';
import adminRoutes from './authRoute/adminRoute.js';
import superAdminRoutes from './authRoute/superAdminroute.js';
const app = express();
connectDB();
app.use('/admin', adminRoutes);
app.use('/superadmin', superAdminRoutes);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(userRoutes);
app.listen(process.env.PORT,()=>{
    console.log(`app is listen at ${process.env.PORT}`);
})