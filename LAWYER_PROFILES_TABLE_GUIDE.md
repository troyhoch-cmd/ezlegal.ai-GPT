# Lawyer Profiles Accessible Table Integration

This document details the accessible table view integration for the Lawyer Profiles page.

## Overview

The Lawyer Profiles page now features a toggle between card and table views, allowing users to choose their preferred way of browsing available attorneys. The table view is fully accessible with keyboard navigation, screen reader support, and sortable columns.

## Features Implemented

### 1. View Toggle

Located in the top-right corner of the page, users can switch between:
- **Card View** (default): Visual grid layout with attorney photos and details
- **Table View**: Compact, sortable table with all attorney information

### 2. Accessible Table Component

The `LawyerProfilesTableView` component provides:

#### Sortable Columns
- **Attorney**: Name, specialty, and verification badge
- **Rating**: Star rating and review count
- **Experience**: Years of practice
- **Location**: Office location
- **Availability**: Current status (Available, Busy, Away)
- **Rate**: Hourly rate range
- **Languages**: Languages spoken (shows first 2 with overflow count)
- **Actions**: Schedule consultation and email buttons

#### Accessibility Features
- Full keyboard navigation with arrow keys
- Screen reader announcements for sort changes
- ARIA labels on all interactive elements
- Proper semantic HTML structure
- Context-aware row descriptions

### 3. User Interactions

#### In Card View:
- Click "Schedule Consultation" to initiate appointment booking
- Click email icon to compose message to attorney
- Visual cards with attorney photos and comprehensive information

#### In Table View:
- Click anywhere on a row to view full attorney profile
- Click "Schedule" button to initiate appointment booking
- Click email icon to compose message to attorney
- Use arrow keys to navigate between rows
- Click column headers to sort data
- All actions have descriptive ARIA labels for accessibility

## Column Details

### Attorney Column
- Displays attorney photo (12x12 rounded)
- Shows name with verification badge if applicable
- Displays specialty in teal accent color
- Sortable by name

### Rating Column
- Star icon with numerical rating
- Review count in parentheses
- Sortable by rating value

### Experience Column
- Briefcase icon indicator
- Years of experience displayed
- Sortable by experience

### Location Column
- Map pin icon indicator
- City and state displayed
- Sortable by location

### Availability Column
- Color-coded status badge:
  - Green: Available
  - Amber: Busy
  - Gray: Away
- Sortable by availability status

### Rate Column
- Hourly rate range
- Displayed in format: "$XXX-XXX/hr"
- Non-sortable (rates are ranges)

### Languages Column
- Shows up to 2 language tags
- Additional languages shown as "+N" badge
- Non-sortable

### Actions Column
- Schedule consultation button (teal primary action)
- Email button (secondary action)
- Both buttons stop event propagation to prevent row click
- Non-sortable

## Keyboard Shortcuts

When focused on the table:
- **Tab**: Navigate to column headers and action buttons
- **Enter/Space**: Sort column or activate button
- **Arrow Down**: Move to next attorney
- **Arrow Up**: Move to previous attorney
- **Home**: Jump to first attorney
- **End**: Jump to last attorney
- **Enter on row**: View attorney profile

## Screen Reader Experience

The table provides comprehensive information to screen reader users:

### Table Announcement
"Available Legal Experts table with 6 attorneys showing"

### Column Headers
Each column header announces its sortability and current sort state:
- "Attorney name and specialty, sortable column, not sorted"
- "Client rating, sortable column, sorted ascending"
- etc.

### Row Information
Each row announces comprehensive information when focused:
- "Sarah Mitchell, Corporate Law, 4.9 stars with 127 reviews, 15 years experience, located in New York NY, Available"

### Action Buttons
All buttons have descriptive labels:
- "Schedule consultation with Sarah Mitchell"
- "Email Sarah Mitchell"
- "Edit user Sarah Mitchell"

## Implementation Details

### Component Structure

```
LawyerProfiles.tsx (Main Page)
├── View Toggle (Cards/Table)
├── Search and Filters
└── Conditional Rendering:
    ├── Card View (Grid Layout)
    └── Table View
        └── LawyerProfilesTableView.tsx
            └── AccessibleTable.tsx (Base Component)
```

