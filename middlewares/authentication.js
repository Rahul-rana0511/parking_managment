import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import {messages, responseStatus, statusCode} from '../core/constant/constant.js';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const authenticateToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];
      const user = jwt.verify(token, JWT_SECRET_KEY);
      req.userId = user.userId;     
    } else {

      return res.status(statusCode.Not_Found).json({ success: responseStatus.failure, error: messages.notFound  });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(statusCode.Bad_request).json({success: responseStatus.failure, error: error.message });
  }
};

export{authenticateToken};
