# Services Management Module

## Overview
This module provides a comprehensive service event management system for agricultural services, including livestock distribution, training programs, and other service catalogs. It follows a similar structure to the Program module for consistency.

## Architecture

### Backend Integration
The module connects to the following Laravel backend endpoints:

#### Service Catalogs
- `GET /api/service-catalogs` - List all service catalogs
- `POST /api/service-catalogs` - Create new catalog
- `PUT /api/service-catalogs/{id}` - Update catalog
- `DELETE /api/service-catalogs/{id}` - Delete catalog

#### Service Events
- `GET /api/service-events` - List all service events
- `POST /api/service-events` - Create new event
- `GET /api/service-events/{id}` - Get event details
- `PUT /api/service-events/{id}` - Update event
- `DELETE /api/service-events/{id}` - Delete event

#### Event Beneficiaries
- `POST /api/service-events/{event}/beneficiaries` - Add beneficiary to event
- `DELETE /api/service-events/{event}/beneficiaries/{id}` - Remove beneficiary

#### Event Inventory
- `POST /api/service-events/{event}/stocks` - Link inventory to event
- `DELETE /api/service-events/{event}/stocks/{id}` - Unlink inventory

### Database Models
- **ServiceCatalog** - Defines types of services (e.g., "Pig Distribution", "Training")
- **ServiceEvent** - Individual service events with location and date
- **ServiceBeneficiary** - Beneficiaries participating in events
- **ServiceEventStock** - Inventory items used in events

## File Structure

```
Services/
├── index.js                              # Main container with tabs
├── PageHeader.js                         # Header with "Create Event" button
├── ComprehensiveServiceEventModal.js     # Multi-step event creation wizard
├── ServiceList.js                        # Main list with active/history tabs
├── ServiceEventTable.js                  # Active events table
├── ServiceEventHistoryTable.js           # Completed/cancelled events table
├── ServiceDetailsModal.js                # View/edit event details
├── ServiceCatalogList.js                 # Manage service catalogs
├── useServiceManagement.js               # Custom hooks for API calls
└── README.md                             # This documentation
```

## Components

### 1. index.js (Main Container)
The main entry point with two tabs:
- **Service Events** - Manage service events (active and history)
- **Service Catalogs** - Manage service types

### 2. ServiceList.js
Shows service events with two sub-tabs:
- **Active Events** - Pending, ongoing, and scheduled events
- **Event History** - Completed and cancelled events

Features:
- View event details
- Edit event information
- Complete events
- Delete events
- Real-time status updates

### 3. ServiceEventTable.js
Displays active service events in a table with:
- Service name and unit
- Location (barangay)
- Date
- Beneficiary count
- Inventory items count
- Status chip
- Action buttons (View, Edit, Complete, Delete)
- Search functionality
- Pagination

### 4. ServiceEventHistoryTable.js
Shows completed and cancelled events with:
- Read-only view
- Service details
- Completion date
- Summary information
- View details option

### 5. ServiceDetailsModal.js
Comprehensive modal for viewing/editing event details with tabs:

#### Details Tab
- Service type
- Location
- Date
- Coordinator
- Remarks
- Edit mode for updating information

#### Beneficiaries Tab
- List of beneficiaries
- Add new beneficiaries
- Quantity and species information
- Remove beneficiaries
- Status tracking

#### Inventory Tab
- Linked inventory items
- Quantity used
- Add new items
- Remove items
- Remarks for each item

### 6. ServiceCatalogList.js
Manage service catalog definitions:
- Create new service types
- Edit existing catalogs
- Activate/deactivate catalogs
- Delete catalogs
- Search functionality

### 7. ComprehensiveServiceEventModal.js
Multi-step wizard for creating service events:

**Step 1: Service Details**
- Select service catalog
- Enter barangay
- Choose date
- Add remarks

**Step 2: Beneficiaries** (Optional)
- Search and select beneficiaries
- Specify quantity
- Add species information
- Multiple beneficiaries support

**Step 3: Inventory** (Optional)
- Select inventory items
- Specify quantity used
- Add remarks
- Track costs

**Step 4: Review**
- Summary of all information
- Confirm and create

