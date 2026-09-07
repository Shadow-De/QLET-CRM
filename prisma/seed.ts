import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash default password with bcrypt cost factor 12
  const defaultPassword = "ChangeMe#2024!";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  // Upsert the default agent
  const agent = await prisma.agent.upsert({
    where: { email: "director@qletlettings.com" },
    update: {},
    create: {
      email: "director@qletlettings.com",
      passwordHash,
      name: "Branch Director",
      role: "admin",
    },
  });

  // Create default settings if not exists
  await prisma.agentSettings.upsert({
    where: { agentId: agent.id },
    update: {},
    create: {
      agentId: agent.id,
      defaultLinkExpiryDays: 7,
      emailOnNewLead: true,
      hasSeenTour: false,
    },
  });

  console.log("✅ Seeded default agent:");
  console.log("   Email:    director@qletlettings.com");
  console.log(`   Password: ${defaultPassword}`);
  console.log("   ⚠️  Change this password immediately after first login!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
