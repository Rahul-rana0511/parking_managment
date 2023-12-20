import Area from '../model/areamodel.js'; 
import userdb from '../model/usermodel.js'
import {messages, responseStatus, statusCode} from '../core/constant/constant.js';

const adminArea = async (req, res) => {
  try {
    const {areaName, totalSlots } = req.body;
    const adminId =  req.userId;

    let existingArea = await Area.findOne({ adminId });

    if (!existingArea) {

      existingArea = new Area({ adminId });
    }

    existingArea.siteAddress.push({ areaName, totalSlots });

    await existingArea.save();

    res.status(statusCode.Ok).json({ message: messages.addressAdd , success: responseStatus.success, data: existingArea });
  } catch (error) {
    res.status(statusCode.Bad_request).json({ error: error.message });
  }
};

const editDataByAdmin = async (req, res) => {
    try {
   
      const userId = req.params.id;
     const user = await userdb.findById(userId);
     console.log(user);
     if (user.Role < 2) {
        return res.send('You are not able to update someone with a upper role');
    } 
      const updateFields = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        Address: req.body.Address,
        phoneNumber: req.body.phoneNumber,
        status:req.body.status,
        Role: req.body.Role,
        Updated_At: new Date(),
        is_verified: req.body.is_verified,
        is_Deleted: req.body.is_Deleted  
      };
      const userData = await userdb.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
      if (!userData) {
        return res.status(statusCode.Not_Found).json({success: responseStatus.failure, error: messages.UnauthorizedUser });
      } else {
        return res.status(statusCode.Ok).json({success: responseStatus.success, data: userData });
      }
    } catch (err) {

      return res.status(statusCode.Bad_request).json({ error: err.message });
    }
  };
export{
    adminArea,editDataByAdmin
}
