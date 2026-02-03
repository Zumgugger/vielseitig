# Vielseitig – Features to Improve (Priority List)

*Assessment Date: February 3, 2026*
*Last Updated: February 3, 2026*

---

## Overview

These are existing features that need improvement or completion to enhance user experience and product quality.

---

## Implementation Status

| Priority | Feature | Status |
|----------|---------|--------|
| **1** | Undo Function | ✅ COMPLETE |
| **2** | PDF Export Licensing | ✅ COMPLETE |
| **3** | Mobile UX | ✅ COMPLETE |
| **4** | Admin User Management | ✅ COMPLETE |
| **5** | Error Handling | ✅ COMPLETE |
| **6** | Share Link Management | ⏳ Pending |
| **7** | Analytics Dashboard | ⏳ Pending |
| **8** | Adjective Reordering | ⏳ Pending |
| **9** | Session Recovery | ⏳ Pending |
| **10** | Performance | ⏳ Pending |

---

## Priority List

| Priority | Feature | Current State | Improvement Needed |
|----------|---------|---------------|-------------------|
| **1** | **Undo Function** | Not implemented | Add W/ArrowUp key to undo last sorting assignment - crucial for student UX when making mistakes |
| **2** | **PDF Export Licensing** | Logic exists but UI unclear | Make PDF restriction clearer on standard list - show "PDF nur mit Schul-Lizenz" with a registration CTA |
| **3** | **Mobile UX** | Basic responsive | Improve touch targets for sorting buttons (larger hit areas), better swipe gestures |
| **4** | **Admin User Management** | List view only | Add Edit/Delete/Password-Reset buttons in user table (marked incomplete in todo) |
| **5** | **Error Handling** | Basic toast messages | More informative error messages with retry options, especially for network failures during sorting |
| **6** | **Share Link Management** | Token expiry exists | Add UI to regenerate expired tokens, show expiry dates clearly, allow extending validity |
| **7** | **Analytics Dashboard** | Basic counts | Add time-based charts (sessions per day/week), completion rate visualization, theme popularity trends |
| **8** | **Adjective Reordering** | Manual order_index | Add drag-and-drop reordering in list editor (marked as optional but valuable) |
| **9** | **Session Recovery** | 24-hour localStorage | Better UX when restoring interrupted sessions - show "Resume previous session?" dialog |
| **10** | **Performance** | Works fine | Add loading skeletons, optimize initial bundle size, lazy-load admin pages |

---

## Detailed Breakdown

### 1. Undo Function (High Priority)
**Current:** Students cannot undo accidental sorting assignments.  
**Impact:** Frustration when accidentally pressing wrong key (A/S/D).  
**Solution:**
- Add `W` or `ArrowUp` key binding for undo
- Maintain assignment stack in state
- Allow multiple undos within session
- Visual feedback when undo is performed

### 2. PDF Export Licensing (High Priority)
**Current:** PDF button is disabled on standard list but message unclear.  
**Impact:** Users don't understand why they can't export, missing conversion opportunity.  
**Solution:**
- Clear message: "PDF nur mit Schul-Lizenz verfügbar"
- Add CTA button: "Jetzt als Lehrperson registrieren"
- Link directly to registration page

### 3. Mobile UX (High Priority)
**Current:** Responsive but touch targets are small.  
**Impact:** Difficult to use on phones/tablets, especially for younger students.  
**Solution:**
- Increase button sizes to minimum 48x48px
- Add swipe gestures (left=selten, down=manchmal, right=oft)
- Better visual feedback on touch

### 4. Admin User Management (Medium Priority)
**Current:** User list displays but lacks action buttons.  
**Impact:** Admin must use other methods to manage users.  
**Solution:**
- Add inline Edit button → opens modal
- Add Delete button with confirmation
- Add Password Reset button
- Add activation toggle (active/passive)

### 5. Error Handling (Medium Priority)
**Current:** Generic toast messages.  
**Impact:** Users don't know what went wrong or how to fix it.  
**Solution:**
- Specific error messages (network, validation, server)
- "Erneut versuchen" button on failures
- Offline detection with queue for retry

