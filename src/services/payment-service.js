const razorpay = require("../utils/razorpay");
const crypto = require("crypto");
const Plan = require("../models/plan.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const UserSubscription = require("../models/user-subscription.model");

// Helper function to calculate dates
const calculateDates = (durationDays) => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return { startDate, endDate };
};

// Your existing function - unchanged
exports.createOrderService = async (amount, planDetails = {}) => {
  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: planDetails
    };

    const order = await razorpay.orders.create(options);
    
    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      }
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: error.message || "Failed to create order"
    };
  }
};

// NEW: Create order with subscription
exports.createOrderWithSubscription = async (planId, userId) => {
  try {
    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return {
        success: false,
        message: "Plan not found"
      };
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId.toString().substring(0, 8)}`,
      notes: {
        planId: plan._id.toString(),
        userId: userId.toString(),
        category: plan.category,
        duration: plan.duration
      }
    });

    // Create SubscriptionPlan record
    const subscriptionPlan = new SubscriptionPlan({
      userId: userId,
      planId: plan._id,
      selectedPrice: plan.price,
      selectedDurationDays: plan.durationDays,
      status: "pending",
      razorpayOrderId: order.id,
      paymentStatus: "pending"
    });

    await subscriptionPlan.save();

    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      },
      plan: {
        id: plan._id,
        category: plan.category,
        duration: plan.duration,
        durationDays: plan.durationDays,
        price: plan.price
      },
      subscriptionPlanId: subscriptionPlan._id.toString(),
      message: "Order created successfully"
    };
  } catch (error) {
    console.error("Error creating order with subscription:", error);
    return {
      success: false,
      message: error.message || "Failed to create order"
    };
  }
};

// Your existing function - unchanged
exports.verifyPaymentService = (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
) => {
  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;
    
    return {
      success: isValid,
      isValid: isValid,
      message: isValid ? "Payment verified successfully" : "Invalid payment signature"
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      isValid: false,
      message: error.message || "Payment verification failed"
    };
  }
};

// NEW: Verify payment and activate subscription
exports.verifyAndActivateSubscription = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  userId,
  planId
) => {
  try {
    // Verify payment signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;
    
    if (!isValid) {
      return {
        success: false,
        isValid: false,
        message: "Invalid payment signature"
      };
    }

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return {
        success: false,
        message: "Plan not found"
      };
    }

    // Calculate dates
    const { startDate, endDate } = calculateDates(plan.durationDays);

    // Update SubscriptionPlan
    const subscriptionPlan = await SubscriptionPlan.findOneAndUpdate(
      { 
        userId: userId,
        planId: planId,
        razorpayOrderId: razorpay_order_id,
        status: "pending"
      },
      {
        status: "completed",
        paymentStatus: "success",
        transactionId: razorpay_payment_id
      },
      { new: true }
    );

    if (!subscriptionPlan) {
      return {
        success: false,
        message: "No pending subscription found"
      };
    }

    // Expire old active subscriptions
    await UserSubscription.updateMany(
      { 
        userId: userId, 
        status: "active" 
      },
      { 
        status: "expired",
        endDate: new Date()
      }
    );

    // Create new UserSubscription
    const userSubscription = new UserSubscription({
      userId: userId,
      planId: plan._id,
      subscriptionPlanId: subscriptionPlan._id,
      startDate: startDate,
      endDate: endDate,
      paymentId: razorpay_payment_id,
      amountPaid: plan.price,
      status: "active",
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature
    });

    await userSubscription.save();

    return {
      success: true,
      isValid: true,
      message: "Payment verified and subscription activated successfully",
      subscription: userSubscription,
      planDetails: {
        category: plan.category,
        duration: plan.duration,
        price: plan.price,
        startDate: startDate,
        endDate: endDate,
        durationDays: plan.durationDays
      }
    };
  } catch (error) {
    console.error("Error verifying and activating subscription:", error);
    return {
      success: false,
      isValid: false,
      message: error.message || "Failed to verify payment"
    };
  }
};

// NEW: Cancel subscription
exports.cancelSubscription = async (userId) => {
  try {
    const subscription = await UserSubscription.findOne({
      userId: userId,
      status: "active"
    });

    if (!subscription) {
      return {
        success: false,
        message: "No active subscription found"
      };
    }

    subscription.status = "cancelled";
    subscription.endDate = new Date();
    await subscription.save();

    // Also update SubscriptionPlan
    await SubscriptionPlan.findByIdAndUpdate(
      subscription.subscriptionPlanId,
      {
        status: "cancelled"
      }
    );

    return {
      success: true,
      message: "Subscription cancelled successfully",
      subscription: subscription
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return {
      success: false,
      message: error.message || "Failed to cancel subscription"
    };
  }
};