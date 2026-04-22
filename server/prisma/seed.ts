import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/utils/prisma';

async function createUsers() {
  const users: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }[] = [
      { name: 'Admin User', email: 'admin@admin.com', password: 'admin@admin', role: 'ADMIN' },
      { name: 'Student User', email: 'student@student.com', password: 'admin@admin', role: 'STUDENT' },
      { name: 'Moderator User', email: 'moderator@example.com', password: 'Mod@123456', role: 'MODERATOR' },
      { name: 'Contributor User', email: 'contributor@example.com', password: 'Contrib@123456', role: 'CONTRIBUTOR' },
    ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role, // Update role if user exists
        password: passwordHash,
        emailVerified: true,
        isActive: true,
        isBlocked: false,
      },
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
        emailVerified: true,
        isActive: true,
        isBlocked: false,
      },
    });
  }
}

createUsers()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    console.log("Created Users");
    await prisma.$disconnect();
  });
