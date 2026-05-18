import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { UserModel } from "../infrastructure/databases/schema/user.schema.js";
import { TherapistModel } from "../infrastructure/databases/schema/therapist.schema.js";
import { AvailabilityModel, SlotModel } from "../infrastructure/databases/schema/availability.schema.js";
import { BookingModel } from "../infrastructure/databases/schema/booking.schema.js";
import { PaymentModel } from "../infrastructure/databases/schema/payment.schema.js";
import { WalletModel, TransactionModel, UserWalletModel } from "../infrastructure/databases/schema/wallet.schema.js";
import { BookingRepositoryImpl } from "../infrastructure/repositories/booking.repository.impl.js";
import { SlotRepository } from "../infrastructure/repositories/availability.repository.impl.js";
import { WalletRepositoryImpl } from "../infrastructure/repositories/wallet.repository.impl.js";
import { PaymentRepositoryImpl } from "../infrastructure/repositories/payment.repository.impl.js";
import { CancelBookingUseCase } from "../application/use-cases/booking/cancel-booking.usecase.js";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../shared/constants/index.js";

async function runTests() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI not set in environment");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully.\n");

  // Clean up any existing test records
  console.log("Cleaning up previous test data...");
  await UserModel.deleteMany({ email: /test-patient/ });
  await TherapistModel.deleteMany({ email: /test-therapist/ });
  await BookingModel.deleteMany({});
  await PaymentModel.deleteMany({});
  await SlotModel.deleteMany({});
  await AvailabilityModel.deleteMany({});
  await WalletModel.deleteMany({});
  await UserWalletModel.deleteMany({});
  await TransactionModel.deleteMany({});
  console.log("Cleanup complete.\n");

  // 1. Create a Test Patient (User)
  console.log("Creating test patient...");
  const patient = await UserModel.create({
    name: "Test Patient",
    email: "test-patient@renove.com",
    isGoogleAuth: false,
    isVerified: true,
  });

  // 2. Create a Test Therapist
  console.log("Creating test therapist...");
  const therapist = await TherapistModel.create({
    name: "Test Therapist",
    email: "test-therapist@renove.com",
    password: "Password@123",
    gender: "female",
    qualification: "Ph.D. Clinical Psychology",
    specialization: ["Addiction", "Trauma"],
    experience: 8,
    consultationFee: 150,
    bio: "Helping individuals recover and thrive.",
    isVerified: true,
  });

  // 3. Create Therapist Wallet
  console.log("Creating therapist wallet...");
  const wallet = await WalletModel.create({
    therapistId: therapist._id,
    pendingBalance: 150, // Simulated pending earnings
    availableBalance: 0,
    withdrawnBalance: 0,
  });

  // 4. Create Availability & Slot (48 hours in future for 100% refund)
  console.log("Creating slot in 48 hours...");
  const startTime = new Date();
  startTime.setHours(startTime.getHours() + 48);
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1);

  const availability = await AvailabilityModel.create({
    therapistId: therapist._id,
    title: "Clinical Slot",
    startTime: "09:00",
    endTime: "10:00",
    recurrenceRule: "FREQ=DAILY",
    recurrenceType: "weekly",
    startDate: new Date(),
    isActive: true,
  });

  const slot = await SlotModel.create({
    therapistId: therapist._id,
    availabilityId: availability._id,
    startTime,
    endTime,
    status: "BOOKED",
  });

  // 5. Create Booking
  console.log("Creating booking...");
  const booking = await BookingModel.create({
    userId: patient._id,
    therapistId: therapist._id,
    slotId: slot._id,
    type: "video",
    status: BOOKING_STATUS.CONFIRMED,
  });

  // 6. Create Paid Payment
  console.log("Creating payment record...");
  const payment = await PaymentModel.create({
    bookingId: booking._id,
    userId: patient._id,
    therapistId: therapist._id,
    amount: 150,
    currency: "usd",
    status: PAYMENT_STATUS.PAID,
    paymentIntentId: "pi_test_123",
    provider: "stripe",
  });

  console.log("Initial state created successfully!\n");

  // 7. Instantiate repositories & use case
  const bookingRepo = new BookingRepositoryImpl();
  const slotRepo = new SlotRepository();
  const walletRepo = new WalletRepositoryImpl();
  const paymentRepo = new PaymentRepositoryImpl();

  const cancelUseCase = new CancelBookingUseCase(
    bookingRepo,
    slotRepo,
    walletRepo,
    paymentRepo
  );

  // 8. Execute Cancellation
  console.log("--- Executing CancelBookingUseCase ---");
  const result = await cancelUseCase.execute({
    bookingId: booking._id.toString(),
    cancelledBy: "user",
    userIdOrTherapistId: patient._id.toString(),
    reason: "Scheduling conflict",
  });

  // 9. Assertions
  console.log("\n--- Verification Assertions ---");
  
  // A. Check Booking status
  const updatedBooking = await BookingModel.findById(booking._id);
  console.log(`Booking Status: Expected 'cancelled', Got '${updatedBooking?.status}'`);
  if (updatedBooking?.status !== BOOKING_STATUS.CANCELLED) {
    throw new Error("Assertion Failed: Booking status is not 'cancelled'");
  }
  console.log(`Cancelled By: Got '${updatedBooking?.cancelledBy}'`);
  console.log(`Cancellation Reason: Got '${updatedBooking?.cancellationReason}'`);

  // B. Check Slot status
  const updatedSlot = await SlotModel.findById(slot._id);
  console.log(`Slot Status: Expected 'AVAILABLE', Got '${updatedSlot?.status}'`);
  if (updatedSlot?.status !== "AVAILABLE") {
    throw new Error("Assertion Failed: Slot status is not 'AVAILABLE'");
  }

  // C. Check Payment refund status
  const updatedPayment = await PaymentModel.findById(payment._id);
  console.log(`Payment Status: Expected 'refunded', Got '${updatedPayment?.status}'`);
  if (updatedPayment?.status !== PAYMENT_STATUS.REFUNDED) {
    throw new Error("Assertion Failed: Payment status is not 'refunded'");
  }
  console.log(`Payment Refund Status: Expected 'processed', Got '${updatedPayment?.refundStatus}'`);
  if (updatedPayment?.refundStatus !== "processed") {
    throw new Error("Assertion Failed: Payment refundStatus is not 'processed'");
  }
  console.log(`Payment Refund Amount: Expected 150, Got ${updatedPayment?.refundAmount}`);
  if (updatedPayment?.refundAmount !== 150) {
    throw new Error("Assertion Failed: Refund amount is not 100%");
  }

  // D. Check Therapist Wallet adjustment
  const updatedWallet = await WalletModel.findOne({ therapistId: therapist._id });
  console.log(`Therapist Wallet Pending Balance: Expected 0, Got ${updatedWallet?.pendingBalance}`);
  if (updatedWallet?.pendingBalance !== 0) {
    throw new Error("Assertion Failed: Therapist wallet pendingBalance was not updated correctly");
  }
  const therapistTransactions = await TransactionModel.find({ walletId: updatedWallet?._id, walletType: "TherapistWallet" });
  console.log(`Therapist Transactions Logged: Got ${therapistTransactions.length} transaction(s)`);
  if (therapistTransactions.length === 0) {
    throw new Error("Assertion Failed: Therapist wallet transaction was not logged");
  }
  console.log(`Therapist Transaction Type: Got '${therapistTransactions[0].type}', Amount: ${therapistTransactions[0].amount}`);

  // E. Check Patient Wallet adjustment
  const patientWallet = await UserWalletModel.findOne({ userId: patient._id });
  console.log(`Patient Wallet Balance: Expected 150, Got ${patientWallet?.balance}`);
  if (patientWallet?.balance !== 150) {
    throw new Error("Assertion Failed: Patient wallet was not credited with refund amount");
  }
  const patientTransactions = await TransactionModel.find({ walletId: patientWallet?._id, walletType: "UserWallet" });
  console.log(`Patient Transactions Logged: Got ${patientTransactions.length} transaction(s)`);
  if (patientTransactions.length === 0) {
    throw new Error("Assertion Failed: Patient wallet transaction was not logged");
  }
  console.log(`Patient Transaction Type: Got '${patientTransactions[0].type}', Amount: ${patientTransactions[0].amount}`);

  console.log("\n ALL END-TO-END CANCELLATION Lifecycle tests passed perfectly! 🎉");
}

runTests()
  .then(() => {
    mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed: ", err);
    mongoose.disconnect();
    process.exit(1);
  });
