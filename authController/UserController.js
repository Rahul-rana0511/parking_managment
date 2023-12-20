import userdb from '../model/usermodel.js';
import Area from '../model/areamodel.js';
import Parkingslot from '../model/parkingSlot.js';
import SlotParkedUser from '../model/parkedUser.js';
import {messages, responseStatus, statusCode} from '../core/constant/constant.js';
import Payment from '../model/payment.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import nodemailer from 'nodemailer';
import JWT from 'jsonwebtoken';
import { response } from 'express';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const MAX_AGE = 3*24*60*60;
const registerData = async (req, res) => {
    try {
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const email = req.body.email;
      const phoneNumber = req.body.phoneNumber;
      const password = req.body.password;
      const Cpassword = req.body.Cpassword;
      const Address = req.body.Address;
      const newUser = await userdb({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        Address: Address,
        Created_At: new Date(),
        Updated_At: new Date(), 
        verification_timestamp: new Date(),
      });
      const userData = await newUser.save();
      const text = `Please click the following link to verify your email: <a href="http://localhost:5000/email/${userData._id}">email</a>`;
      const sub = "Verify Email";
      await sendMail(email, text, sub);
      res.status(statusCode.Ok).send({
        success: true,
        msg: messages.successMail,
        data: userData,
      });
    } catch (error) {
   
      res.status(statusCode.Bad_request).send({ success: false, msg: error.message });
    }
  };
  const loginpost = async (req, res) => {
    try {
        const user = await userdb.findOne({ email: req.body.email });
        console.log(user);

        if (!user) {
            return res.status(statusCode.Not_Found).json({ error: messages.unauthorizedEmail });
        }
      
        if(user.is_verified==0){
          return res.status(statusCode.Unauthorized).json({error: messages.notVerified});
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (isPasswordValid) {
            if (!(JWT_SECRET_KEY)) {
                return res.status(statusCode.Bad_request).json({ error: messages.jwtNotDefined });
            }

            const token = JWT.sign({ userId: user._id }, JWT_SECRET_KEY, { expiresIn: '2h' });

            res.cookie("jwt", token, { httpOnly: true, maxAge: MAX_AGE * 1000 });

            res.status(statusCode.Created).json({ user: user._id, token });
        } else {
            res.status(statusCode.Unauthorized).json({ error: messages.UnauthorizedPassword }); 
        }
    } catch (error) {
        res.status(statusCode.Bad_request).json({ error: messages.loginError });
    }
};
  const sendMail = async (email, text, sub) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.email,
          pass: process.env.password,
        },
      });
  
      const mailOption = {
        from: process.env.email,
        to: email,
        subject: sub,
        html: text,
      };
  
      transporter.sendMail(mailOption, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Mail has been sent", info.response);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  const email = async (req, res) => {
    try {
      const text = " hii , you are succesffully registered with us";
      const sub = "user registered";
  
      const userId = req.params.userId;
      const userData = await userdb.findById({ _id: userId });
      if (userData.is_verified == 1) {
        return res.status(statusCode.Bad_request).send({
          message: messages.alreadyVerified,
        });
      } else {
        const currentTime = new Date();
        const verificationTime = userData.verification_timestamp;
  
        const timeDifference = currentTime - verificationTime;
        const timeLimit = 60 * 1000;
  
        if (timeDifference > timeLimit) {
          const deletedUser = await userdb.findByIdAndDelete(userId);
  
          if (deletedUser) {
            const text = ` hii ${userData.firstName}, you are not registered with us. please try again`;
            const sub = "user not registered";
  
            await sendMail(userData.email, text, sub);
  
            return res.status(statusCode.Bad_request).send({
              status: responseStatus.failure,
              message: messages.verificationTimeExpired,
            });
          } else {
            return res.status(statusCode.Bad_request).send({
              status: responseStatus.failure,
              message: messages.notDeletd,
            });
          }
        }
  
        const updatedData = await userdb.findByIdAndUpdate(
          { _id: userId },
          {
            $set: {
              is_verified: "1",
            },
          }
        );
        await sendMail(userData.email, text, sub);
  
        res.status(statusCode.Ok).send({
          success: true,
          msg: messages.successMail,
          user: updatedData,
        });
      }
    } catch (error) {
      res.status(500).send({ success: false, msg: error.message });
    }
  };
  const forgotpassword = async (req, res) => {
    try {
        const user = await userdb.findOne({ email: req.body.email });

        if (!user) {
          return res.status(statusCode.Not_Found).json({ error: messages.unauthorizedEmail });
        }

        const resetUrl = `http://localhost:5000/reset-password/${user._id}`;

        const text = `Please click the following link to reset your password: <a href="${resetUrl}">Reset Password</a>`;
        const sub = "Reset Password";
        await sendMail(user.email, text, sub);

        res.status(statusCode.Ok).json({ message: messages.resetEmail });
    } catch (error) {
        res.status(statusCode.Not_Found).json({ message: messages.unauthorizedEmail });
    }
};
const resetPassword = async (req, res) => {
  try {
      const userId = req.params.id;

      if (!userId) {
        return res.status(statusCode.Not_Found).json({ error: messages.unauthorizedEmail });
      }

      const password = req.body.password;

   
      if (!password) {
          return res.status(statusCode.Bad_request).json({ message: messages.passwordRequired });
      }

      const salt = await bcrypt.genSalt();
      const hashedpassword = await bcrypt.hash(password, salt);
      const currentTime = new Date();
      const user = await userdb.findByIdAndUpdate(
          userId,
          {
              $set: {
                  password: hashedpassword,
                  Updated_At:currentTime,
              },
          },
          { new: true }
      );

      if (!user) {
          return res.status(400).json({ message: 'Invalid or expired token' });
      }

      res.status(statusCode.Ok).json({ message: messages.Changepassword });
  } catch (error) {
      
      res.status(statusCode.Bad_request).json({ message: messages.changepasswordError});
  }
};
const listUser = async(req, res) => {
  try {
    const user = await userdb.find({});
    if(user){
     res.send(user);
    }else{
    
        res.status(statusCode.Bad_request).json(messages.UnauthorizedUser);
      }
    } catch (err) {

    res.status(statusCode.Bad_request).json(err);
  }

};
const editData = async (req, res) => {
  try {
      const userId = req.params.id;
      const user = await userdb.findById(userId);
     if(user.Role<3){
     return res.status(statusCode.Bad_request).json({error: messages.unauthorizedAction});
     }
      if (!req.body.email && !req.body.firstName && !req.body.lastName && !req.body.phoneNumber && !req.body.Address) {
          return res.status(statusCode.Bad_request).json({ error: messages.updationRequired });
      }
      const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'password','Address'];
      const updateFields = Object.keys(req.body).reduce((acc, field) => {
          if (allowedFields.includes(field)) {
              acc[field] = req.body[field];
          }
          return acc;
      }, {});
      updateFields.Updated_At = new Date();
      const userData = await userdb.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
      if (!userData) {
          return res.status(statusCode.Bad_request).send({success:responseStatus.failure, msg: messages.UnauthorizedUser });
      } else {
          return res.status(statusCode.Ok).json(userData);
      }
  } catch (err) {
      return res.status(statusCode.Bad_request).json({ error: err.message });
  }
};



