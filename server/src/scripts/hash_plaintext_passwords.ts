import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";

const BCRYPT_PREFIX = /^\$2[aby]\$/;

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      password: true,
    },
  });

  const plaintextUsers = users.filter((user) => !BCRYPT_PREFIX.test(user.password));

  if (plaintextUsers.length === 0) {
    console.log("No plain-text passwords found. Nothing to migrate.");
    return;
  }

  for (const user of plaintextUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }

  console.log(`Hashed passwords for ${plaintextUsers.length} user(s).`);
}

main()
  .catch((error) => {
    console.error("Failed to hash existing passwords:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
