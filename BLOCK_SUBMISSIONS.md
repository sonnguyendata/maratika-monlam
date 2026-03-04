# Block Submissions - Event Ended

## Overview

Submissions are now automatically blocked after the event end date. The system has been updated to prevent new submissions when the event has ended.

## How It Works

### Automatic Blocking

1. **Date-based blocking**: Submissions are automatically blocked when the current date is after `EVENT_END`
2. **Manual override**: You can also set `DISABLE_SUBMISSIONS=true` to block all submissions immediately
3. **Frontend check**: The form checks submission status on load and disables the submit button
4. **Backend validation**: The API validates event dates on every submission attempt

## Environment Variables

### `EVENT_END`
- **Default**: `2026-03-18`
- **Format**: `YYYY-MM-DD`
- **Description**: Last day of the event (inclusive, until 23:59:59 GMT+7)

### `DISABLE_SUBMISSIONS` (Optional)
- **Values**: `true` or `false` (or unset)
- **Description**: When set to `true`, blocks all submissions regardless of date
- **Use case**: Immediate shutdown of submissions

## Features

### Frontend (Home Page)
- ✅ Banner message showing "Event has ended" when submissions are blocked
- ✅ Submit button is disabled and grayed out
- ✅ Form submission is prevented on client side
- ✅ Clear error messages displayed to users

### Backend (API)
- ✅ Validates event dates before processing submissions
- ✅ Returns HTTP 403 (Forbidden) with clear error message
- ✅ Logs all blocked submission attempts
- ✅ New endpoint: `/api/submit/status` to check submission availability

## API Endpoints

### Check Submission Status
```
GET /api/submit/status
```

**Response:**
```json
{
  "allowed": false,
  "event_end": "2026-03-18",
  "message": "Event has ended. Submissions are no longer accepted."
}
```

### Submit (Blocked)
```
POST /api/submit
```

**Response (when blocked):**
```json
{
  "ok": false,
  "error": "Event has ended. Submissions are no longer accepted.",
  "event_end": "2026-03-18"
}
```
**HTTP Status:** 403 Forbidden

## How to Block Submissions Immediately

### Option 1: Set Environment Variable
Add to Vercel environment variables:
```
DISABLE_SUBMISSIONS=true
```

### Option 2: Update EVENT_END
Set `EVENT_END` to a past date:
```
EVENT_END=2025-01-01
```

## Current Status

The event end date is currently set to: **November 2, 2025**

After this date (November 3, 2025 or later), all submissions will be automatically blocked.

## Files Modified

1. ✅ `src/lib/utils.ts` - Updated `validateEventDates()` function
   - Removed development mode bypass
   - Added `DISABLE_SUBMISSIONS` check
   - Improved date validation logic

2. ✅ `src/app/api/submit/route.ts` - Updated error handling
   - Returns HTTP 403 when event has ended
   - Improved error messages

3. ✅ `src/app/api/submit/status/route.ts` - New endpoint
   - Allows frontend to check submission status
   - Returns current submission availability

4. ✅ `src/app/page.tsx` - Updated frontend
   - Checks submission status on load
   - Shows banner when submissions are blocked
   - Disables submit button
   - Prevents form submission

## Testing

### Test Blocking
1. Set `DISABLE_SUBMISSIONS=true` in environment variables
2. Redeploy the application
3. Visit the homepage - should show "Event has ended" banner
4. Try to submit - should be blocked

### Test Date Validation
1. Set `EVENT_END=2025-01-01` (past date)
2. Redeploy the application
3. Try to submit - should be blocked

## Notes

- All date checks use GMT+7 (Asia/Ho_Chi_Minh) timezone
- Event end date is inclusive (submissions allowed until 23:59:59 on end date)
- The validation runs on both frontend and backend for security

