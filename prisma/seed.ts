/**
 * Seed file — testing data for urRoute.
 * Run: pnpm db:seed
 *
 * Creates:
 *  • 1 admin + 2 agents
 *  • 3 operators (each with their own owner user)
 *  • 2 traveler accounts
 *  • Routes, trips (next 14 days), seats, offer templates, perks
 *
 * All passwords follow the same pattern so they're easy to remember:
 *   admin       → Admin@1234
 *   agents      → Agent@1234
 *   operators   → Operator@1234
 *   travelers   → Travel@1234
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const hash = (p: string) => bcrypt.hash(p, BCRYPT_ROUNDS);

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysFromNow(d: number, h = 0, m = 0) {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, m, 0, 0);
  return dt;
}

function generateSeats(tripId: string, totalSeats: number, priceMinor: number, seatType: "SEATER" | "SLEEPER") {
  const seats = [];
  const half = Math.ceil(totalSeats / 2);

  for (let i = 1; i <= totalSeats; i++) {
    const isUpper = i > half;
    const num = isUpper ? i - half : i;
    const prefix = seatType === "SLEEPER" ? (isUpper ? "U" : "L") : "S";
    seats.push({
      tripId,
      label: `${prefix}${num}`,
      deck: isUpper ? "UPPER" as const : "LOWER" as const,
      priceMinor,
      isBooked: false,
      isLadies: false,
    });
  }
  return seats;
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── 1. Admin ────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@urroute.in" },
    update: {},
    create: {
      fullName: "Super Admin",
      email: "admin@urroute.in",
      phone: "+919000000001",
      passwordHash: await hash("Admin@1234"),
      role: "ADMIN",
      referralCode: "ADMIN001",
      emailVerified: true,
    },
  });
  console.log("✅ Admin:", adminUser.email);

  // ── 2. Agents ───────────────────────────────────────────────────────────────
  const agent1 = await prisma.user.upsert({
    where: { email: "agent1@urroute.in" },
    update: {},
    create: {
      fullName: "Priya Sharma",
      email: "agent1@urroute.in",
      phone: "+919000000002",
      passwordHash: await hash("Agent@1234"),
      role: "AGENT",
      referralCode: "AGNT001",
      emailVerified: true,
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: "agent2@urroute.in" },
    update: {},
    create: {
      fullName: "Rahul Verma",
      email: "agent2@urroute.in",
      phone: "+919000000003",
      passwordHash: await hash("Agent@1234"),
      role: "AGENT",
      referralCode: "AGNT002",
      emailVerified: true,
    },
  });
  console.log("✅ Agents:", agent1.email, agent2.email);

  // ── 3. Travelers ────────────────────────────────────────────────────────────
  const traveler1 = await prisma.user.upsert({
    where: { email: "traveler1@urroute.in" },
    update: {},
    create: {
      fullName: "Aisha Khan",
      email: "traveler1@urroute.in",
      phone: "+919000000010",
      passwordHash: await hash("Travel@1234"),
      role: "TRAVELER",
      referralCode: "AISHA1",
      emailVerified: true,
    },
  });

  const traveler2 = await prisma.user.upsert({
    where: { email: "traveler2@urroute.in" },
    update: {},
    create: {
      fullName: "Kiran Reddy",
      email: "traveler2@urroute.in",
      phone: "+919000000011",
      passwordHash: await hash("Travel@1234"),
      role: "TRAVELER",
      referralCode: "KIRAN2",
      emailVerified: true,
    },
  });
  console.log("✅ Travelers:", traveler1.email, traveler2.email);

  // ── 4. Operator owner users ──────────────────────────────────────────────────
  const opUser1 = await prisma.user.upsert({
    where: { email: "kpn@urroute.in" },
    update: {},
    create: {
      fullName: "KPN Travels Owner",
      email: "kpn@urroute.in",
      phone: "+919100000001",
      passwordHash: await hash("Operator@1234"),
      role: "OPERATOR",
      referralCode: "KPN0001",
      emailVerified: true,
    },
  });

  const opUser2 = await prisma.user.upsert({
    where: { email: "vrl@urroute.in" },
    update: {},
    create: {
      fullName: "VRL Travels Owner",
      email: "vrl@urroute.in",
      phone: "+919100000002",
      passwordHash: await hash("Operator@1234"),
      role: "OPERATOR",
      referralCode: "VRL0001",
      emailVerified: true,
    },
  });

  const opUser3 = await prisma.user.upsert({
    where: { email: "srs@urroute.in" },
    update: {},
    create: {
      fullName: "SRS Travels Owner",
      email: "srs@urroute.in",
      phone: "+919100000003",
      passwordHash: await hash("Operator@1234"),
      role: "OPERATOR",
      referralCode: "SRS0001",
      emailVerified: true,
    },
  });
  console.log("✅ Operator users created");

  // ── 5. Operators ─────────────────────────────────────────────────────────────
  const kpn = await prisma.operator.upsert({
    where: { ownerId: opUser1.id },
    update: {},
    create: {
      ownerId: opUser1.id,
      name: "KPN Travels",
      slug: "kpn-travels",
      description: "South India's most trusted bus service since 1985. AC sleeper and seater buses on all major routes.",
      contactEmail: "support@kpntravels.in",
      contactPhone: "+914422334455",
      address: "No. 12, Anna Salai",
      city: "Chennai",
      status: "ACTIVE",
      rating: 4.3,
    },
  });

  const vrl = await prisma.operator.upsert({
    where: { ownerId: opUser2.id },
    update: {},
    create: {
      ownerId: opUser2.id,
      name: "VRL Travels",
      slug: "vrl-travels",
      description: "Karnataka's largest bus network with 1000+ buses daily across South and West India.",
      contactEmail: "care@vrltravels.in",
      contactPhone: "+918022445566",
      address: "VRL Complex, Varur",
      city: "Bengaluru",
      status: "ACTIVE",
      rating: 4.5,
    },
  });

  const srs = await prisma.operator.upsert({
    where: { ownerId: opUser3.id },
    update: {},
    create: {
      ownerId: opUser3.id,
      name: "SRS Travels",
      slug: "srs-travels",
      description: "Comfortable overnight bus services connecting Hyderabad, Bengaluru, Chennai and beyond.",
      contactEmail: "help@srstravels.in",
      contactPhone: "+914023556677",
      address: "Yousufguda Road",
      city: "Hyderabad",
      status: "ACTIVE",
      rating: 4.1,
    },
  });
  console.log("✅ Operators:", kpn.name, vrl.name, srs.name);

  // ── 6. Routes ─────────────────────────────────────────────────────────────────
  const routeDefs = [
    // KPN routes
    {
      operatorId: kpn.id,
      origin: "Chennai",
      destination: "Bengaluru",
      distanceKm: 346,
      durationMin: 360,
      boardingPoints: [
        { name: "Koyambedu Bus Stand", landmark: "CMBT", time: "21:00" },
        { name: "Tambaram", landmark: "Tambaram Railway Station", time: "21:45" },
      ],
      droppingPoints: [
        { name: "Majestic", landmark: "Bengaluru City Bus Stand", time: "03:00" },
        { name: "Silk Board", landmark: "Silk Board Junction", time: "03:30" },
      ],
    },
    {
      operatorId: kpn.id,
      origin: "Chennai",
      destination: "Coimbatore",
      distanceKm: 505,
      durationMin: 540,
      boardingPoints: [
        { name: "Koyambedu Bus Stand", landmark: "CMBT", time: "20:30" },
        { name: "Guindy", landmark: "Guindy MRTS", time: "21:00" },
      ],
      droppingPoints: [
        { name: "Gandhipuram", landmark: "Coimbatore Central", time: "05:30" },
        { name: "RS Puram", landmark: "RS Puram Bus Stop", time: "05:50" },
      ],
    },
    {
      operatorId: kpn.id,
      origin: "Bengaluru",
      destination: "Chennai",
      distanceKm: 346,
      durationMin: 360,
      boardingPoints: [
        { name: "Majestic", landmark: "Bengaluru City Bus Stand", time: "21:30" },
        { name: "Electronic City", landmark: "Electronic City Flyover", time: "22:15" },
      ],
      droppingPoints: [
        { name: "Koyambedu Bus Stand", landmark: "CMBT", time: "03:30" },
        { name: "Tambaram", landmark: "Tambaram Railway Station", time: "04:00" },
      ],
    },
    // VRL routes
    {
      operatorId: vrl.id,
      origin: "Bengaluru",
      destination: "Hyderabad",
      distanceKm: 570,
      durationMin: 600,
      boardingPoints: [
        { name: "Majestic", landmark: "Bengaluru City Bus Stand", time: "20:00" },
        { name: "Hebbal", landmark: "Hebbal Flyover", time: "20:30" },
      ],
      droppingPoints: [
        { name: "Mehdipatnam", landmark: "Mehdipatnam Circle", time: "06:00" },
        { name: "MGBS", landmark: "Mahatma Gandhi Bus Station", time: "06:30" },
      ],
    },
    {
      operatorId: vrl.id,
      origin: "Bengaluru",
      destination: "Mumbai",
      distanceKm: 981,
      durationMin: 960,
      boardingPoints: [
        { name: "Majestic", landmark: "Bengaluru City Bus Stand", time: "18:00" },
        { name: "Yeshwanthpur", landmark: "Yeshwanthpur Circle", time: "18:30" },
      ],
      droppingPoints: [
        { name: "Dadar", landmark: "Dadar Bus Depot", time: "10:00" },
        { name: "Borivali", landmark: "Borivali Station West", time: "10:45" },
      ],
    },
    {
      operatorId: vrl.id,
      origin: "Hyderabad",
      destination: "Bengaluru",
      distanceKm: 570,
      durationMin: 600,
      boardingPoints: [
        { name: "MGBS", landmark: "Mahatma Gandhi Bus Station", time: "21:00" },
        { name: "Mehdipatnam", landmark: "Mehdipatnam Circle", time: "21:30" },
      ],
      droppingPoints: [
        { name: "Majestic", landmark: "Bengaluru City Bus Stand", time: "07:00" },
        { name: "Silk Board", landmark: "Silk Board Junction", time: "07:30" },
      ],
    },
    // SRS routes
    {
      operatorId: srs.id,
      origin: "Hyderabad",
      destination: "Chennai",
      distanceKm: 627,
      durationMin: 660,
      boardingPoints: [
        { name: "MGBS", landmark: "Mahatma Gandhi Bus Station", time: "19:30" },
        { name: "LB Nagar", landmark: "LB Nagar Metro", time: "20:00" },
      ],
      droppingPoints: [
        { name: "Koyambedu Bus Stand", landmark: "CMBT", time: "07:30" },
        { name: "Vadapalani", landmark: "Vadapalani Bus Stop", time: "07:50" },
      ],
    },
    {
      operatorId: srs.id,
      origin: "Hyderabad",
      destination: "Vijayawada",
      distanceKm: 275,
      durationMin: 300,
      boardingPoints: [
        { name: "MGBS", landmark: "Mahatma Gandhi Bus Station", time: "06:00" },
        { name: "Uppal", landmark: "Uppal Bus Stop", time: "06:30" },
      ],
      droppingPoints: [
        { name: "Pandit Nehru Bus Station", landmark: "PNBS", time: "11:00" },
        { name: "Benz Circle", landmark: "Benz Circle Junction", time: "11:20" },
      ],
    },
    {
      operatorId: srs.id,
      origin: "Chennai",
      destination: "Hyderabad",
      distanceKm: 627,
      durationMin: 660,
      boardingPoints: [
        { name: "Koyambedu Bus Stand", landmark: "CMBT", time: "20:00" },
        { name: "Ambattur", landmark: "Ambattur Industrial Estate", time: "20:30" },
      ],
      droppingPoints: [
        { name: "MGBS", landmark: "Mahatma Gandhi Bus Station", time: "08:00" },
        { name: "Secunderabad", landmark: "Secunderabad Railway Station", time: "08:30" },
      ],
    },
  ];

  const createdRoutes: Array<{ id: string; operatorId: string; durationMin: number | null }> = [];
  for (const rd of routeDefs) {
    const existing = await prisma.route.findFirst({
      where: { operatorId: rd.operatorId, origin: rd.origin, destination: rd.destination },
    });
    if (existing) {
      createdRoutes.push({ id: existing.id, operatorId: existing.operatorId, durationMin: existing.durationMin });
    } else {
      const r = await prisma.route.create({ data: rd });
      createdRoutes.push({ id: r.id, operatorId: r.operatorId, durationMin: r.durationMin });
    }
  }
  console.log("✅ Routes:", createdRoutes.length);

  // ── 7. Trips + Seats ─────────────────────────────────────────────────────────
  // Each route gets 3 trips spread over the next 14 days
  const busConfigs = [
    { busName: "KPN Diamond Sleeper", seatType: "SLEEPER" as const, layout: "2+1", totalSeats: 40, basePriceMinor: 85000 },
    { busName: "KPN Gold AC", seatType: "SLEEPER" as const, layout: "2+1", totalSeats: 36, basePriceMinor: 75000 },
    { busName: "KPN Express", seatType: "SEATER" as const, layout: "2+2", totalSeats: 48, basePriceMinor: 45000 },
    { busName: "VRL Multi-Axle AC", seatType: "SLEEPER" as const, layout: "2+1", totalSeats: 40, basePriceMinor: 95000 },
    { busName: "VRL Volvo", seatType: "SLEEPER" as const, layout: "2+1", totalSeats: 36, basePriceMinor: 110000 },
    { busName: "VRL Semi-Sleeper", seatType: "SEATER" as const, layout: "2+2", totalSeats: 44, basePriceMinor: 55000 },
    { busName: "SRS Scania AC", seatType: "SLEEPER" as const, layout: "2+1", totalSeats: 40, basePriceMinor: 90000 },
    { busName: "SRS Executive", seatType: "SEATER" as const, layout: "2+2", totalSeats: 48, basePriceMinor: 50000 },
    { busName: "SRS Night Rider", seatType: "SLEEPER" as const, layout: "2+1", totalSeats: 36, basePriceMinor: 80000 },
  ];

  const amenitiesSets = [
    ["AC", "Charging Port", "Blanket", "Water Bottle", "CCTV"],
    ["AC", "Charging Port", "WiFi", "Blanket", "Water Bottle", "Reading Lamp"],
    ["AC", "Charging Port", "Water Bottle"],
  ];

  let tripCount = 0;
  let seatCount = 0;

  for (let i = 0; i < createdRoutes.length; i++) {
    const route = createdRoutes[i];
    if (!route) continue;
    const durationMin = route.durationMin ?? 360;
    const busConfig = busConfigs[i % busConfigs.length];
    const amenities = amenitiesSets[i % amenitiesSets.length];

    // 3 trips per route: days 1, 4, 8 from now
    for (const dayOffset of [1, 4, 8]) {
      const depHour = [18, 20, 21, 22][i % 4];
      const departureAt = daysFromNow(dayOffset, depHour, 0);
      const arrivalAt = new Date(departureAt.getTime() + durationMin * 60 * 1000);

      let trip = await prisma.trip.findFirst({
        where: { routeId: route.id, departureAt },
        include: { _count: { select: { seats: true } } },
      });

      if (!trip) {
        trip = await prisma.trip.create({
          data: {
            operatorId: route.operatorId,
            routeId: route.id,
            busName: busConfig.busName,
            seatType: busConfig.seatType,
            layout: busConfig.layout,
            totalSeats: busConfig.totalSeats,
            availableSeats: busConfig.totalSeats,
            basePriceMinor: busConfig.basePriceMinor,
            departureAt,
            arrivalAt,
            amenities,
            status: "SCHEDULED",
          },
          include: { _count: { select: { seats: true } } },
        });
        tripCount++;
      }

      // Create seats only if none exist yet for this trip
      if ((trip as typeof trip & { _count: { seats: number } })._count.seats === 0) {
        const seats = generateSeats(trip.id, busConfig.totalSeats, busConfig.basePriceMinor, busConfig.seatType);
        await prisma.seat.createMany({ data: seats, skipDuplicates: true });
        seatCount += seats.length;
      }
    }
  }
  console.log(`✅ Trips: ${tripCount}, Seats: ${seatCount}`);

  // ── 8. Offer Templates (loyalty) ─────────────────────────────────────────────
  const offerDefs = [
    {
      level: "LEVEL_1" as const,
      title: "Welcome Offer",
      description: "A warm welcome discount for your first journey with us.",
      discountType: "PERCENTAGE" as const,
      percentage: 10.0,
      maxCapMinor: 15000,
      groupBonusPerHead: 2.0,
      groupBonusMaxHeads: 4,
      unlockTripNumber: 1,
      rewardTripNumber: 1,
      perks: [
        { key: "WELCOME_DISCOUNT", label: "10% off first booking", icon: "🎉" },
        { key: "PRIORITY_BOARDING", label: "Priority boarding", icon: "⚡" },
      ],
    },
    {
      level: "LEVEL_2" as const,
      title: "Stay Reward",
      description: "Keep travelling and unlock better discounts at Level 2.",
      discountType: "PERCENTAGE" as const,
      percentage: 15.0,
      maxCapMinor: 25000,
      groupBonusPerHead: 3.0,
      groupBonusMaxHeads: 5,
      unlockTripNumber: 2,
      rewardTripNumber: 4,
      perks: [
        { key: "STAY_DISCOUNT", label: "15% off every booking", icon: "🌟" },
        { key: "FREE_SNACK", label: "Complimentary snack pack", icon: "🍿" },
        { key: "SEAT_UPGRADE", label: "Free seat upgrade (subject to availability)", icon: "⬆️" },
      ],
    },
    {
      level: "LEVEL_3" as const,
      title: "Loyalty Bonus",
      description: "Our loyal travellers deserve the best — enjoy 20% off and free cancellations.",
      discountType: "PERCENTAGE" as const,
      percentage: 20.0,
      maxCapMinor: 40000,
      groupBonusPerHead: 5.0,
      groupBonusMaxHeads: 6,
      unlockTripNumber: 8,
      rewardTripNumber: 10,
      perks: [
        { key: "LOYALTY_DISCOUNT", label: "20% off every booking", icon: "💎" },
        { key: "FREE_CANCELLATION", label: "Free cancellation up to 12h before", icon: "🔄" },
        { key: "LOUNGE_ACCESS", label: "VIP lounge access at major stops", icon: "🏛️" },
        { key: "DEDICATED_SUPPORT", label: "Dedicated support line", icon: "📞" },
      ],
    },
    {
      level: "LEVEL_4" as const,
      title: "Champion Deal",
      description: "The ultimate reward for our most dedicated travellers.",
      discountType: "FLAT" as const,
      flatAmountMinor: 50000,
      maxCapMinor: 50000,
      groupBonusPerHead: 8.0,
      groupBonusMaxHeads: 8,
      unlockTripNumber: 12,
      rewardTripNumber: 15,
      perks: [
        { key: "CHAMPION_FLAT", label: "₹500 flat off every booking", icon: "🏆" },
        { key: "FREE_CANCELLATION", label: "Free cancellation any time", icon: "🔄" },
        { key: "GIFT_VOUCHER", label: "Monthly ₹200 gift voucher", icon: "🎁" },
        { key: "CONCIERGE", label: "Personal travel concierge", icon: "🤵" },
      ],
    },
  ];

  for (const op of [kpn, vrl, srs]) {
    for (const od of offerDefs) {
      const { perks, ...offerData } = od;
      const existing = await prisma.offerTemplate.findFirst({
        where: { operatorId: op.id, level: od.level },
      });
      let offer;
      if (existing) {
        offer = existing;
      } else {
        offer = await prisma.offerTemplate.create({
          data: {
            ...offerData,
            operatorId: op.id,
            isActive: true,
          },
        });
        await prisma.perk.createMany({
          data: perks.map((p) => ({
            operatorId: op.id,
            offerId: offer.id,
            key: p.key,
            label: p.label,
            icon: p.icon,
          })),
        });
      }
    }
  }
  console.log("✅ Offer templates + perks created for all operators");

  // ── 9. Summary ───────────────────────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  Seed complete!

  TEST ACCOUNTS
  ─────────────────────────────────────────────
  Admin      admin@urroute.in      Admin@1234
  Agent 1    agent1@urroute.in     Agent@1234
  Agent 2    agent2@urroute.in     Agent@1234
  Operator 1 kpn@urroute.in        Operator@1234   (KPN Travels)
  Operator 2 vrl@urroute.in        Operator@1234   (VRL Travels)
  Operator 3 srs@urroute.in        Operator@1234   (SRS Travels)
  Traveler 1 traveler1@urroute.in  Travel@1234
  Traveler 2 traveler2@urroute.in  Travel@1234

  ROUTES
  ─────────────────────────────────────────────
  Chennai → Bengaluru / Coimbatore
  Bengaluru → Chennai / Hyderabad / Mumbai
  Hyderabad → Chennai / Vijayawada / Bengaluru
  (3 trips each, next 14 days)

  LOYALTY LEVELS (all 3 operators)
  ─────────────────────────────────────────────
  L1 Welcome Offer  — 10% off
  L2 Stay Reward    — 15% off
  L3 Loyalty Bonus  — 20% off + free cancellation
  L4 Champion Deal  — ₹500 flat off
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
