# 🔐 Admin Credentials - UPDATED

## ✅ NEW ADMIN ACCOUNT

### **Login Credentials:**
```
Email: superadmin@srilanka.com
Password: SuperAdmin@2025
```

---

## 🔄 CHANGES MADE

### **Old Credentials (No longer valid):**
- ❌ Email: admin@srilanka.com
- ❌ Password: admin123

### **New Credentials (Active):**
- ✅ Email: superadmin@srilanka.com
- ✅ Password: SuperAdmin@2025

---

## 📝 UPDATED FILES

The following files have been updated with the new credentials:

1. ✅ **`src/pages/Login.js`** - Admin authentication logic
2. ✅ **`SECURITY.md`** - Security documentation
3. ✅ **`QUICKSTART.md`** - Quick start guide (both instances)
4. ✅ **`CHANGELOG.md`** - Change log

---

## 🎯 HOW TO LOGIN AS ADMIN

1. Go to `http://localhost:3000`
2. Click **"Login"** in the navigation bar
3. Enter the credentials:
   - **Email:** superadmin@srilanka.com
   - **Password:** SuperAdmin@2025
4. Click **"Sign In"**
5. The **"Admin"** link will appear in the navigation bar
6. Click **"Admin"** to access the dashboard

---

## 🔒 SECURITY NOTES

- Password is hashed before storage
- Only this specific email and password combination grants admin access
- All other users will have regular user role
- Admin credentials are displayed on the login page for convenience

---

## ✨ ADMIN FEATURES

Once logged in as admin, you can:
- 📊 View all bookings from all users
- 🗑️ Delete bookings
- 📥 Export booking data to JSON
- 📈 View statistics (total bookings, pending, unique customers)
- 🔍 Filter bookings by status

---

## 🔄 TO CHANGE CREDENTIALS AGAIN

If you want to change the admin credentials in the future:

1. Edit `src/pages/Login.js` (lines 77-79):
   ```javascript
   const adminEmail = 'YOUR_NEW_EMAIL@domain.com';
   const adminPasswordHash = hashPassword('YourNewPassword');
   ```

2. Update the display on login page (lines 217-219):
   ```
   Email: YOUR_NEW_EMAIL@domain.com
   Password: YourNewPassword
   ```

3. Update all documentation files:
   - SECURITY.md
   - QUICKSTART.md
   - CHANGELOG.md
   - ADMIN_CREDENTIALS.md (this file)

---

## ⚠️ IMPORTANT

**For Production:**
- Never expose admin credentials in the code
- Use environment variables
- Implement backend authentication
- Use secure password hashing (bcrypt)
- Enable 2FA for admin accounts
- Use HTTPS only
- Implement session management

---

**Last Updated:** October 16, 2025  
**Version:** 2.0 - Admin Credentials Updated  
**Status:** ✅ Active