const resetPasswordget=async(req,res)=>{
const userId=req.params.id;
const userdata=await userdb.findById({_id:userId})
res.send(userdata);
}
const delData = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await userdb.findById({ _id: userId });

    if (!userData) {
      return res.status(statusCode.Not_Found).send({success: responseStatus.failure, error: messages.UnauthorizedUser});
    }
    await userdb.findByIdAndUpdate(userId, { $set: { is_Deleted: true } });
    res.status(statusCode.Ok).send({success: responseStatus.success, msg: messages.deletedUser});
  } catch (err) {
    res.status(statusCode.Bad_request).send({success: responseStatus.failure, err: err.message});
  }
};
const slotParkedUser = async (req, res) => {
  try {
      const userId = req.userId;
      const slotId = req.params.id;
      console.log(userId);
    const { vehiclenumber, vehicletype } = req.body;

    const newSlotParkedUser = new SlotParkedUser({
      customId: slotId,
      vehiclenumber,
      vehicletype,
      startDate: new Date(), 
      user: userId, 
    });
    const availableParkingSlot = await Parkingslot.findOne({ status: true });

    if (!availableParkingSlot) {
      return res.status(statusCode.Bad_request).json({success:responseStatus.failure, message: messages.noSlots  });
    }
    newSlotParkedUser.parkingSlot = availableParkingSlot._id;

    // Save the new instance to the database
    const savedSlotParkedUser = await newSlotParkedUser.save();

    // Update the status of the assigned parking slot to false
    availableParkingSlot.status = false;
    await availableParkingSlot.save();

    res.status(statusCode.Created).json({success: responseStatus.success, message: messages.availableSlots, data: savedSlotParkedUser});
  } catch (error) {

    res.status(statusCode.Bad_request).send({success: responseStatus.failure, err: error.message});
  }
};
const getAmountBasedOnVehicleType = (vehicleType) => {
  return vehicleType.toLowerCase() === '2wheeler' ? process.env.twoWheeler : (vehicleType.toLowerCase() === '4wheeler' ? process.env.fourWheeler : 0);
};
const payment = async (req, res) => {
  try {
    
      const parkedUserId  = req.params.id;
      // Find the SlotParkedUser by vehicle number
      const slotParkedUser = await SlotParkedUser.findOne({ _id: parkedUserId });
      
      if (!slotParkedUser) {
          return res.status(statusCode.Not_Found).json({ success: responseStatus.failure, message: messages.UnauthorizedUser });
      }

      const amount = getAmountBasedOnVehicleType(slotParkedUser.vehicletype);

      // Check if a payment record already exists for the SlotParkedUser
      const existingPayment = await Payment.findOne({ SlotParkedUser: slotParkedUser._id });

      if (existingPayment) {
          // Update the existing payment record
          existingPayment.amount = amount;
          existingPayment.paid = true; // Assuming you want to mark it as paid whenever the payment is updated

          const updatedPayment = await existingPayment.save();
          return res.status(statusCode.Ok).json({ success: responseStatus.success, updatedPayment});
      }

      // Create a new payment record
      const newPayment = new Payment({
          amount: amount,
          paid: true, // Assuming you want to mark it as paid when creating a new payment
          SlotParkedUser: slotParkedUser._id,
      });

      const savedPayment = await newPayment.save();

      res.status(201).json(savedPayment);
  } catch (error) {
      console.error('Error handling payment:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
const addParkingSlots = async (req, res) => {
  try {
    const areaId = req.params.id;
    const areaName = req.body.areaName;

    // Corrected MongoDB query
    console.log(areaId);
    console.log(areaName);
    const existingArea = await Area.findOne({
      _id: areaId,
      'siteAddress.areaName': areaName,
    });

    if (!existingArea) {
      return res.status(statusCode.Not_Found).json({ success: responseStatus.failure , msg: messages. invalidArea });
    }

    const site = existingArea.siteAddress.find((site) => site.areaName === areaName);

    // Accessing the totalSlots property from the siteAddress element
    const totalSlots = site.totalSlots;
    console.log(totalSlots);

    const slots = [];

    // Generate slots
    for (let i = 1; i <= totalSlots; i++) {
      const slotNumber = i;
      const status = false; // Set status based on even or odd slot numbers

      const parkingslot = new Parkingslot({
        slotNumber: slotNumber,
        status: status,
        parkingid: areaId,
      });

      slots.push(parkingslot);
    }

    // Save all slots at once
    const parkingslotdata = await Parkingslot.insertMany(slots);

    return res.status(statusCode.Ok).json({
      success: responseStatus.success,
      msg: `${totalSlots} parking slots added successfully`,
      data: parkingslotdata,
    });
  } catch (error) {

    return res.status(statusCode.Bad_request).json({ success: responseStatus.failure, msg: error.message });
  }
};
const getRemainingSlots = async (req, res) => {
  try {
    const areaId = req.params.id;

    // Find all parking slots for the given area
    const parkingSlots = await Parkingslot.find({ parkingid: areaId });

    if (!parkingSlots || parkingSlots.length === 0) {
      return res.status(statusCode.Bad_request).json({ success: responseStatus.failure, msg: messages.invalidArea });
    }

    // Calculate remaining slots based on the status
    const remainingSlots = {
      total: parkingSlots.length,
      available: parkingSlots.filter(slot => !slot.status).length,
      occupied: parkingSlots.filter(slot => slot.status).length,
    };

    return res.status(statusCode.Ok).json({
      success: responseStatus.success,
      msg: messages.remainingSlots,
      data: remainingSlots,
    });
  } catch (error) {
    return res.status(statusCode.Bad_request).json({ success: responseStatus.failure, msg: error.message });
  }
};
const addMoneyToWallet = async (req, res) => {
  try {
      // Step 1: Retrieve the User
      const amountToAdd=req.body.balance;
      const userId = req.userId;
     

      const user = await User.findById(userId);
  

      if (!user) {
          return { success: false, message: 'User not found' };
      }

      // Step 2: Find or Create Wallet
      let wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
          // If wallet doesn't exist, create a new one
          wallet = new Wallet({ user: userId, balance: 0 });
      }

      // Step 3: Update Wallet Balance
      wallet.balance += Number(amountToAdd);

      // Step 4: Save Changes
      await wallet.save();

      return { success: true, message: 'Money added to the wallet successfully' };
  } catch (error) {
      console.error('Error adding money to wallet:', error);
      return { success: false, message: 'Internal Server Error' };
  }
};



  export{
    registerData,
    email, loginpost, forgotpassword, resetPassword,resetPasswordget,listUser,editData,delData,payment,addMoneyToWallet,addParkingSlots,getRemainingSlots,slotParkedUser
  };