// utils/otpHelper.js
import { generateOTP } from "./generateOtp.js";
import { User } from "../model/userModel.js";

const generateAndSaveOtp = async (mobile) => {
  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  const [user, created] = await User.findOrCreate({
    where: { mobile },
    defaults: { mobile, otp, otpExpiresAt },
  });

  if (!created) {
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();
  }

  return { user, otp };
};

export { generateAndSaveOtp };
