# Services Module Testing Guide

## Manual Testing Checklist

### ✅ Service Catalogs
- [ ] Navigate to Services → Service Catalogs tab
- [ ] Click "Add Service Catalog"
- [ ] Fill in: Name="Pig Distribution", Unit="head", Description="Distribution of pigs to beneficiaries"
- [ ] Save and verify it appears in the table
- [ ] Click Edit button and modify the description
- [ ] Save and verify changes
- [ ] Check that Active/Inactive toggle works

### ✅ Service Events - Creation
- [ ] Navigate to Services → Service Events tab
- [ ] Click "Create Service Event" button
- [ ] **Step 1: Service Details**
  - [ ] Select a service catalog
  - [ ] Enter barangay name
  - [ ] Select a date
  - [ ] Add optional remarks
  - [ ] Verify validation (try skipping required fields)
- [ ] **Step 2: Beneficiaries**
  - [ ] Add a beneficiary
  - [ ] Enter quantity and species
  - [ ] Verify beneficiary appears in table
  - [ ] Remove a beneficiary
  - [ ] Skip this step (optional)
- [ ] **Step 3: Inventory**
  - [ ] Add an inventory item
  - [ ] Enter quantity used
  - [ ] Verify cost calculation
  - [ ] Remove an item
  - [ ] Skip this step (optional)
- [ ] **Step 4: Review**
  - [ ] Verify all information is correct
  - [ ] Click "Create Event"
  - [ ] Verify success message
  - [ ] Check that event appears in Active Events table

### ✅ Service Events - Viewing
- [ ] Navigate to Active Events
- [ ] Click the eye icon on an event
- [ ] Verify Details tab shows:
  - [ ] Service type
  - [ ] Location
  - [ ] Date
  - [ ] Coordinator name
  - [ ] Remarks
- [ ] Switch to Beneficiaries tab
  - [ ] Verify beneficiary list
  - [ ] Check quantities
  - [ ] Verify species information
- [ ] Switch to Inventory tab
  - [ ] Verify inventory items
  - [ ] Check quantities used
  - [ ] Verify remarks

### ✅ Service Events - Editing
- [ ] Open an active event
- [ ] Click "Edit" button in Details tab
- [ ] Modify barangay, date, or remarks
- [ ] Save changes
- [ ] Verify updates appear
- [ ] Try adding a beneficiary from details modal
- [ ] Try adding inventory from details modal
- [ ] Verify both are added successfully

### ✅ Service Events - Status Management
- [ ] Open an active event (pending or ongoing)
- [ ] Click "Complete Event" button
- [ ] Confirm the action
- [ ] Verify event moves to Event History
- [ ] Navigate to Event History tab
- [ ] Verify completed event appears there
- [ ] Try to edit completed event (should be read-only or restricted)

### ✅ Service Events - Deletion
- [ ] In Active Events, click delete button on an event
- [ ] Confirm deletion
- [ ] Verify event is removed
- [ ] Try to delete a completed event (should fail)

### ✅ Search and Filtering
- [ ] Test search in Service Events
  - [ ] Search by service name
  - [ ] Search by barangay
  - [ ] Search by status
  - [ ] Verify results update in real-time
- [ ] Test search in Service Catalogs
  - [ ] Search by catalog name
  - [ ] Search by description
  - [ ] Verify results

### ✅ Pagination
- [ ] If more than 10 events exist:
  - [ ] Verify pagination controls appear
  - [ ] Navigate to next page
  - [ ] Change rows per page
  - [ ] Verify data updates correctly

### ✅ Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Verify tables are scrollable
- [ ] Verify modals are readable
- [ ] Check that buttons are accessible

### ✅ Error Handling
- [ ] Try creating event without required fields
  - [ ] Verify validation messages
- [ ] Try adding beneficiary with invalid ID
  - [ ] Verify error message
- [ ] Try adding more inventory than available
  - [ ] Verify validation error
- [ ] Disconnect internet and perform action
  - [ ] Verify error message appears
- [ ] Verify error messages are clear and helpful

### ✅ Performance
- [ ] Load page with 100+ events
  - [ ] Verify page loads within 3 seconds
  - [ ] Check that pagination works
