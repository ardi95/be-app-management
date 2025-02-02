import { prismaClient } from '../src/config/database';
import bcrypt from 'bcrypt';

const pass = process.env.PASS_ADMIN || 'admin123';

async function main() {
  const hashedPassword = await bcrypt.hash(pass, 10);

  // Contoh seeder untuk menambahkan beberapa user
  await prismaClient.user.create({
    data: {
      name: 'Admin',
      email: 'admin@arzhi.com',
      password: hashedPassword,
      gender: 'Male',
      birthdate: new Date('2001-01-01'),
      active: 'Active',
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
