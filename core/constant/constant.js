const messages = {
    register: "User registered successfully ",
    registerError:"Registration unsuccessfull",
    userExists: "Users EmailId already exists",
    unauthorizedEmail: "Invalid email ",
    UnauthorizedPassword: "Invalid password",
    loginSuccess: "Successful login",
    loginError:"Login unsuccessfull",
    TokenError: "Enter token generated for authorization",
    Changepassword: "Password is updated to new one",
    changepasswordError:"Password not changed",
    UnauthorizedUser: "User doesnot exists ",
    updated: "User data updated successfully",
    updationError:"Updation Unsuccessfull",
    successMail:"Email sent successfully",
    mismatch:"No matching query for data provided by user",
    notVerified: "you are not verified with us",
    jwtNotDefined:"JWT secret key is not defined",
    alreadyVerified: "you are already with us",
    verificationTimeExpired: "Verification time expired. User record deleted.",
    notDeletd:"Failed to delete user record.",
  resetEmail:"Password reset email sent",
   passwordRequired: 'New password is required',
   unauthorizedAction :'you have no rights to do any changes',
  updationRequired:'At least one field (email, firstName, lastName, phoneNumber, address) is required for update',
  deletedUser:'User Deleted Successfully',
  noSlots:  'No available parking slots',
  availableSlots: 'slots Found',
  invalidArea:'Area not found',
  remainingSlots: 'Remaining parking slots retrieved successfully',
  addressAdd: 'Address added successfully',
  notFound:'token not found',
  accessDenied:'you have not access to these routes',
  };
  
  const responseStatus = {
    success: 1,
    failure: 0,
  };
  
  const statusCode = {
    Ok: 200,
    Created: 201,
    Bad_request: 400,
    Unauthorized: 401,
    Not_Found: 404,
    Forbidden: 403,
  };
  
  export { messages, responseStatus, statusCode };