# Migration Scripts

## Fix Password Spaces

This script fixes passwords that may have been created with spaces due to a bug where linebreaks in user input were not properly sanitized.

### What it does:
1. Scans all living (non-deceased) users
2. Regenerates their password using the correct format (no spaces)
3. Updates the password hash in the database
4. Sends a password reset email to each user with their new password

### Before running:
Make sure you have:
- Environment variables set (DATABASE_URL, RESEND_API_KEY, etc.)
- Access to the production/staging database

### How to run:

```bash
# Install tsx if not already installed
npm install -D tsx

# Run the migration
npm run fix-passwords
```

### What to expect:
The script will output:
- Each user being processed
- Their new password (for your records)
- Whether the email was sent successfully
- A summary at the end with counts

### After running:
- Users who received emails can login with their new passwords
- For users whose emails failed, you'll need to manually share their passwords (shown in the output)
- All users are now using passwords without spaces

### Safety:
- Only processes living users (isDeceased: false)
- Skips placeholder emails (@memorial.family)
- All passwords are properly hashed before storage
- Shows clear output of what's happening

### Rollback:
There's no automated rollback. If you need to revert:
1. Restore database from backup before running the script
2. Or manually regenerate passwords for specific users via admin panel
