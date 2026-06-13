import { Resend } from "resend";
import { getEnv } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { renderBookingConfirmationEmail } from "@/emails/booking-confirmation";

let resend: Resend | null = null;
function getResend() {
  if (!resend) resend = new Resend(getEnv().RESEND_API_KEY);
  return resend;
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
      await getResend().emails.send({
        from: getEnv().EMAIL_FROM,
        to,
        subject,
        html,
      });
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
    ]);
  },

  async sendRewardUnlocked(userId: string, email: string, rewardTitle: string) {
    await Promise.all([
      this.sendInApp(userId, "REWARD_UNLOCKED", "Reward Unlocked!", rewardTitle),
      this.sendEmail(email, "You've unlocked a reward!", `<p>${rewardTitle}</p>`),
    ]);
  },
};
