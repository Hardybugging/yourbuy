const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@yourbuy.local" },
    update: {},
    create: {
      email: "demo@yourbuy.local",
      username: "demo",
      passwordHash,
      skills: ["Markets", "Portfolio"],
      portfolio: { create: {} },
      watchlists: { create: { name: "Default" } },
    },
  });
  console.log(`Created demo user: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
