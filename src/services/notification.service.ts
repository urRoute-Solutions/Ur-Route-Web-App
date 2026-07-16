import { Resend } from "resend";
import { getEnv } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import twilio from "twilio";
import { renderBookingConfirmationEmail } from "@/emails/booking-confirmation";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let resend: Resend | null = null;
function getResend() {
  if (!resend) resend = new Resend(getEnv().RESEND_API_KEY);
  return resend;
}

let twilioClient: ReturnType<typeof twilio> | null = null;
function getTwilio() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = getEnv();
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  if (!twilioClient) twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return twilioClient;
}

let firebaseInitialized = false;
function ensureFirebase(): boolean {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = getEnv();
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) return false;
  if (!firebaseInitialized) {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }
    firebaseInitialized = true;
  }
  return true;
}

export const notificationService = {
  async sendInApp(userId: string, type: string, title: string, body: string, data: Record<string, unknown> = {}) {
    await prisma.notification.create({
      data: {
        user: { connect: { id: userId } },
        channel: "IN_APP",
        type,
        title,
        body,
        data: data as object,
        status: "SENT",
        sentAt: new Date(),
      },
    });
  },

  async sendEmail(to: string, subject: string, html: string) {
    try {
      // The Resend SDK resolves normally with `{ error }` on a rejected send
      // (invalid key, unverified domain, etc.) rather than throwing — a plain
      // try/catch alone silently treats every failed send as a success.
      const result = await getResend().emails.send({
        from: getEnv().EMAIL_FROM,
        to,
        subject,
        html,
      });
      if (result.error) {
        logger.error("Failed to send email", { to, subject, error: result.error });
      }
    } catch (err) {
      logger.error("Failed to send email", { to, subject, err });
    }
  },

  async sendBookingConfirmation(userId: string, email: string, data: {
    pnr: string;
    origin: string;
    destination: string;
    departureAt: string;
    passengerCount: number;
    totalFareMinor: number;
  }) {
    const html = await renderBookingConfirmationEmail(data);

    await Promise.all([
      this.sendInApp(userId, "BOOKING_CONFIRMED", "Booking Confirmed!", `Your booking ${data.pnr} is confirmed.`, { pnr: data.pnr }),
      this.sendEmail(email, `Booking Confirmed — ${data.pnr}`, html),
      this.sendPush(userId, "Booking Confirmed!", `PNR ${data.pnr} · ${data.origin} → ${data.destination}`, { pnr: data.pnr }),
    ]);
  },

  async sendSms(phone: string, message: string) {
    const client = getTwilio();
    const { TWILIO_PHONE_NUMBER } = getEnv();
    if (!client || !TWILIO_PHONE_NUMBER) return;
    try {
      await client.messages.create({ body: message, from: TWILIO_PHONE_NUMBER, to: `+91${phone}` });
    } catch (err) {
      logger.error("Failed to send SMS", { phone, err });
    }
  },

  async sendBookingSms(phone: string, data: { pnr: string; origin: string; destination: string; departureAt: string; totalFareMinor: number }) {
    const dep = new Date(data.departureAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    await this.sendSms(phone, `urRoute: Booking confirmed!\nPNR: ${data.pnr}\n${data.origin} → ${data.destination}\nDep: ${dep}\nTotal: ₹${(data.totalFareMinor / 100).toFixed(0)}\nShow this PNR to board.`);
  },

  async sendTripReminderSms(phone: string, data: { pnr: string; origin: string; destination: string; departureAt: string }) {
    const dep = new Date(data.departureAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    await this.sendSms(phone, `urRoute Reminder: Your bus ${data.origin}→${data.destination} departs at ${dep}. PNR: ${data.pnr}. Please board 15 mins early.`);
  },

  async sendPush(userId: string, title: string, body: string, data: Record<string, string> = {}) {
    if (!ensureFirebase()) return;
    try {
      const tokens = await prisma.fcmToken.findMany({
        where: { userId },
        select: { token: true },
      });
      if (tokens.length === 0) return;
      await getMessaging().sendEachForMulticast({
        tokens: tokens.map((t) => t.token),
        notification: { title, body },
        data,
      });
    } catch (err) {
      logger.error("Failed to send FCM push", { userId, err });
    }
  },

  async sendRewardUnlocked(userId: string, email: string, rewardTitle: string) {
    await Promise.all([
      this.sendInApp(userId, "REWARD_UNLOCKED", "Reward Unlocked!", rewardTitle),
      this.sendEmail(email, "You've unlocked a reward!", `<p>${rewardTitle}</p>`),
    ]);
  },

  async sendTripManifest(operatorEmail: string, trip: {
    busName: string;
    origin: string;
    destination: string;
    departureAt: string;
    manifestUrl: string;
  }, passengers: Array<{ pnr: string; seatLabel: string; name: string; age: number; gender: string; phone: string }>) {
    const rows = passengers.map((p, i) => `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:8px 12px;color:#6b7280;">${i + 1}</td>
        <td style="padding:8px 12px;font-family:monospace;font-weight:700;color:#1d4ed8;">${p.pnr}</td>
        <td style="padding:8px 12px;font-weight:600;">${p.seatLabel}</td>
        <td style="padding:8px 12px;">${p.name}</td>
        <td style="padding:8px 12px;">${p.age}</td>
        <td style="padding:8px 12px;text-transform:capitalize;">${p.gender.toLowerCase()}</td>
        <td style="padding:8px 12px;font-family:monospace;">${p.phone}</td>
        <td style="padding:8px 12px;"><span style="display:inline-block;width:16px;height:16px;border:2px solid #d1d5db;border-radius:3px;"></span></td>
      </tr>`).join("");

    const dep = new Date(trip.departureAt).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:24px;color:#111827;">
  <div style="background:#1b2d78;color:white;padding:20px 24px;border-radius:12px 12px 0 0;">
    <h1 style="margin:0;font-size:20px;">Passenger Manifest</h1>
    <p style="margin:4px 0 0;opacity:0.8;font-size:14px;">${trip.busName} · ${trip.origin} → ${trip.destination}</p>
    <p style="margin:4px 0 0;opacity:0.8;font-size:13px;">Departure: ${dep}</p>
  </div>
  <div style="background:#f9fafb;padding:16px 24px;border:1px solid #e5e7eb;border-top:none;">
    <p style="margin:0;font-size:14px;color:#374151;">
      <strong>${passengers.length}</strong> passenger(s) confirmed.
      <a href="${trip.manifestUrl}" style="color:#1d4ed8;">View live manifest</a>
    </p>
  </div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-top:none;font-size:13px;">
    <thead>
      <tr style="background:#f3f4f6;border-bottom:2px solid #e5e7eb;">
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;">#</th>
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;">PNR</th>
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;">SEAT</th>
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;">NAME</th>
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;">AGE</th>
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;">GENDER</th>
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;">MOBILE</th>
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;">BOARDED</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="8" style="padding:20px;text-align:center;color:#9ca3af;">No bookings yet</td></tr>'}</tbody>
  </table>
  <p style="font-size:11px;color:#9ca3af;margin-top:16px;">Generated by urRoute · This manifest reflects bookings at the time of sending. Check the live manifest for last-minute changes.</p>
</body></html>`;

    await this.sendEmail(
      operatorEmail,
      `Manifest: ${trip.origin} → ${trip.destination} — ${dep}`,
      html,
    );
  },
};
