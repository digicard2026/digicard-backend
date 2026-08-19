const {
  createOrderService,
  verifyPaymentService,
  createOrderWithSubscription,
  verifyAndActivateSubscription,
  cancelSubscription
} = require("../services/payment-service");

// Your existing function - unchanged
exports.createOrder = async (req, res) => {
  try {
    const { amount, planId, planName, ...otherDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid amount is required" 
      });
    }

    const planDetails = {
      planId,
      planName,
      ...otherDetails,
      timestamp: new Date().toISOString()
    };

    const result = await createOrderService(amount, planDetails);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Controller error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.message,
    });
  }
};

// NEW: Create subscription order
exports.createSubscriptionOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { planId } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required"
      });
    }

    const result = await createOrderWithSubscription(planId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Controller error creating subscription order:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.message,
    });
  }
};

// Your existing function - unchanged
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      ...otherDetails
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing payment details" 
      });
    }

    const result = verifyPaymentService(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log('Payment verified successfully:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      planId: planId
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      planId: planId
    });
  } catch (error) {
    console.error("Controller error verifying payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed",
      error: error.message 
    });
  }
};

// NEW: Verify and activate subscription
exports.verifyAndActivate = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId
    } = req.body;

    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing payment details" 
      });
    }

    const result = await verifyAndActivateSubscription(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      message: result.message,
      subscription: result.subscription,
      planDetails: result.planDetails
    });
  } catch (error) {
    console.error("Controller error verifying and activating:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed",
      error: error.message 
    });
  }
};

// NEW: Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const userId = req.user.id;
    const result = await cancelSubscription(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Controller error cancelling subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message
    });
  }
};