// controllers/referSettingsController.js
import { ReferSettings } from "../model/refersetting.Model.js";

const getReferSettings = async (req, res) => {
  try {
    let settings = await ReferSettings.findOne();

    // If not exists, create default one
    if (!settings) {
      settings = await ReferSettings.create({});
    }

    res.json({ success: true, settings });
  } catch (error) {
    console.error("Get Refer Settings Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateReferSettings = async (req, res) => {
  try {
    const { referralBonus, minWithdrawAmount } = req.body;

    if (referralBonus == null || minWithdrawAmount == null) {
      return res
        .status(400)
        .json({ success: false, message: "Missing values." });
    }

    let settings = await ReferSettings.findOne();

    if (!settings) {
      settings = await ReferSettings.create({
        referralBonus,
        minWithdrawAmount,
      });
    } else {
      settings.referralBonus = referralBonus;
      settings.minWithdrawAmount = minWithdrawAmount;
      await settings.save();
    }

    res.json({
      success: true,
      message: "Refer settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error("Update Refer Settings Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export { getReferSettings, updateReferSettings };
