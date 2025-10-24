# Study Groups Troubleshooting Guide

## Issue: Detail Page Shows "Loading..." Forever

### Problem
When accessing a study group detail page (e.g., `/study-groups/:id`), the page shows "加载小组信息中..." (Loading group info...) indefinitely.

### Root Cause
The API endpoints require authentication, but the frontend was not properly handling 401 (Unauthorized) errors. When `useFetch` receives a 401 error, it doesn't automatically update the `loading` state to `false`.

### Solution Implemented

Updated [pages/study-groups/[id].vue](pages/study-groups/[id].vue:207-239) with improved error handling:

```javascript
async function loadGroup() {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await useFetch(`/api/study-groups/${groupId}`)

    if (fetchError.value) {
      // Check for authentication error
      if (fetchError.value.statusCode === 401) {
        error.value = '请先登录后查看小组详情'
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else if (fetchError.value.statusCode === 404) {
        error.value = '小组不存在或已被删除'
      } else {
        error.value = fetchError.value.data?.message || '加载小组信息失败'
      }
    } else if (data.value) {
      group.value = data.value.data
    }
  } catch (err) {
    error.value = '加载小组信息失败'
  } finally {
    loading.value = false  // Always set loading to false
  }
}
```

### How to Test

1. **If Not Logged In**:
   - Navigate to `/study-groups/:id`
   - Should see error message: "请先登录后查看小组详情"
   - Will auto-redirect to `/login` after 2 seconds

2. **If Logged In**:
   - Navigate to `/study-groups/:id`
   - Should load group details successfully
   - See group header, tabs (Discussions, Challenges), and members sidebar

### Steps to Verify Fix

1. **Clear Browser Cache**:
   ```
   - Chrome/Edge: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Or hard reload: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   ```

2. **Check Dev Server**:
   ```bash
   # Should be running on http://localhost:3001/
   # Check terminal for any errors
   ```

3. **Login First**:
   - Go to http://localhost:3001/login
   - Login with valid credentials
   - Then navigate to study groups

4. **Test Group Detail Page**:
   - Go to http://localhost:3001/study-groups
   - Click on any study group
   - Should see detail page load successfully

### Expected Behavior

#### Scenario 1: User NOT Logged In
```
1. Page shows loading spinner
2. API returns 401 error
3. Page shows error: "请先登录后查看小组详情"
4. After 2 seconds, redirects to /login
```

#### Scenario 2: User Logged In, Group Exists
```
1. Page shows loading spinner
2. API returns group data
3. Page displays:
   - Group header (name, description, member count)
   - Join/Leave button
   - Tabs: Discussions, Challenges
   - Members sidebar
```

#### Scenario 3: User Logged In, Group Doesn't Exist
```
1. Page shows loading spinner
2. API returns 404 error
3. Page shows error: "小组不存在或已被删除"
4. Shows "返回" button to go back
```

### API Requirements

All study group API endpoints require authentication:

- `GET /api/study-groups/:id` - Requires auth token in cookie/header
- `GET /api/study-groups/:id/posts` - Requires auth
- `GET /api/study-groups/:id/challenges` - Requires auth
- `GET /api/study-groups/:id/members` - Requires auth

### Authentication Flow

1. **Login Page**: `/login`
   - User enters email and password
   - Backend returns JWT token
   - Token stored in cookie: `auth-token`

2. **API Requests**:
   - All requests automatically include `auth-token` cookie
   - Backend middleware validates token
   - If valid: proceed
   - If invalid/missing: return 401

3. **Frontend Handling**:
   - Check for 401 errors
   - Show appropriate error message
   - Redirect to login if needed

### Known Issues

#### Issue 1: useFetch Doesn't Always Throw Errors
**Problem**: Nuxt's `useFetch` doesn't throw errors for HTTP status codes, it returns them in the `error` property.

**Solution**: Always check both `error.value` and `statusCode`:
```javascript
const { data, error } = await useFetch(url)
if (error.value) {
  // Handle based on error.value.statusCode
}
```

#### Issue 2: Authentication State Not Reactive
**Problem**: If user logs in on another tab, current tab doesn't know.

**Workaround**: Refresh page after login, or implement global auth state with Pinia.

### Debugging Tips

1. **Check Browser Console**:
   ```javascript
   // Look for errors like:
   "加载小组失败: { statusCode: 401, message: '请先登录' }"
   ```

2. **Check Network Tab**:
   - Open DevTools → Network
   - Filter by "XHR" or "Fetch"
   - Look for requests to `/api/study-groups/...`
   - Check status code (401, 404, 200)
   - Check response body

3. **Check Server Logs**:
   ```bash
   # Look for authentication errors
   [AUTH] Token验证失败: ...
   [AUTH] Token验证成功: ...
   ```

4. **Test API Directly**:
   ```bash
   # Without auth (should fail)
   curl http://localhost:3001/api/study-groups/:id

   # With auth cookie
   curl -b "auth-token=YOUR_TOKEN" http://localhost:3001/api/study-groups/:id
   ```

### Quick Fix Checklist

- [ ] Dev server is running
- [ ] User is logged in
- [ ] Auth token cookie exists
- [ ] Browser cache cleared
- [ ] Page hard-reloaded (Ctrl+F5)
- [ ] No JavaScript errors in console
- [ ] API returns data (check Network tab)

### If Problem Persists

1. **Restart Dev Server**:
   ```bash
   # Kill current process
   # Then restart
   npm run dev
   ```

2. **Clear All Build Artifacts**:
   ```bash
   rm -rf .nuxt .output node_modules/.vite
   npm run dev
   ```

3. **Check if Study Group Exists**:
   ```sql
   -- In Prisma Studio or database
   SELECT * FROM StudyGroup WHERE id = 'YOUR_GROUP_ID';
   ```

4. **Create Test Group**:
   - Go to `/study-groups/create`
   - Create a new group
   - Try accessing its detail page

### Related Files

- [pages/study-groups/[id].vue](pages/study-groups/[id].vue) - Main detail page
- [components/study-groups/DiscussionsTab.vue](components/study-groups/DiscussionsTab.vue) - Discussions component
- [components/study-groups/ChallengesTab.vue](components/study-groups/ChallengesTab.vue) - Challenges component
- [components/study-groups/MembersSidebar.vue](components/study-groups/MembersSidebar.vue) - Members component
- [server/api/study-groups/[id].get.ts](server/api/study-groups/[id].get.ts) - Backend API

### Contact

If issue persists after trying all steps above, check:
1. [STUDY_GROUPS_STATUS.md](STUDY_GROUPS_STATUS.md) - Overall feature status
2. [STUDY_GROUPS_FRONTEND_REBUILD_COMPLETE.md](STUDY_GROUPS_FRONTEND_REBUILD_COMPLETE.md) - Latest implementation details
3. GitHub Issues (if using version control)

---

**Last Updated**: 2025-10-23
**Status**: Issue resolved with improved error handling
