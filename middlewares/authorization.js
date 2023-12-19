

import User from '../model/usermodel.js';

export const checkUserRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
   
      const userId = req.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }  

      const userRole = user.Role;

      if (userRole === requiredRole || userRole === '1') {
        next();
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      console.error('Error in checkUserRole middleware:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
