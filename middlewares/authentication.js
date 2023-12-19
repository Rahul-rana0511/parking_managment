import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const authenticateToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];
      const user = jwt.verify(token, JWT_SECRET_KEY);
      req.userId = user.userId;     
    } else {

      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export{authenticateToken};
