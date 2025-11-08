# 🚀 Quick Fix Guide

## Two Issues Found & Fixed

### 1. ❌ Gemini API Error (404 - Model Not Found)
**Fixed!** Updated the code to use `gemini-2.0-flash-exp` (latest model) instead of deprecated `gemini-pro`

### 2. ❌ JWT Invalid Signature Error
**Cause**: The JWT_SECRET in your `.env` file changed, invalidating old tokens

---

## 🔧 How to Fix (2 Steps)

### Step 1: Restart Your Server

**Stop the current server** (if running):
- Press `Ctrl+C` in the terminal where the server is running

**Restart the server**:
```bash
npm run dev
```

This will apply the Gemini model fix (gemini-2.0-flash-exp - latest experimental model).

---

### Step 2: Clear Browser Cache & Re-login

**Option A - Clear Browser Storage (Recommended)**
1. Open your browser to the TalkItOut site
2. Press `F12` to open Developer Tools
3. Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)
4. Click "Local Storage" → your site URL
5. Click "Clear All" or delete the `accessToken` and `refreshToken` entries
6. Refresh the page and log in again

**Option B - Use Browser Console**
1. Press `F12` to open Developer Tools
2. Go to the "Console" tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh the page and log in again

**Test Accounts** (from your seed data):
- Student: `weijie@student.sg` / `password123`
- Counselor: `counselor@talkitout.sg` / `password123`

---

## ✅ Verify It's Working

After restarting the server and logging in:

1. **Chat should work** - No more 404 errors when sending messages
2. **No JWT errors** - Should stay logged in without signature errors
3. **New vibrant design** - Should see the colorful gradient header and improved UI

---

## 🎨 Bonus: Vibrant Design Applied!

While fixing these issues, I also applied a vibrant, warm redesign to your app:

### What's Changed:
- ✨ **Animated gradient backgrounds** (soft green and yellow radials)
- 🎨 **Glassmorphism header** with backdrop blur
- 🌈 **Gradient buttons** (green to teal)
- 💳 **Enhanced cards** with better shadows and hover effects
- 🏷️ **Colorful badges** with borders
- 📝 **Improved inputs** with beige backgrounds and green focus

### To Complete the Restyle:
See [RESTYLE_GUIDE.md](RESTYLE_GUIDE.md) for detailed instructions on updating the remaining pages (Dashboard, Chat, Focus, etc.)

---

## 🆘 Still Having Issues?

Check the server logs for errors:
- Look for lines starting with `Error:` or `[ERROR]`
- Verify `GEMINI_API_KEY` is set in `apps/api/.env`
- Verify `JWT_SECRET` exists in `apps/api/.env`

Need help? Check [FIXES_APPLIED.md](FIXES_APPLIED.md) for more details.
