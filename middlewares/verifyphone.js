import twilio from 'twilio';

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const twilioClient = new twilio(accountSid, authToken);

const sendOTPSMS = async (phone, otp) => {
    try {
        await twilioClient.messages.create({
            body: `Your OTP is: ${otp} `,
            to: phone,
            from: '+12023189662',
        });
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

const generateOTP = () => {
    const otpLength = 6;
    const min = Math.pow(10, otpLength - 1);
    const max = Math.pow(10, otpLength) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export { sendOTPSMS, generateOTP };