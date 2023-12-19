import userdb from '../model/usermodel.js';
import Area from '../model/areamodel.js';
import Parkingslot from '../model/parkingSlot.js';
import SlotParkedUser from '../model/parkedUser.js';
import Payment from '../model/payment.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import nodemailer from 'nodemailer';
import JWT from 'jsonwebtoken';
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
      res.status(200).send({
        success: true,
        msg: "Email sent successfully",
        data: userData,
      });
    } catch (error) {
      console.error("Error in regController:", error);
      res.status(400).send({ success: false, msg: error.message });
    }
  };
  const loginpost = async (req, res) => {
    try {
        const user = await userdb.findOne({ email: req.body.email });
        console.log(user);

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
      
        if(user.is_verified==0){
          return res.status(200).json({error: "you are not verified with us"})
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (isPasswordValid) {
            if (!(JWT_SECRET_KEY)) {
                return res.status(500).json({ error: "JWT secret key is not defined" });
            }

            const token = JWT.sign({ userId: user._id }, JWT_SECRET_KEY, { expiresIn: '2h' });

            res.cookie("jwt", token, { httpOnly: true, maxAge: MAX_AGE * 1000 });

            res.status(200).json({ user: user._id, token });
        } else {
            res.status(401).json({ error: "Invalid password" }); 
        }
    } catch (error) {
      console.error("Error in loginpost:", error);
        res.status(500).json({ error: "Internal Server Error" });
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
        return res.status(400).send({
          status: "failed",
          message: "Already verified",
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
  
            return res.status(400).send({
              status: "failed",
              message: "Verification time expired. User record deleted.",
            });
          } else {
            return res.status(500).send({
              status: "failed",
              message: "Failed to delete user record.",
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
  
        res.status(200).send({
          success: true,
          msg: "Email sent successfully",
          user: updatedData,
        });
      }
    } catch (error) {
      console.error("Error in regController:", error);
      res.status(500).send({ success: false, msg: error.message });
    }
  };
  const forgotpassword = async (req, res) => {
    try {
        const user = await userdb.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetUrl = `http://localhost:5000/reset-password/${user._id}`;

        const text = `Please click the following link to reset your password: <a href="${resetUrl}">Reset Password</a>`;
        const sub = "Reset Password";
        await sendMail(user.email, text, sub);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const resetPassword = async (req, res) => {
  try {
      const userId = req.params.id;

      if (!userId) {
          return res.status(400).json({ message: 'Invalid user ID' });
      }

      const password = req.body.password;

   
      if (!password) {
          return res.status(400).json({ message: 'New password is required' });
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
          console.error('Invalid or expired token. User not found or token expired.');
          return res.status(400).json({ message: 'Invalid or expired token' });
      }

      console.log('Password reset successful.');
      res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
      console.error('Error in resetPassword:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};
const listUser = async(req, res) => {
  try {
    const user = await userdb.find({});
    if(user){
     res.send(user);
    }else{
    
        res.status(400).json('User not found or invalid credentials');
      }
    } catch (err) {
    console.log(err.message);
    res.status(400).json('internal server error');
  }

};
const editData = async (req, res) => {
  try {
      const userId = req.params.id;
      const user = await userdb.findById(userId);
     console.log(user);
     if(user.Role<3){
     return res.status(200).json({error: 'you have no rights to do any changes'});
     }
      if (!req.body.email && !req.body.firstName && !req.body.lastName && !req.body.phoneNumber && !req.body.Address) {
          return res.status(400).json({ error: 'At least one field (email, firstName, lastName, phoneNumber, address) is required for update' });
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
          return res.status(404).json({ error: 'User not found' });
      } else {
          return res.status(200).json(userData);
      }
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: `Internal error: ${err.message}` });
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
      return res.status(404).send('User not found');
    }
    await userdb.findByIdAndUpdate(userId, { $set: { is_Deleted: true } });
    res.status(200).send('User deleted successfully');
  } catch (err) {
    res.status(500).send(`Internal error: ${err.message}`);
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
      return res.status(404).json({ message: 'No available parking slots' });
    }
    newSlotParkedUser.parkingSlot = availableParkingSlot._id;

    // Save the new instance to the database
    const savedSlotParkedUser = await newSlotParkedUser.save();

    // Update the status of the assigned parking slot to false
    availableParkingSlot.status = false;
    await availableParkingSlot.save();

    res.status(201).json(savedSlotParkedUser);
  } catch (error) {
    console.error('Error creating slotParkedUser:', error);
    res.status(500).send('Internal Server Error');
  }
};
const getAmountBasedOnVehicleType = (vehicleType) => {
  return vehicleType.toLowerCase() === '2wheeler' ? 20 : (vehicleType.toLowerCase() === '4wheeler' ? 40 : 0);
};
const payment = async (req, res) => {
  try {
      // Get the vehicle number from request parameters
      const vehiclenumber = req.params.vehiclenumber;
      console.log(vehiclenumber);

      // Find the SlotParkedUser by vehiclenumber
      const slotParkedUser = await SlotParkedUser.findOne({ vehiclenumber: vehiclenumber });
      console.log(slotParkedUser);

      if (!slotParkedUser) {
          return res.status(404).json({ message: 'SlotParkedUser not found' });
      }

      const amount = process.env.PAYMENT_AMOUNT;

      if (!amount) {
          return res.status(500).json({ error: 'Payment amount is not defined in the environment variable.' });
      }

      const vehicleType = slotParkedUser.vehicletype;

      const existingPayment = await Payment.findOne({ SlotParkedUser: slotParkedUser._id });

      if (existingPayment) {
         
          existingPayment.amount = getAmountBasedOnVehicleType(vehicleType);
          existingPayment.paid = paid || false;

          const updatedPayment = await existingPayment.save();
          return res.status(200).json(updatedPayment);
      }

     
      const newPayment = new Payment({
          amount: getAmountBasedOnVehicleType(vehicleType),
          paid: paid || false,
          SlotParkedUser: slotParkedUser._id,
          vehicleType,
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
      return res.status(404).json({ success: false, msg: 'Area not found' });
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

    return res.status(200).json({
      success: true,
      msg: `${totalSlots} parking slots added successfully`,
      data: parkingslotdata,
    });
  } catch (error) {
    console.error("Error adding parking slots:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
const getRemainingSlots = async (req, res) => {
  try {
    const areaId = req.params.id;

    // Find all parking slots for the given area
    const parkingSlots = await Parkingslot.find({ parkingid: areaId });

    if (!parkingSlots || parkingSlots.length === 0) {
      return res.status(404).json({ success: false, msg: 'No parking slots found for the area' });
    }

    // Calculate remaining slots based on the status
    const remainingSlots = {
      total: parkingSlots.length,
      available: parkingSlots.filter(slot => !slot.status).length,
      occupied: parkingSlots.filter(slot => slot.status).length,
    };

    return res.status(200).json({
      success: true,
      msg: 'Remaining parking slots retrieved successfully',
      data: remainingSlots,
    });
  } catch (error) {
    console.error("Error retrieving remaining parking slots:", error);
    return res.status(500).json({ success: false, msg: error.message });
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