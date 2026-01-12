# 🔧 Notion Embed Setup Guide - Fix "refused to connect" Error

## 🚨 **The Problem**
Getting "www.notion.com refused to connect" error when trying to embed Notion databases in iframes.

## ✅ **The Solution**

### **Step 1: Make Notion Databases Public**

For each database, you need to:

1. **Open your Notion database**
2. **Click "Share" button** (top right)
3. **Toggle "Share to web"** - this makes it publicly accessible
4. **Copy the public link** - it should look like: `https://www.notion.so/username/database-name-32characterid`

### **Step 2: Extract Database IDs**

From the public link, extract the **32-character database ID**:

**Example:**
- Public Link: `https://www.notion.so/idyll/Tasks-2cc28c5fb67380b6b9eadeea94981afb`
- Database ID: `2cc28c5fb67380b6b9eadeea94981afb`

### **Step 3: Current Database URLs (Updated with Your Workspace)**

The following URLs are now hardcoded in the components:

```
Tasks Database: https://idyllproductionsevo.notion.site/ebd//2cc28c5fb67380b6b9eadeea94981afb?v=2cc28c5fb67380e481ef000c6254bab6
Meetings Database: https://idyllproductionsevo.notion.site/ebd//2e628c5fb67380e58d64eef87105515d?v=2e628c5fb67380a8ad7f000c8e26beea
Payouts Database: https://idyllproductionsevo.notion.site/ebd//2e628c5fb67380568bd2ef6a1eb05965?v=2e628c5fb673801bb2ae000c1b309c09
Applications Database: https://idyllproductionsevo.notion.site/ebd//2e628c5fb6738005950fdadb6dcd2ba3?v=2e628c5fb6738051b69a000c7b48dee1
Notifications Database: https://idyllproductionsevo.notion.site/ebd//2e628c5fb673807fbf92f7fbd55fa913?v=2e628c5fb6738051a83b000c444903f6
```

### **Step 4: Verify Database Structure**

Make sure each database has the required properties:

#### **Tasks Database:**
- `Task Number` (Number)
- `Name` (Text)
- `Assigned To` (Email)
- `Status` (Select): Pending, In Progress, Completed
- `Priority` (Select): Low, Medium, High
- `Deadline` (Date)
- `Raw File` (URL)
- `Edited File` (URL)

#### **Meetings Database:**
- `Title` (Text)
- `Date` (Date)
- `Time` (Text)
- `Attendees Emails` (Multi-select)
- `Attendees Names` (Multi-select)
- `Organizer` (Text)
- `Link` (URL)

#### **Payouts Database:**
- `Project` (Text)
- `Editor Email` (Email)
- `Editor Name` (Text)
- `Amount` (Number)
- `Status` (Select): Pending, Approved, Paid, Rejected
- `Edited Link` (URL)
- `Payment Method` (Text)
- `Requested Date` (Date)

#### **Applications Database:**
- `Name` (Text)
- `Email` (Email)
- `Status` (Select): Pending, Approved, Rejected
- `Software` (Text)
- `Role` (Text)
- `Portfolio` (URL)
- `Location` (Text)
- `Contact` (Text)
- `Applied Date` (Date)

#### **Notifications Database:**
- `Title` (Text)
- `Message` (Text)
- `Type` (Select): task, meeting, payout, user, info
- `Urgent` (Checkbox)
- `Time` (Text)

---

## 🔧 **Fixed Embed URLs**

The embed URLs have been updated to the correct format and hardcoded:

### **Before (Broken):**
```
https://www.notion.so/embed/DATABASE_ID?embed=true&v=table
```

### **After (Working):**
```
https://www.notion.so/DATABASE_ID?v=table&embed=true
```

### **Enhanced iframe attributes:**
- Added `allow-top-navigation` to sandbox
- Added `loading="lazy"` for better performance
- Improved sandbox permissions

---

## 🧪 **Testing the Fix**

### **1. Test Individual Database Access:**

Open these URLs in your browser to verify they're publicly accessible:

```
https://idyllproductionsevo.notion.site/ebd//2cc28c5fb67380b6b9eadeea94981afb?v=2cc28c5fb67380e481ef000c6254bab6
https://idyllproductionsevo.notion.site/ebd//2e628c5fb67380e58d64eef87105515d?v=2e628c5fb67380a8ad7f000c8e26beea
https://idyllproductionsevo.notion.site/ebd//2e628c5fb67380568bd2ef6a1eb05965?v=2e628c5fb673801bb2ae000c1b309c09
https://idyllproductionsevo.notion.site/ebd//2e628c5fb6738005950fdadb6dcd2ba3?v=2e628c5fb6738051b69a000c7b48dee1
https://idyllproductionsevo.notion.site/ebd//2e628c5fb673807fbf92f7fbd55fa913?v=2e628c5fb6738051a83b000c444903f6
```

### **2. Test in Website:**

1. **Build and run the website**
2. **Navigate to Editor Dashboard**
3. **Check each section**: My Tasks, Meeting Calendar, Payout Management
4. **Verify Notion embeds load without "refused to connect" error**

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "refused to connect"**
**Cause:** Database not publicly shared
**Solution:** Follow Step 1 above - make sure "Share to web" is enabled

### **Issue 2: "Page not found"**
**Cause:** Wrong database ID
**Solution:** Double-check the 32-character ID from the public link

### **Issue 3: "Access denied"**
**Cause:** Database permissions not set correctly
**Solution:** Ensure the database is shared publicly, not just with specific people

### **Issue 4: Embed shows but no data**
**Cause:** Database is empty or properties don't match
**Solution:** Add sample data and verify property names match the code

### **Issue 5: Still getting "refused to connect" after making public**
**Cause:** Browser cache or Notion propagation delay
**Solution:** 
- Clear browser cache and cookies
- Wait 5-10 minutes for Notion to propagate changes
- Try opening the direct URL in incognito mode
- Verify the database is actually public by opening in a different browser

---

## 📋 **Checklist for Success**

- [ ] All 5 databases are publicly shared ("Share to web" enabled)
- [ ] Database IDs match the hardcoded ones in the components
- [ ] Database properties match the required structure
- [ ] Sample data exists in each database
- [ ] Direct embed URLs work in browser (test the URLs above)
- [ ] Website builds without errors
- [ ] Embeds load in the browser without "refused to connect"
- [ ] Clear browser cache if still having issues

---

## 🎯 **Expected Result**

After following this guide, you should see:

✅ **Editor Dashboard:**
- My Tasks: Live Notion database showing user's assigned tasks
- Meeting Calendar: Live Notion database showing user's meetings
- Payout Management: Live Notion database showing user's payouts

✅ **Management Panel:**
- Task Management: Live Notion database showing all tasks
- Meeting Management: Live Notion database showing all meetings
- Payout Management: Live Notion database showing all payouts

All embeds should load instantly with no "refused to connect" errors! 🚀

---

## 🔄 **If Still Not Working**

1. **Double-check database sharing:**
   - Open each database in Notion
   - Click "Share" → Ensure "Share to web" is ON
   - Copy the public link and verify it contains the correct ID

2. **Test direct access:**
   - Open the embed URLs above in a new browser tab
   - If they don't work, the database isn't properly shared

3. **Clear everything:**
   - Clear browser cache and cookies
   - Hard refresh the website (Ctrl+F5)
   - Try in incognito/private mode

4. **Verify database structure:**
   - Ensure all required properties exist
   - Add at least one row of sample data to each database

The fix is now implemented with hardcoded database IDs and improved iframe attributes!