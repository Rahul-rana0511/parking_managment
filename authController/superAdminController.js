import userdb from '../model/usermodel.js';
const registerData=(req,res)=>{
    res.status(200).send('hello superboss');
}
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
        return res.status(404).json({ error: 'User not found' });
      } else {
        return res.status(200).json(userData);
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: `Internal error: ${err.message}` });
    }
  };
export{
  editDataBySuperadmin,
    registerData
}