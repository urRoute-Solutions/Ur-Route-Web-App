import { ConflictError } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { userRepository } from "@/repositories/user.repository";
import { operatorRepository } from "@/repositories/operator.repository";
import { tokenService, type IssuedTokens } from "@/services/token.service";
import { auditService } from "@/services/audit.service";
import { notificationService } from "@/services/notification.service";
import { createVerificationToken } from "@/lib/auth/email-verification";
import { toUserDTO, type UserDTO } from "@/dto/user.dto";
import { toOperatorDTO, type OperatorDTO } from "@/dto/operator.dto";
import { generateReferralCode, generateUrid } from "@/utils/ids";
import { logger } from "@/lib/logger";
import type { RegisterOperatorInput } from "@/validators/auth";
import type { AuthPrincipal } from "@/types/auth";

interface RequestMeta {
  userAgent?: string | null;
  ip?: string | null;
}

/**
 * Register an operator: creates the User (role OPERATOR) and the Operator
 * business profile together in one step, assigns a URID, and logs the
 * account in immediately (status starts PENDING — route/trip creation stays
 * blocked until an admin activates the account).
 */
export async function registerOperatorUseCase(
  input: RegisterOperatorInput,
  meta: RequestMeta,
): Promise<{ user: UserDTO; operator: OperatorDTO; tokens: IssuedTokens }> {
  if (await userRepository.findByEmail(input.email)) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const referralCode = await uniqueReferralCode();
  const slug = await uniqueSlug(input.companyName);
  const urid = await uniqueUrid();

  const user = await userRepository.create({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    passwordHash,
    referralCode,
    role: "OPERATOR",
  });

  const operator = await operatorRepository.create({
    owner: { connect: { id: user.id } },
    name: input.companyName,
    slug,
    urid,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    address: input.address,
    city: input.city,
    status: "PENDING",
  });

  const principal: AuthPrincipal = {
    userId: user.id,
    role: user.role,
    operatorId: operator.id,
  };
  const tokens = await tokenService.issueForNewSession(principal, meta);

  auditService.record({
    action: "OPERATOR_ACCOUNT_REGISTERED",
    actorId: user.id,
    operatorId: operator.id,
    entity: "Operator",
    entityId: operator.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  // Best-effort — don't fail registration if email sending fails.
  Promise.all([
    sendVerificationEmail(user.id, user.email, user.fullName),
    sendOperatorWelcomeEmail(input.contactEmail, input.companyName, urid),
  ]).catch((err) =>
    logger.error("Failed to send operator registration emails", { userId: user.id, err }),
  );

  return { user: toUserDTO(user), operator: toOperatorDTO(operator), tokens };
}

async function sendVerificationEmail(userId: string, email: string, fullName: string) {
  const verifyUrl = await createVerificationToken(userId);
  await notificationService.sendEmail(
    email,
    "Verify your urRoute email address",
    verificationEmailHtml(fullName, verifyUrl),
  );
}

async function sendOperatorWelcomeEmail(contactEmail: string, companyName: string, urid: string) {
  await notificationService.sendEmail(
    contactEmail,
    "Welcome to urRoute — your operator account is set up",
    operatorWelcomeEmailHtml(companyName, urid),
  );
}

function verificationEmailHtml(name: string, verifyUrl: string): string {
  const first = name.split(" ")[0];
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:0">
      <div style="background:#1B2D78;padding:28px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px">urRoute</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">Affordable bus travel, reimagined</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#111;margin:0 0 8px;font-size:20px">Verify your email, ${first} 👋</h2>
        <p style="color:#555;margin:0 0 24px;font-size:15px;line-height:1.6">
          Thanks for joining urRoute! One quick step — click the button below to confirm your email address. The link expires in 24 hours.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#1B2D78;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">
          Verify email address →
        </a>
        <p style="color:#aaa;font-size:12px;margin:24px 0 0">
          If you didn't create an urRoute account, you can safely ignore this email.
        </p>
      </div>
    </div>`;
}

function operatorWelcomeEmailHtml(companyName: string, urid: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:0">
      <div style="background:#1B2D78;padding:28px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px">urRoute</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">Operator Partner Program</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#111;margin:0 0 8px;font-size:20px">Welcome aboard, ${companyName}! 🚌</h2>
        <p style="color:#555;margin:0 0 20px;font-size:15px;line-height:1.6">
          Your urRoute operator account has been created and is now pending review by our team. We'll notify you as soon as it's approved and you can start publishing routes.
        </p>

        <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:24px">
          <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;font-weight:600">Your URID (UrRoute ID)</p>
          <p style="color:#1B2D78;font-size:28px;font-weight:800;margin:0;letter-spacing:3px">${urid}</p>
          <p style="color:#666;font-size:13px;margin:6px 0 0">
            Keep this handy — quote it in any support ticket or incident so our team can find your account instantly.
          </p>
        </div>

        <p style="color:#aaa;font-size:12px;margin:24px 0 0">
          urRoute · Affordable bus travel across India
        </p>
      </div>
    </div>`;
}

/** Retry referral-code generation on the (rare) unique collision. */
async function uniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    if (!(await userRepository.findByReferralCode(code))) return code;
  }
  return generateReferralCode(10);
}

/** Derive a unique kebab-case slug from the company name. */
async function uniqueSlug(companyName: string): Promise<string> {
  const base = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "operator";

  if (!(await operatorRepository.findBySlug(base))) return base;

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!(await operatorRepository.findBySlug(candidate))) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/** Retry URID generation on the (rare) unique collision. */
async function uniqueUrid(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const urid = generateUrid("OPR");
    if (!(await operatorRepository.findByUrid(urid))) return urid;
  }
  return generateUrid("OPR", 9);
}
