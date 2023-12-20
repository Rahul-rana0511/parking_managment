import userdb from '../model/usermodel.js';
import {messages, responseStatus, statusCode} from '../core/constant/constant.js';

const editDataBySuperadmin = async (req, res) => {
    try {
      const userId = req.params.id;
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
        return res.status(statusCode.Bad_request).json({success: responseStatus.failure, error: messages.UnauthorizedUser });
      } else {
        return res.status(statusCode.Ok).json({success: responseStatus.success, data: userData });
      }
    } catch (err) {
      return res.status(statusCode.Bad_request).json({ error: err.message });
    }
  };
export{
  editDataBySuperadmin
}