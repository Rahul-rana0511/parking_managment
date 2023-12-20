

import User from '../model/usermodel.js';
import {messages, responseStatus, statusCode} from '../core/constant/constant.js';
export const checkUserRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
   
      const userId = req.userId;
      const user = await User.findById(userId);

      if (!user)
       {  return res.status(statusCode.Not_Found).json({success: responseStatus.failure, error: messages.UnauthorizedUser });
      }  

      const userRole = user.Role;

      if (userRole === requiredRole || userRole === '1') {
        next();
      } else {
        res.status(statusCode.Bad_request).json({success: responseStatus.failure, error: messages.accessDenied });
      }
    } catch (error) {
   
      res.status(statusCode.Bad_request).json({success: responseStatus.failure, error: error.message });
    }
  };
};
