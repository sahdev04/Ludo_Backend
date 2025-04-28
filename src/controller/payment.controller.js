import instance from "../config/razorpay.js";
import { Transaction } from "../model/transactionModel.js";

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await instance.orders.create(options);

    // Save to DB
    await Transaction.create({ amount: order.amount });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;

    const transaction = await Transaction.findOne({ where: { id: orderId } });
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    transaction.paymentId = paymentId;
    transaction.status = "paid";
    await transaction.save();

    res.status(200).json({ success: true, message: "Payment successful" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};

export { createOrder, verifyPayment };
