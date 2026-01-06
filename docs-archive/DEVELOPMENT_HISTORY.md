# Development History

This file tracks issues, bugs, fixes, and improvements made to the Paradigm Studios application.

---

## 2025-01-13 - Blog Form Media Field Validation Error

### Issue
When editing a blog post, submitting the form resulted in a 400 Bad Request error with the message: `"media" is not allowed`.

**Error Details:**
- **Location**: `pstudios-landingpage/src/admin/blog/BlogForm.js`
- **Error**: `PATCH https://api.paradigmstudios.art/api/admin/blog/{id} 400 (Bad Request)`
- **Message**: `"media" is not allowed`

### Root Cause
The `refetchMedia` function was adding a `media` field to `formData` state (line 93-96). When the form was submitted, this `media` field was included in the PATCH request body. However, the backend Joi validation schema (`backend/src/routes/admin.js`, line 111-117) only allows the following fields:
- `title`
- `subject`
- `body`
- `order`
- `isPublished`

The `media` field is not allowed in the request body (media is managed separately through the MediaUploader component).

### Solution
Modified `handleSubmit` function in `BlogForm.js` to exclude the `media` field from the request body before submission:

```javascript
// Exclude 'media' field from request body - backend schema doesn't allow it
const { media, ...submitData } = formData;

// ... then use submitData instead of formData in the fetch request
body: JSON.stringify(submitData),
```

**File Modified**: `pstudios-landingpage/src/admin/blog/BlogForm.js`
- **Line 136**: Added destructuring to exclude `media` field
- **Line 146**: Changed request body to use `submitData` instead of `formData`

### Status
✅ **Fixed** - Blog post editing now works correctly without validation errors.

---

## Template for Future Entries

### YYYY-MM-DD - [Issue Title]

#### Issue
[Description of the problem]

#### Root Cause
[What caused the issue]

#### Solution
[How it was fixed]

#### Files Modified
- `path/to/file.js` - [What was changed]

#### Status
✅ Fixed / ⏳ In Progress / ❌ Known Issue

---

