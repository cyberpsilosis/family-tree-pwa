import { PrismaClient } from '@prisma/client'
import { generatePassword, hashPassword } from '../src/lib/password'
import { sendPasswordResetEmail } from '../src/lib/email'

const prisma = new PrismaClient()

interface FixResult {
  userId: string
  email: string
  firstName: string
  lastName: string
  oldPasswordFormat: string
  newPassword: string
  emailSent: boolean
}

async function fixPasswordSpaces() {
  console.log('🔍 Scanning for users with potential password issues...\n')

  try {
    // Get all users
    const users = await prisma.user.findMany({
      where: {
        isDeceased: false, // Only fix living members who need to login
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        birthYear: true,
        password: true,
      },
    })

    console.log(`Found ${users.length} living users to check\n`)

    const results: FixResult[] = []
    const errors: Array<{ user: string; error: string }> = []

    for (const user of users) {
      try {
        // Generate what the correct password should be
        const correctPassword = generatePassword(
          user.firstName,
          user.lastName,
          user.birthYear
        )

        // Check if current password might have spaces
        // We'll regenerate for all users to ensure consistency
        const newHashedPassword = await hashPassword(correctPassword)

        // Update the user's password
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHashedPassword },
        })

        console.log(`✅ Fixed: ${user.firstName} ${user.lastName} (${user.email})`)
        console.log(`   New password: ${correctPassword}`)

        // Send email notification with new password (skip placeholder emails)
        let emailSent = false
        if (user.email && !user.email.includes('@memorial.family')) {
          const emailResult = await sendPasswordResetEmail({
            to: user.email,
            firstName: user.firstName,
            newPassword: correctPassword,
          })
          emailSent = emailResult.success
          
          if (emailSent) {
            console.log(`   📧 Email sent to ${user.email}`)
          } else {
            console.log(`   ⚠️  Email failed for ${user.email}`)
          }
        }

        results.push({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          oldPasswordFormat: '***hidden***',
          newPassword: correctPassword,
          emailSent,
        })

        console.log('') // blank line for readability
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Error fixing ${user.firstName} ${user.lastName}: ${errorMsg}`)
        errors.push({
          user: `${user.firstName} ${user.lastName} (${user.email})`,
          error: errorMsg,
        })
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total users processed: ${users.length}`)
    console.log(`Successfully fixed: ${results.length}`)
    console.log(`Emails sent: ${results.filter(r => r.emailSent).length}`)
    console.log(`Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n⚠️  Errors:')
      errors.forEach(({ user, error }) => {
        console.log(`  - ${user}: ${error}`)
      })
    }

    console.log('\n✅ Migration complete!')
    console.log('\n📝 Users should use their new passwords (sent via email)')
    console.log('   If email failed, admin can share passwords manually:\n')
    
    results.forEach(result => {
      if (!result.emailSent) {
        console.log(`   ${result.firstName} ${result.lastName} (${result.email}): ${result.newPassword}`)
      }
    })

  } catch (error) {
    console.error('Fatal error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
fixPasswordSpaces()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  })
