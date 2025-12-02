# Code Coverage Gaps - Path to 100%

## Current Status: 85.23% (375/440 lines)

## Files Needing Coverage:

### 1. CommentController.php - 72% (45 lines missing)
**Uncovered Lines:** 62-64, 107-118, 137-139, 168-176, 210-218, 258-267

**Missing Coverage:**
- Line 62-64: Authorization failure path (canManageComment returns false)
- Line 107-118: Exception handling in store method
- Line 137-139: Edit timeout validation error
- Line 168-176: Exception handling in update method
- Line 210-218: Exception handling in destroy method
- Line 258-267: Exception handling in replies method

**Tests Needed:**
- Test unauthorized comment creation
- Test exception during comment creation
- Test edit timeout enforcement
- Test exception during comment update
- Test exception during comment deletion
- Test exception during replies loading

### 2. Reaction.php - 50% (4 lines missing)
**Uncovered Lines:** 35, 40

**Missing Coverage:**
- Line 35: scopeOfType method return statement
- Line 40: scopeByUser method return statement

**Tests Needed:**
- Test ofType scope
- Test byUser scope

### 3. ReactionController.php - 93.9% (3 lines missing)
**Uncovered Lines:** 61, 67

**Missing Coverage:**
- Line 61: Invalid reactable type error path
- Line 67: Reactable not found error path

**Tests Already Exist** - These are covered by existing tests

### 4. Comment.php - 92.3% (2 lines missing)
**Uncovered Lines:** 70

**Missing Coverage:**
- Line 70: repliesWithReactions method

**Tests Needed:**
- Test repliesWithReactions relationship

### 5. NewCommentNotification.php - 93.8% (2 lines missing)
**Uncovered Lines:** 54

**Missing Coverage:**
- Line 54: Action URL generation

**Tests Needed:**
- Test notification action URL

### 6. HasComments.php - 93.3% (2 lines missing)
**Uncovered Lines:** 90

**Missing Coverage:**
- Line 90: addReply method return statement

**Tests Needed:**
- Test addReply return value

### 7. HasReactions.php - 95.2% (4 lines missing)
**Uncovered Lines:** 67, 162

**Missing Coverage:**
- Line 67: Unauthenticated user in userReaction method
- Line 162: Return statement in reactionsCount method

**Tests Needed:**
- Test userReaction when not authenticated
- Test reactionsCount method

### 8. LaravelReactReactionsCommand.php - 0% (3 lines missing)
**Uncovered Lines:** 15, 17

**Missing Coverage:**
- Entire command (placeholder command, low priority)

**Tests Needed:**
- Command execution test (already attempted, needs fixing)
