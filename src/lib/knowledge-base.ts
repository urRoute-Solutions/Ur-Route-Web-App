export type KnowledgeEntry = {
  id: string;
  data: string;
  metadata: { category: string; title: string };
};

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── Booking ──────────────────────────────────────────────────────────────
  {
    id: "booking-001",
    data: "How to book a bus ticket on urRoute: Search for your route by entering the origin city, destination city, and travel date on the homepage. Browse available buses, choose your preferred operator, pick your seat, and proceed to payment. Once payment is successful, your booking confirmation and PNR (booking reference) are sent to your email and shown in My Bookings.",
    metadata: { category: "BOOKING", title: "How to book a ticket" },
  },
  {
    id: "booking-002",
    data: "Booking confirmation not received: If you completed payment but did not receive a confirmation email or PNR, first check your spam folder. If it is not there, go to My Bookings in your urRoute account — your booking will appear there if payment was successful. If it is not in My Bookings and your account was debited, raise a support ticket with the payment transaction ID.",
    metadata: { category: "BOOKING", title: "Booking confirmation not received" },
  },
  {
    id: "booking-003",
    data: "Wrong seat or coach assigned: If your boarding pass shows a different seat or coach than what you selected, contact the bus operator at the boarding point or raise a support ticket with your PNR. Seat reassignment is subject to availability and operator policy.",
    metadata: { category: "BOOKING", title: "Wrong seat or coach" },
  },
  {
    id: "booking-004",
    data: "How to change a booking: urRoute does not currently support self-service booking changes. To change your travel date, seat, or boarding point, cancel the existing booking and make a new one. Cancellation charges and refund timelines depend on the operator's policy and how far in advance you cancel.",
    metadata: { category: "BOOKING", title: "Changing a booking" },
  },
  {
    id: "booking-005",
    data: "Bus delayed or cancelled by operator: If your bus is delayed by more than 2 hours or cancelled, you are entitled to a full refund. Contact the operator at the boarding point or raise a ticket. urRoute will process the refund within 5-7 business days if confirmed as an operator-caused delay or cancellation.",
    metadata: { category: "BOOKING", title: "Bus delayed or cancelled" },
  },
  {
    id: "booking-006",
    data: "Where to find my PNR or booking reference: Your PNR is in the booking confirmation email and also visible in My Bookings section of your urRoute account. Click on any booking to see the full details including PNR, seat number, boarding point, and operator contact.",
    metadata: { category: "BOOKING", title: "Finding PNR or booking reference" },
  },
  {
    id: "booking-007",
    data: "Can I book for someone else: Yes. During booking you can enter the passenger's name and contact details. The PNR and ticket will be generated in the passenger's name. The booking will appear in your urRoute account.",
    metadata: { category: "BOOKING", title: "Booking for someone else" },
  },

  // ── Cancellation & Refund ────────────────────────────────────────────────
  {
    id: "refund-001",
    data: "How to cancel a booking: Go to My Bookings, select the booking you want to cancel, and click Cancel Booking. Cancellation is allowed up to 2 hours before departure. After cancellation, the refund is initiated automatically within 24 hours. Cancellation charges apply based on how early you cancel.",
    metadata: { category: "CANCELLATION_REFUND", title: "How to cancel a booking" },
  },
  {
    id: "refund-002",
    data: "Cancellation charges and refund policy: Cancellation more than 24 hours before departure — up to 90% refund depending on operator policy. Cancellation 6 to 24 hours before departure — 50% to 75% refund. Cancellation within 6 hours of departure — no refund or minimal refund as per operator policy. Specific refund percentages vary by operator.",
    metadata: { category: "CANCELLATION_REFUND", title: "Cancellation charges" },
  },
  {
    id: "refund-003",
    data: "Refund timeline: Once a cancellation is confirmed, refunds are processed within 5-7 business days to the original payment method. UPI payments may reflect faster, within 1-3 business days. Net banking and card refunds may take up to 7 business days depending on your bank.",
    metadata: { category: "CANCELLATION_REFUND", title: "Refund timeline" },
  },
  {
    id: "refund-004",
    data: "Refund not received after the expected timeline: If you cancelled more than 7 business days ago and the refund has not appeared in your account, raise a support ticket with your PNR and the transaction ID. urRoute will investigate and coordinate with the payment gateway.",
    metadata: { category: "CANCELLATION_REFUND", title: "Refund not received" },
  },
  {
    id: "refund-005",
    data: "Can I get a refund if the bus was late: If the bus departed more than 2 hours after the scheduled time, you can claim a full refund. Raise a support ticket with your PNR and mention the actual departure time. Our team will verify with the operator and process the refund.",
    metadata: { category: "CANCELLATION_REFUND", title: "Refund for late departure" },
  },

  // ── Loyalty Rewards ──────────────────────────────────────────────────────
  {
    id: "loyalty-001",
    data: "How the urRoute loyalty program works: Every time you book a bus through urRoute, you earn loyalty points. Points are credited after your journey is completed. Each operator sets their own reward values for their passengers. As you accumulate trips with an operator, you move up loyalty tiers — Level 1 to Level 4 — and unlock better discounts on future bookings.",
    metadata: { category: "LOYALTY_REWARDS", title: "How loyalty program works" },
  },
  {
    id: "loyalty-002",
    data: "Loyalty tiers and levels: There are 4 loyalty levels on urRoute. Level 1 is the starting tier for new passengers. Level 2, Level 3, and Level 4 offer progressively better rewards. Each operator independently decides what discount percentage or flat discount to offer at each tier. Check the operator's offers page to see their specific rewards for each level.",
    metadata: { category: "LOYALTY_REWARDS", title: "Loyalty tiers" },
  },
  {
    id: "loyalty-003",
    data: "Points not credited after travel: Loyalty points are credited automatically within 24 hours of your journey completion. If points are not credited after 48 hours, raise a support ticket with your PNR. Note that points are only credited after the journey date, not at booking time.",
    metadata: { category: "LOYALTY_REWARDS", title: "Points not credited" },
  },
  {
    id: "loyalty-004",
    data: "Tier not upgraded after reaching enough trips: Tier upgrades happen automatically. If you believe you have completed enough trips to qualify for the next tier but your tier has not updated, raise a ticket. Our team will verify your trip history and manually upgrade if eligible.",
    metadata: { category: "LOYALTY_REWARDS", title: "Tier not upgraded" },
  },
  {
    id: "loyalty-005",
    data: "Reward or discount not applied at checkout: If you are at a tier that qualifies for an operator discount but it was not applied during booking, check if the discount was for that specific operator. Loyalty rewards are operator-specific — a Level 3 discount with Operator A does not apply when booking with Operator B.",
    metadata: { category: "LOYALTY_REWARDS", title: "Reward not applied" },
  },

  // ── Payment ──────────────────────────────────────────────────────────────
  {
    id: "payment-001",
    data: "Accepted payment methods on urRoute: UPI (PhonePe, GPay, Paytm, any UPI app), debit cards, credit cards (Visa, Mastercard, RuPay), and net banking. All payments are processed securely through our payment gateway.",
    metadata: { category: "PAYMENT", title: "Accepted payment methods" },
  },
  {
    id: "payment-002",
    data: "Money deducted but no booking created: This happens when payment is processed successfully but a network error prevents booking confirmation. In most cases, money is automatically refunded within 5-7 business days. If you do not receive a refund, raise an urgent support ticket with your payment transaction ID and the amount deducted.",
    metadata: { category: "PAYMENT", title: "Money deducted no booking" },
  },
  {
    id: "payment-003",
    data: "Duplicate charge or double payment: If you see two charges for the same booking, raise a support ticket immediately with both transaction IDs. We will verify and refund the duplicate charge within 3-5 business days. Do not book again without first checking My Bookings.",
    metadata: { category: "PAYMENT", title: "Duplicate payment" },
  },
  {
    id: "payment-004",
    data: "Payment failed or stuck at processing: If your payment is stuck or shows as failed, do not attempt the payment again immediately. Wait 15 minutes and check My Bookings to see if the booking was created. If no booking appears and your bank shows a deduction, raise a ticket with the transaction reference.",
    metadata: { category: "PAYMENT", title: "Payment failed or stuck" },
  },
  {
    id: "payment-005",
    data: "GST invoice for business travel: To get a GST invoice for your bus booking, contact our support team with your PNR, GSTIN number, and registered business name. We will generate and email a GST invoice within 2 business days.",
    metadata: { category: "PAYMENT", title: "GST invoice" },
  },

  // ── Operator Complaints ──────────────────────────────────────────────────
  {
    id: "complaint-001",
    data: "How to file a complaint against a bus operator: If you had a bad experience — rude driver, dirty bus, safety concern, or departure from wrong location — raise a support ticket through the Support section. Select Operator Complaint as the category, describe the incident with your PNR, and our team will escalate to the operator and follow up with you.",
    metadata: { category: "OPERATOR_COMPLAINT", title: "Filing operator complaint" },
  },
  {
    id: "complaint-002",
    data: "Driver behaviour complaint: If a driver was rude, drove rash, or behaved inappropriately, raise an urgent ticket with your PNR. Describe the incident in detail including approximate time and location. We take driver behaviour complaints seriously and will escalate to the operator.",
    metadata: { category: "OPERATOR_COMPLAINT", title: "Driver behaviour" },
  },
  {
    id: "complaint-003",
    data: "Bus cleanliness or condition complaint: If the bus was dirty, had non-functional AC, broken seats, or was in poor condition, raise a ticket with your PNR. We will pass your feedback to the operator and track their response.",
    metadata: { category: "OPERATOR_COMPLAINT", title: "Bus condition complaint" },
  },
  {
    id: "complaint-004",
    data: "Safety concern on a bus: If you experienced or witnessed any safety issue on the bus — dangerous driving, fire, accident, or any other emergency — raise an URGENT support ticket immediately. For emergencies in progress, please call local emergency services (112) first.",
    metadata: { category: "OPERATOR_COMPLAINT", title: "Safety concern" },
  },

  // ── Account & General ────────────────────────────────────────────────────
  {
    id: "account-001",
    data: "How to create a urRoute account: Visit urroute.in and click Get Started. Enter your mobile number or email, verify with OTP, and complete your profile. Account creation is free.",
    metadata: { category: "OTHER", title: "Creating an account" },
  },
  {
    id: "account-002",
    data: "Forgot password or cannot log in: On the login page, click Forgot Password and enter your registered email. You will receive a reset link. If you signed up with phone OTP, use the OTP login option instead of password. If you are still unable to log in, raise a support ticket.",
    metadata: { category: "OTHER", title: "Login issues" },
  },
  {
    id: "account-003",
    data: "How to contact urRoute support: You can reach us through the Support chat widget on the website, by raising a ticket in the Support section of your account, or by emailing support@urroute.in. Our team responds within 24 hours on business days.",
    metadata: { category: "OTHER", title: "Contact support" },
  },
  {
    id: "account-004",
    data: "Is urRoute available as a mobile app: urRoute is currently available as a web app at urroute.in and works on all mobile browsers. A dedicated mobile app is coming soon.",
    metadata: { category: "OTHER", title: "Mobile app availability" },
  },
];