- [ ] Create event with 20 beneficiaries
  - [ ] Verify smooth creation
- [ ] Open details of event with many items
  - [ ] Verify smooth loading

## API Endpoint Testing

### Service Catalogs
```bash
# List catalogs
curl -X GET http://localhost:8000/api/service-catalogs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create catalog
curl -X POST http://localhost:8000/api/service-catalogs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pig Distribution","unit":"head","description":"Test"}'

# Update catalog
curl -X PUT http://localhost:8000/api/service-catalogs/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete catalog
curl -X DELETE http://localhost:8000/api/service-catalogs/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Service Events
```bash
# List events
curl -X GET http://localhost:8000/api/service-events \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create event
curl -X POST http://localhost:8000/api/service-events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_catalog_id":1,"barangay":"Test","service_date":"2024-01-01","remarks":"Test"}'

# Get event details
curl -X GET http://localhost:8000/api/service-events/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update event
curl -X PUT http://localhost:8000/api/service-events/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete event
curl -X DELETE http://localhost:8000/api/service-events/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Event Beneficiaries
```bash
# Add beneficiary
curl -X POST http://localhost:8000/api/service-events/1/beneficiaries \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"beneficiary_id":1,"species":"Pig","quantity":2}'

# Remove beneficiary
curl -X DELETE http://localhost:8000/api/service-events/1/beneficiaries/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Event Inventory
```bash
# Add inventory
curl -X POST http://localhost:8000/api/service-events/1/stocks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inventory_stock_id":1,"quantity_used":5}'

# Remove inventory
curl -X DELETE http://localhost:8000/api/service-events/1/stocks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Browser Console Testing

Open browser console (F12) and check for:
- [ ] No console errors on page load
- [ ] No console warnings about missing props
- [ ] No console errors when creating events
- [ ] No console errors when viewing events
- [ ] Verify API calls are being made correctly
- [ ] Check that loading states work properly

## Expected Results

### After Full Implementation
1. **Service Catalogs**: User can create, edit, delete, and manage service types
2. **Service Events**: User can create events with multi-step wizard
3. **Beneficiary Management**: User can add/remove beneficiaries to/from events
4. **Inventory Integration**: User can link inventory items to events
5. **Event Completion**: User can mark events as completed
6. **History Tracking**: Completed events appear in history tab
7. **Details View**: Comprehensive modal shows all event information
8. **Search**: Fast and accurate search across events and catalogs
9. **Responsive**: Works on all device sizes
10. **Error Handling**: Clear error messages for all failures

## Known Issues / Future Improvements

### Current Limitations
- Beneficiary autocomplete requires pre-fetching all beneficiaries
- Inventory selection requires knowing stock IDs
- No bulk operations for beneficiaries
- No export to PDF functionality
- No photo upload during event creation

### Recommended Enhancements
1. Add beneficiary search with autocomplete from API
2. Add inventory search with visual cards
3. Add bulk import for beneficiaries (CSV)
4. Add event calendar view
5. Add print/PDF export for event reports
6. Add photo upload for event documentation
7. Add QR code scanning for inventory
8. Add SMS notifications to beneficiaries
9. Add event templates for common services
10. Add analytics dashboard for service trends

## Performance Benchmarks

Target performance metrics:
- Page load: < 2 seconds
- Event creation: < 1 second
- Search results: < 500ms
- Modal open: < 300ms
- Table pagination: < 200ms

## Accessibility Testing

- [ ] All buttons have descriptive labels
- [ ] All form fields have labels
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators are visible

## Security Testing

- [ ] API calls include authentication tokens
- [ ] User permissions are checked
- [ ] Input validation prevents XSS
- [ ] SQL injection is prevented (backend)
- [ ] CSRF protection is enabled (backend)

## Integration Testing

- [ ] Events link correctly to catalogs
- [ ] Beneficiaries link correctly to events
- [ ] Inventory links correctly to events
- [ ] Status updates propagate correctly
- [ ] Deletions cascade appropriately
- [ ] Sector filtering works correctly

## Sign-off

Tested by: _______________
Date: _______________
Environment: _______________
Browser: _______________
Result: ☐ PASS ☐ FAIL
Comments: _______________________________________________