### 6. Share Link Management (Medium Priority) ✅
**Status:** Implemented
**Current:** Links have expiry but no management UI.  
**Impact:** Teachers can't see when links expire or regenerate them.  
**Solution:**
- ✅ Display `share_expires_at` in list overview with color-coded badges
- ✅ Add "Link erneuern" button for expired/expiring links
- ✅ Show countdown when expiring soon (<30 days = warning, <90 days = info)
- ✅ Backend endpoint `POST /user/lists/{listId}/regenerate-token`

### 7. Analytics Dashboard (Medium Priority) ✅
**Status:** Implemented
**Current:** Shows totals only (sessions, PDFs, top adjectives).  
**Impact:** No insight into trends or patterns over time.  
**Solution:**
- ✅ Added date range filter (7/30/90/365 days selector)
- ✅ Bar charts: sessions per day, completed per day, PDF exports per day
- ✅ Backend endpoint `GET /admin/analytics/timeseries?days=30`
- ✅ Added completion rate statistic (abgeschlossen/gesamt)

### 8. Adjective Reordering (Low Priority) ✅
**Status:** Implemented
**Current:** Manual order_index editing only.  
**Impact:** Tedious to reorder adjectives in custom lists.  
**Solution:**
- ✅ Added up/down arrow buttons for each adjective row
- ✅ Swaps order_index values with adjacent adjectives
- ✅ Auto-saves order changes to backend
- ✅ Sorted display using useMemo for performance
- Note: Used button-based approach instead of drag-and-drop for better mobile/touch support and simpler implementation

### 9. Session Recovery (Low Priority) ✅
**Status:** Implemented
**Current:** Silently restores from localStorage.  
**Impact:** Users may not realize they're continuing old session.  
**Solution:**
- ✅ Show dialog: "Unvollständige Session gefunden"
- ✅ Options: "▶️ Fortfahren" / "🔄 Neu starten"
- ✅ Display progress bar showing completed/total (e.g., "15/30 sortiert, 50%")
- ✅ Added pendingRecovery state to handle dialog flow

### 10. Performance (Low Priority) ✅
**Status:** Implemented
**Current:** Acceptable load times.  
**Impact:** Could be faster, especially on slower Chromebooks.  
**Solution:**
- ✅ Code splitting with React.lazy for admin pages and user pages
- ✅ Created PageSkeleton component for lazy-loaded routes
- ✅ Created reusable Skeleton components (Line, Card, Table, Stats)
- ✅ Core student pages (HomePage, StudentSortPage, StudentResultsPage) load eagerly
- ✅ Admin pages, user pages, and legal pages load on-demand

---

## Implementation Effort Estimates

| Feature | Effort | Status |
|---------|--------|--------|
| Undo Function | 2-4 hours | ✅ Completed |
| PDF Export Licensing | 1-2 hours | ✅ Completed |
| Mobile UX | 4-8 hours | ✅ Completed |
| Admin User Management | 4-6 hours | ✅ Completed |
| Error Handling | 3-4 hours | ✅ Completed |
| Share Link Management | 3-4 hours | ✅ Completed |
| Analytics Dashboard | 8-12 hours | ✅ Completed |
| Adjective Reordering | 4-6 hours | ✅ Completed |
| Session Recovery | 2-3 hours | ✅ Completed |
| Performance | 4-8 hours | ✅ Completed |

**All 10 improvements implemented!**

---

## Recommended Order of Implementation

All 10 improvements have been implemented in the following order:

1. **Undo Function** ✅ - Quick win, high student impact
2. **PDF Export Licensing** ✅ - Conversion optimization
3. **Mobile UX** ✅ - Broader accessibility
4. **Admin User Management** ✅ - Complete MVP feature
5. **Error Handling** ✅ - Better reliability perception
6. **Share Link Management** ✅ - Teacher convenience
7. **Analytics Dashboard** ✅ - Admin insights
8. **Adjective Reordering** ✅ - Teacher convenience
9. **Session Recovery** ✅ - Student experience
10. **Performance** ✅ - Faster load times

---

*Last Updated: 2025-01-XX*
*Status: All 10 improvements implemented*