### 8. useServiceManagement.js
Custom React hooks for API integration:
- `useServiceCatalogs()` - Fetch catalogs
- `useServiceEvents()` - Fetch events
- `useCreateServiceEvent()` - Create events
- `useUpdateServiceEvent()` - Update events
- `useDeleteServiceEvent()` - Delete events
- `useCreateBeneficiary()` - Add beneficiaries
- `useCreateServiceEventStock()` - Link inventory
- `useBeneficiaries()` - Fetch beneficiary list
- `useInventoryStocks()` - Fetch inventory

## Features

### Service Event Management
1. **Create Events** - Multi-step wizard with beneficiaries and inventory
2. **View Details** - Comprehensive modal with all information
3. **Edit Events** - Update location, date, status, and remarks
4. **Complete Events** - Mark events as completed
5. **Delete Events** - Remove events (only if not completed)

### Service Catalog Management
1. **Create Catalogs** - Define new service types
2. **Edit Catalogs** - Update service information
3. **Activate/Deactivate** - Control which services are available
4. **Delete Catalogs** - Remove unused service types

### Beneficiary Tracking
1. **Add Beneficiaries** - Link farmers to events
2. **Track Quantities** - Record amounts distributed
3. **Species Information** - Specify livestock species
4. **Status Tracking** - Monitor provision status

### Inventory Integration
1. **Link Items** - Connect inventory to events
2. **Track Usage** - Record quantities used
3. **Cost Calculation** - Automatic cost tracking
4. **Stock Validation** - Prevent over-allocation

## User Workflows

### Creating a Service Event
1. Click "Create Service Event" button
2. Select service catalog (e.g., "Pig Distribution")
3. Enter barangay and date
4. Add optional remarks
5. (Optional) Add beneficiaries with quantities
6. (Optional) Link inventory items
7. Review and confirm
8. Event is created with all associations

### Viewing Event Details
1. Navigate to Service Events tab
2. Click eye icon on any event
3. View details in three tabs:
   - Details: Event information
   - Beneficiaries: List of participants
   - Inventory: Linked items
4. Edit information if event is not completed
5. Complete event when done

### Managing Service Catalogs
1. Navigate to Service Catalogs tab
2. Click "Add Service Catalog"
3. Enter service name, unit, and description
4. Set active status
5. Save catalog
6. Edit or delete as needed

## Status Flow

Events can have the following statuses:
- **Pending** - Newly created, not started
- **Ongoing** - Currently in progress
- **Scheduled** - Planned for future
- **Completed** - Successfully finished
- **Cancelled** - Cancelled or terminated

## Permissions & Security

The module respects backend permissions:
- Coordinators can only see events in their sector
- Admin users can see all events
- Completed events cannot be deleted
- Only event coordinators can modify their events

## Integration Points

### With Beneficiary System
- Links to existing beneficiary records
- Tracks which beneficiaries received services
- Records quantities and species

### With Inventory System
- Links to inventory stocks
- Tracks item usage
- Validates available quantities
- Updates stock levels

### With Document System
- Can attach documents to events
- Supports photos and PDFs
- Stores in public storage

## Best Practices

1. **Always specify service catalog** - Required for event creation
2. **Add beneficiaries during creation** - More efficient workflow
3. **Link inventory items** - Track resource usage
4. **Complete events promptly** - Keep records current
5. **Use meaningful remarks** - Add context for future reference

## Troubleshooting

### Events not loading
- Check network connection
- Verify API endpoint is accessible
- Check browser console for errors

### Cannot add beneficiaries
- Ensure beneficiary ID is valid
- Check that event is not completed
- Verify permissions

### Inventory items not showing
- Ensure inventory has available stock
- Check that items are in your sector
- Verify inventory is active

## Future Enhancements

Potential improvements:
- Export event reports to PDF
- Event calendar view
- Bulk event creation
- SMS notifications to beneficiaries
- QR code scanning for inventory
- Mobile app integration
- Real-time event tracking
- Photo upload during events
- Digital signatures from beneficiaries

## Related Documentation

- Backend API: `/workspace/agro-backend/routes/api.php`
- Models: `/workspace/agro-backend/app/Models/`
- Controllers: `/workspace/agro-backend/app/Http/Controllers/Api/`
