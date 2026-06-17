import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

const SUPER_EMAIL = 'yhcadmin';
const SUPER_PASSWORD = 'yhcadmin';

// 主函数负责创建或更新超级管理员账号
async function main() {
  const hashedPassword = await bcrypt.hash(SUPER_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: SUPER_EMAIL },
    update: {
      password: hashedPassword,
      name: '超级管理员',
      isPaid: true,
    },
    create: {
      email: SUPER_EMAIL,
      password: hashedPassword,
      name: '超级管理员',
      isPaid: true,
    },
  });

  console.log('Super admin ready:', {
    id: user.id,
    email: user.email,
    name: user.name,
    isPaid: user.isPaid,
  });
}

main()
  .catch((err) => {
    console.error('Failed to create super admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
