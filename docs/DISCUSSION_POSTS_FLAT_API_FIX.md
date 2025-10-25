# Discussion Posts Flat API Migration - Complete

## Problem

Discussion posts were not opening when clicked. The error was:
```
GET http://localhost:3001/api/study-groups/[id]/posts/[postId] 500 (Server Error)
```

The issue was caused by nested dynamic routes in Nuxt 3 SSR environment returning HTML instead of JSON.

## Solution

Migrated all discussion post operations from nested dynamic routes to flat routes.

## API Files Created

### 1. Post Detail API
**File**: `server/api/study-group-post-detail.get.ts`
- **Route**: `/api/study-group-post-detail?groupId=xxx&postId=xxx`
- **Method**: GET
- **Purpose**: Load full post details with replies, poll, like/bookmark status

**Key Features**:
- Checks user membership before allowing access
- Loads post with author, replies, poll options, and vote data
- Calculates user's like/bookmark status
- Maps reply likes for each reply
- Returns processed poll with vote counts

### 2. Post Like API
**File**: `server/api/study-group-post-like.post.ts`
- **Route**: `/api/study-group-post-like`
- **Method**: POST
- **Body**: `{ groupId, postId }`
- **Purpose**: Toggle post like status

**Key Features**:
- Checks membership before allowing like
- Creates like if not exists, deletes if exists
- Returns updated like count and status

### 3. Post Bookmark API
**File**: `server/api/study-group-post-bookmark.post.ts`
- **Route**: `/api/study-group-post-bookmark`
- **Method**: POST
- **Body**: `{ groupId, postId }`
- **Purpose**: Toggle post bookmark status

**Key Features**:
- No membership check (users can bookmark any post they can see)
- Creates bookmark if not exists, deletes if exists
- Returns bookmark status

### 4. Reply Like API
**File**: `server/api/study-group-reply-like.post.ts`
- **Route**: `/api/study-group-reply-like`
- **Method**: POST
- **Body**: `{ groupId, postId, replyId }`
- **Purpose**: Toggle reply like status

**Key Features**:
- Checks membership before allowing like
- Creates like if not exists, deletes if exists
- Returns updated like count and status

### 5. Reply Creation API
**File**: `server/api/study-group-post-reply.post.ts`
- **Route**: `/api/study-group-post-reply`
- **Method**: POST
- **Body**: `{ groupId, postId, content }`
- **Purpose**: Create new reply to post

**Key Features**:
- Checks membership before allowing reply
- Validates post exists and belongs to group
- Checks if post is locked
- Returns created reply with author info

## Schema Corrections Made

During implementation, discovered and fixed multiple schema field name mismatches:

### Issue 1: Author vs User Field
**Problem**: Used `author` relation but schema has `user`
**Fix**: Changed all Prisma queries to use `user` and map to `author` in response

```typescript
// Before (wrong)
include: {
  author: { select: { id, name, avatar } }
}

// After (correct)
include: {
  user: { select: { id, name, avatar } }
}

// Response mapping for frontend compatibility
const result = {
  ...post,
  author: post.user  // Map user to author
}
```

### Issue 2: Table Name Prefixes
**Problem**: Used generic table names but schema has `StudyGroup` prefix
**Fix**: Updated all table references

```typescript
// Before (wrong)
prisma.postLike.findUnique(...)
prisma.replyLike.findUnique(...)
prisma.bookmark.findFirst(...)

// After (correct)
prisma.studyGroupPostLike.findUnique(...)
prisma.studyGroupReplyLike.findUnique(...)
prisma.studyGroupPostBookmark.findFirst(...)
```

### Issue 3: Reply Creation Field
**Problem**: Used `authorId` but schema has `userId`
**Fix**: Changed field name in reply creation

```typescript
// Before (wrong)
data: {
  postId,
  authorId: user.userId,
  content
}

// After (correct)
data: {
  postId,
  userId: user.userId,
  content
}
```

## Frontend Updates

Updated `pages/study-groups/[id]/posts/[postId].vue` to use flat route APIs:

```javascript
// Load post detail
const result = await $fetch(`/api/study-group-post-detail?groupId=${groupId}&postId=${postId}`)

// Toggle post like
await $fetch(`/api/study-group-post-like`, {
  method: 'POST',
  body: { groupId, postId }
})

// Toggle bookmark
await $fetch(`/api/study-group-post-bookmark`, {
  method: 'POST',
  body: { groupId, postId }
})

// Toggle reply like
await $fetch(`/api/study-group-reply-like`, {
  method: 'POST',
  body: { groupId, postId, replyId }
})

// Submit reply
await $fetch(`/api/study-group-post-reply`, {
  method: 'POST',
  body: { groupId, postId, content: replyContent.value }
})
```

### Issue 4: Wrong Poll Option Field Name
**Problem**: Used `displayOrder` field but schema has `order`
**Fix**: Changed poll options ordering field

```typescript
// Before (wrong)
poll: {
  include: {
    options: {
      orderBy: {
        displayOrder: 'asc'
      }
    }
  }
}

// After (correct)
poll: {
  include: {
    options: {
      orderBy: {
        order: 'asc'
      }
    }
  }
}
```

**Error message**:
```
Invalid prisma.studyGroupPost.findUnique() invocation:
Unknown argument displayOrder. Available options are marked with ?.
```

**File fixed**: `server/api/study-group-post-detail.get.ts` line 73

## Verification

- Server restarted successfully with new APIs
- Flat route APIs are being called (confirmed in logs)
- Schema field name errors fixed (author→user, table prefixes, authorId→userId, displayOrder→order)
- Server hot-reloaded successfully after poll option fix

## Status

✅ **COMPLETE** - All discussion post APIs migrated to flat routes with all schema corrections applied.

## Files Modified

1. `server/api/study-group-post-detail.get.ts` - Created & Fixed
2. `server/api/study-group-post-like.post.ts` - Created
3. `server/api/study-group-post-bookmark.post.ts` - Created
4. `server/api/study-group-reply-like.post.ts` - Created
5. `server/api/study-group-post-reply.post.ts` - Created
6. `pages/study-groups/[id]/posts/[postId].vue` - Updated to use flat APIs

## Testing Instructions

To test the fix:
1. Refresh the discussion page in the browser (hard refresh with Cmd+Shift+R or Ctrl+Shift+R)
2. Click on any post to open it
3. Verify the post details load without 500 errors
4. Test like/unlike functionality
5. Test bookmark functionality
6. Test reply creation
7. Test reply likes
8. If post has a poll, verify poll displays correctly

## Date

2025-10-25
