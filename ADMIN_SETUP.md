# Admin Panel Setup Instructions

## Overview
The admin panel has been successfully added to ezLegal.ai with comprehensive user management features.

## Features

### Admin Dashboard
- **User Statistics**: Total users, active users, suspended users
- **Subscription Analytics**: Free, Basic, and Professional tier counts
- **Real-time Data**: All statistics update automatically

### User Management
- **Search & Filter**: Search by name, email, or company; filter by status and subscription tier
- **User Actions**:
  - Edit user details (name, email, phone, company)
  - Update user status (active/suspended)
  - Change subscription tier
  - Grant/revoke admin access
  - Delete users (with confirmation)
- **User Information Display**:
  - Full name, email, company
  - Account status and subscription tier
  - Registration date
  - Last login timestamp
  - Admin badge for admin users

### Security
- Only users with `is_admin = true` can access the admin panel
- Non-admin users are automatically redirected to the home page
- Row Level Security (RLS) policies ensure admins can view/edit all users while regular users can only access their own data
- Protected route at `/admin`

## Setting Up the First Admin User

Since this is the first time setting up the admin panel, you'll need to manually promote your account to admin status.

### Step 1: Find Your User ID

1. Log into your ezLegal.ai account
2. Go to your Profile page
3. Your user ID is in the URL or you can get it from the database

### Step 2: Grant Admin Access via Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following query (replace `YOUR_USER_ID` with your actual user ID):

```sql
UPDATE profiles
SET is_admin = true
WHERE id = 'YOUR_USER_ID';
```

**OR** if you want to set admin by email:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

### Step 3: Verify Admin Access

1. Log out and log back in to refresh your session
2. You should now see an "Admin Panel" link in the sidebar navigation (with a crown icon)
3. Click on it to access the admin dashboard at `/admin`

## Admin Panel Access

Once you have admin access:

1. **From the Dashboard**: Look for "Admin Panel" in the sidebar under your profile section
2. **Direct URL**: Navigate to `https://your-domain.com/admin`

## Database Schema

The following columns have been added to the `profiles` table:

- `is_admin` (boolean): Determines if a user has admin access
- `status` (text): User account status (active, suspended)
- `subscription_tier` (text): User's subscription level (free, basic, professional)
- `last_login_at` (timestamptz): Last login timestamp

## Functions Available

- `is_admin()`: Returns true if the current user is an admin
- `get_user_stats()`: Returns aggregate statistics about all users

## Managing Other Users

Once you have admin access, you can:

1. **Promote other users to admin**: Edit a user and check the "Administrator Access" checkbox
2. **Manage subscriptions**: Change user subscription tiers directly
3. **Suspend/activate accounts**: Toggle user status with one click
4. **Delete accounts**: Remove users (cannot delete yourself)

## Security Best Practices

1. Only grant admin access to trusted individuals
2. Regularly review the list of admin users
3. Monitor user activity via the last login timestamps
4. Use the suspend feature instead of deletion when possible (preserves data)

## Troubleshooting

### "Access Denied" or Redirect to Home Page
- Verify your `is_admin` flag is set to `true` in the database
- Log out and log back in to refresh your session
- Check browser console for any error messages

### Stats Not Loading
- Ensure the `get_user_stats()` function was created properly
- Check Supabase logs for any database errors

### Cannot Edit Users
- Verify RLS policies are correctly applied
- Check that you're logged in as an admin user

## Support

For additional support or questions about the admin panel, contact the development team or refer to the main documentation.
