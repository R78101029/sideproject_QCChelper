import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sys_admin account
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      displayName: '系統管理員',
      role: 'sys_admin',
      department: '資訊室',
    },
  })
  console.log(`Created admin: ${admin.username}`)

  // Create demo team_rep account
  const demoPassword = await bcrypt.hash('demo123', 10)
  const demoUser = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      passwordHash: demoPassword,
      displayName: '王小明',
      role: 'team_rep',
      department: '護理部',
    },
  })
  console.log(`Created demo user: ${demoUser.username}`)

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: '降低住院病人跌倒發生率',
      circleName: '安心圈',
      department: '護理部',
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-06-30'),
      status: 'active',
      themeType: 'reduction',
      topicCategory: '病人安全',
      createdBy: demoUser.id,
    },
  })
  console.log(`Created demo project: ${project.name}`)

  // Link demo user to project
  await prisma.userCircle.upsert({
    where: { userId_projectId: { userId: demoUser.id, projectId: project.id } },
    update: {},
    create: {
      userId: demoUser.id,
      projectId: project.id,
      memberRole: 'leader',
    },
  })

  // Create default system settings
  const defaultSettings = [
    { key: 'session_timeout_hours', value: '8', description: 'Session 過期時間（小時）' },
    { key: 'stall_alert_days', value: '14', description: '卡關預警天數' },
    { key: 'hospital_name', value: '', description: '醫院名稱（報告用）' },
    { key: 'hospital_logo_path', value: '', description: '院徽圖片路徑' },
    { key: 'report_header_text', value: '', description: '報告頁首文字' },
    { key: 'report_footer_text', value: '', description: '報告頁尾文字' },
  ]

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        ...setting,
        updatedBy: admin.id,
      },
    })
  }
  console.log(`Created ${defaultSettings.length} system settings`)

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
