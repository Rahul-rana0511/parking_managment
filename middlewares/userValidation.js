import{check,validationResult} from 'express-validator';
const dataValidator = [
  check('firstName')
  .isLength({ min: 3, max: 20 }).withMessage('First name must be between 3 and 20 characters long')
  .matches(/^[a-zA-Z]+$/).withMessage('Only characters are allowed in the first name'),
  check('lastName')
  .isLength({ min: 3, max: 20 }).withMessage('Last name must be between 3 and 20 characters long')
  .matches(/^[a-zA-Z]+$/).withMessage('Only characters are allowed in the last name'),
  check('email')
  .isEmail().withMessage('Invalid email address')
  .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/).withMessage('Invalid email address'),
  check('password')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  // check('Cpassword')
  //   .custom((value, { req }) => {
  //     if (value !== req.body.password) {
  //       throw new Error('Passwords do not match');
  //     }
  //     return true;
  //   }),
    check('phoneNumber')
    .isMobilePhone('any').withMessage('Invalid phone number'),
    check('Address')
  .notEmpty()
  .withMessage('Address is required')
  .custom((value) => {
    const addressComponents = value.split(',');

    if (addressComponents.length !== 4) {
      throw new Error('Invalid Address format. Please include streetname, city, state, and pincode.');
    }

    const [streetname, city, state, pincode] = addressComponents;

    const addressObject = {
      streetname,
      city,
      state,
      pincode,
    }; 
    if (!addressObject.streetname || !addressObject.city || !addressObject.state || !addressObject.pincode) {
      throw new Error('All components of the Address are required.');
    }

    return true;
  }),

   ];

const checkValidation=async (req,res,next)=>{
  console.log(req.body);
await Promise.all(dataValidator.map(validation => validation.run(req)));  
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}
next();
}
export{ checkValidation};
