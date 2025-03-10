import { prismaClient } from '../src/config/database';
import bcrypt from 'bcrypt';

const emailAdmin = process.env.EMAIL_ADMIN || 'admin@gmail.com';
const passAdmin = process.env.PASS_ADMIN || 'admin123';

async function main() {
  // role
  const roleAdmin = await prismaClient.role.create({
    data: {
      name: 'Super Admin',
      created_by: 0
    }
  })

  // User
  const hashedPassword = await bcrypt.hash(passAdmin, 10);

  // Contoh seeder untuk menambahkan beberapa user
  await prismaClient.user.create({
    data: {
      name: 'Admin',
      email: emailAdmin,
      password: hashedPassword,
      gender: 'Male',
      birthdate: new Date('2001-01-01'),
      active: 'Active',
      role_id: roleAdmin.id,
      created_by: 0
    },
  });

  console.log('Seeder executed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