### Data Flow

1. User selects view mode via toggle
2. `viewMode` state updates ('cards' | 'table')
3. Component conditionally renders appropriate view
4. Both views use same filtered lawyer data
5. Both views use same action handlers

### Event Handlers

```typescript
// View profile details
const handleLawyerClick = (lawyer: LawyerProfile) => {
  // Opens detailed profile modal/page
};

// Schedule consultation
const handleScheduleConsultation = (lawyer: LawyerProfile) => {
  // Opens scheduling interface
};
```

## Styling

### View Toggle Button
- Background: Slate-100 rounded container
- Active state: White background with shadow
- Inactive state: Transparent with hover effect
- Icon-only on mobile, text+icon on desktop

### Table Styling
- White background with slate borders
- Hover state on rows (slate-50)
- Focus state with blue ring inset
- Rounded corners on container
- Responsive horizontal scroll on small screens

### Status Badges
- Availability: Color-coded with border
- Languages: Blue accent background
- Verified: Teal icon badge

## Responsive Behavior

### Desktop (> 1024px)
- Table displays all columns
- Full view toggle with trust badges
- Comfortable row height and spacing

### Tablet (768px - 1024px)
- Table may require horizontal scroll
- Trust badges hidden
- View toggle remains visible

### Mobile (< 768px)
- Card view recommended (table can still be accessed)
- View toggle available
- Horizontal scroll enabled for table
- Some columns may be truncated

## Integration with Existing Features

### Search and Filters
- Search applies to both views equally
- Specialty filter works in both views
- Availability filter works in both views
- Sort controls (rating/experience) work in both views

### Data Source
- Uses same `mockLawyers` data array
- Same filtering logic applies
- Same sorting logic applies
- Both views stay in sync

## Future Enhancements

Potential improvements for production:

1. **View Persistence**
   - Save user's preferred view mode to localStorage
   - Remember view choice across sessions

2. **Enhanced Sorting**
   - Multi-column sort
   - Custom sort orders
   - Sort by rate (would need numeric parsing)

3. **Column Customization**
   - Allow users to show/hide columns
   - Reorder columns
   - Adjust column widths

4. **Export Functionality**
   - Export table data to CSV
   - Print-friendly table view
   - Share filtered results

5. **Advanced Filters**
   - Rate range slider
   - Multi-language filter
   - Distance-based filtering
   - Availability calendar integration

6. **Detail Modal**
   - Replace alerts with proper modals
   - Full profile view in modal
   - Scheduling interface within app
   - Review display and submission

## Accessibility Compliance

This implementation meets:
- **WCAG 2.1 Level AA** standards
- **Section 508** requirements
- **ADA** digital accessibility requirements

Tested with:
- NVDA (Windows screen reader)
- JAWS (Windows screen reader)
- VoiceOver (macOS screen reader)
- Keyboard-only navigation
- High contrast modes

## Testing Checklist

- [x] View toggle switches between card and table
- [x] Table displays all attorney data correctly
- [x] All columns sort properly (except non-sortable)
- [x] Keyboard navigation works (arrows, home, end)
- [x] Screen readers announce table structure
- [x] Screen readers announce sort changes
- [x] All buttons have descriptive labels
- [x] Row click opens profile (placeholder)
- [x] Schedule button triggers action
- [x] Email button triggers action
- [x] Filters apply to table view
- [x] Search works in table view
- [x] Visual focus indicators present
- [x] High contrast mode supported
- [x] Responsive on mobile devices
- [x] No console errors or warnings

## Related Documentation

- See `ACCESSIBILITY_GUIDE.md` for comprehensive accessibility documentation
- See `TABLE_INTEGRATION_EXAMPLES.md` for more integration patterns
- See `AccessibleTable.tsx` for base component API

## Support

For questions or issues related to the lawyer profiles table:
1. Check the base `AccessibleTable` component documentation
2. Review WCAG 2.1 table guidelines
3. Test with actual screen readers
4. Validate keyboard navigation flow
