# Admin Team Management Guide

## Overview

The ezLegal.ai platform includes a user-friendly interface for managing admin access. This allows you to grant or revoke admin privileges without writing SQL queries.

## Accessing Admin Team Management

1. Log in as an admin user
2. Navigate to `/admin`
3. Click "Admin Team Access" in the left sidebar (marked with a crown icon)

## Features

### View Admin Status
- **Admin Users**: Displayed at the top with amber/gold styling and crown icons
- **Regular Users**: Listed below with standard styling
- **Active Count**: Shows total number of current admins

### Grant Admin Access
1. Find the user in the "Regular Users" section
2. Click the "Grant Admin" button
3. Confirm the action in the popup dialog
4. User will see admin access after logging out and back in

### Revoke Admin Access
1. Find the user in the "Admin Users" section
2. Click the "Revoke Admin" button
3. Confirm the action in the popup dialog
4. User will lose admin access after logging out and back in

### Search Users
- Use the search bar to filter by name or email
- Search works across both admin and regular users
- Real-time filtering as you type

## Important Rules

### Security Restrictions
- **Cannot remove your own admin access** - Prevents accidental lockout
- **Must confirm all changes** - Prevents accidental grants/revokes
- **Changes require re-login** - Users must log out and back in to see changes

### What Admins Can Do
Once granted admin access, users can:
- Access the full `/admin` panel
- View and edit all user profiles
- Manage subscriptions and tiers
- Access system analytics and reports
- Grant/revoke admin access to others
- View audit logs
- Configure system settings

## Best Practices

### Grant Admin Access Only When Needed
- Admins have full access to all system data
- Only grant to trusted team members
- Review admin list regularly

### Document Admin Changes
- Keep a record of who granted admin access and when
- Use the audit log at `/admin/audit-log` to track changes
- Consider having a team policy for admin grants

### Regular Audits
Periodically review your admin users:
1. Go to Admin Team Access
2. Check if all listed admins still need access
3. Revoke access for former team members
4. Verify contact information is current

## SQL Alternative (If UI Not Available)

If you need to grant admin access via SQL:

```sql
-- Grant admin to specific email
UPDATE profiles
SET is_admin = true
WHERE email = 'teammate@example.com';

-- Revoke admin access
UPDATE profiles
SET is_admin = false
WHERE email = 'former-admin@example.com';

-- List all current admins
SELECT email, full_name, created_at
FROM profiles
WHERE is_admin = true
ORDER BY created_at DESC;
```

## Troubleshooting

### Changes Not Showing
**Problem**: User granted admin access but can't see admin panel

**Solutions**:
1. User must log out completely
2. Clear browser cache and cookies
3. Log back in
4. Verify `is_admin = true` in database

### Cannot Grant Admin Access
**Problem**: "Grant Admin" button not working

**Solutions**:
1. Ensure you are logged in as an admin
2. Check browser console for errors
3. Verify database connection
4. Try using SQL method as fallback

### Accidental Lockout
**Problem**: Last admin accidentally removed

**Solutions**:
1. Use Supabase Dashboard to restore admin access:
   - Go to Table Editor > profiles
   - Find your user record
   - Set `is_admin = true`
2. Or use SQL Editor to run:
   ```sql
   UPDATE profiles
   SET is_admin = true
   WHERE email = 'your-email@example.com';
   ```

## Initial Setup

### First Admin User
When setting up a new system, the first admin must be created via SQL:

```sql
-- Make yourself the first admin
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

After this, you can use the UI to grant admin access to other team members.

### Bulk Admin Grants
For onboarding multiple admins at once:

```sql
UPDATE profiles
SET is_admin = true
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);
```

## Security Considerations

### Audit Trail
All admin actions are logged in the system:
- User who made the change
- Timestamp of change
- Action performed (grant/revoke)
- Target user affected

View logs at `/admin/audit-log`

### Access Control
- Admin status is stored in `profiles.is_admin` column
- Protected by Row Level Security (RLS) policies
- Only admins can modify admin status
- Changes are immediately reflected in database

### Recommendations
1. Use strong passwords for admin accounts
2. Enable 2FA when available
3. Review admin access quarterly
4. Limit number of admins to essential personnel
5. Document admin responsibilities

## Support

### Need Help?
- Check the main `TEAM_ACCESS_GUIDE.md` for general access info
- Review `DEVELOPER_GUIDE.md` for technical details
- Contact system administrator for access issues

### Reporting Issues
If you encounter problems with admin management:
1. Note the specific error message
2. Check browser console for technical details
3. Document steps to reproduce
4. Contact technical support with details
