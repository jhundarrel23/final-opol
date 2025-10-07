# Services Module Structure

## Component Hierarchy

```
index.js (Main Container)
│
├── PageHeader
│   └── ComprehensiveServiceEventModal (Multi-step Wizard)
│
├── Tab: Service Events
│   └── ServiceList
│       ├── Tab: Active Events
│       │   └── ServiceEventTable
│       │       └── ServiceDetailsModal
│       │           ├── Tab: Details
│       │           ├── Tab: Beneficiaries  
│       │           └── Tab: Inventory
│       │
│       └── Tab: Event History
│           └── ServiceEventHistoryTable
│               └── ServiceDetailsModal (Read-only)
│
└── Tab: Service Catalogs
    └── ServiceCatalogList
        ├── Add Catalog Modal
        └── Edit Catalog Modal
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Laravel)                     │
│                                                              │
│  Service Catalogs │ Service Events │ Beneficiaries │ Stocks │
└────────┬────────────────────┬────────────────┬──────────┬───┘
         │                    │                │          │
         │                    │                │          │
         ▼                    ▼                ▼          ▼
┌────────────────────────────────────────────────────────────┐
│              useServiceManagement.js (Hooks)                │
│                                                             │
│  • useServiceCatalogs()      • useServiceEvents()          │
│  • useCreateServiceCatalog() • useCreateServiceEvent()     │
│  • useUpdateServiceCatalog() • useUpdateServiceEvent()     │
│  • useDeleteServiceCatalog() • useDeleteServiceEvent()     │
│  • useCreateBeneficiary()    • useCreateServiceEventStock()│
│  • useBeneficiaries()        • useInventoryStocks()        │
└────────┬────────────────────────────────────────────────┬──┘
         │                                                │
         │                                                │
         ▼                                                ▼
┌─────────────────────┐                    ┌──────────────────┐
│  ServiceCatalogList │                    │   ServiceList    │
│  (Manage Catalogs)  │                    │  (View Events)   │
└─────────────────────┘                    └──────────────────┘
         │                                           │
         │                                           │
         ├── Create                                  ├── View
         ├── Edit                                    ├── Edit
         ├── Delete                                  ├── Complete
         └── Toggle Active                           └── Delete
```

## User Workflows

### Creating a Service Event

```
1. Click "Create Service Event"
   ↓
2. ComprehensiveServiceEventModal Opens
   ↓
3. Step 1: Service Details
   - Select catalog
   - Enter barangay
   - Choose date
   - Add remarks
   ↓
4. Step 2: Beneficiaries (Optional)
   - Search beneficiary
   - Enter quantity
   - Add species
   - Click Add
   ↓
5. Step 3: Inventory (Optional)
   - Search inventory
   - Enter quantity used
   - Add remarks
   - Click Add
   ↓
6. Step 4: Review
   - Verify all information
   - Click "Create Event"
   ↓
7. Event Created!
   - Success notification
   - Event appears in Active Events
   - ServiceList refreshes
```

### Managing an Event

```
ServiceEventTable
   ↓
Click Eye Icon
   ↓
ServiceDetailsModal Opens
   │
   ├── Details Tab
   │   - View event info
   │   - Click Edit
   │   - Modify fields
   │   - Save changes
   │
   ├── Beneficiaries Tab
   │   - View list
   │   - Click "Add Beneficiary"
   │   - Enter details
   │   - Save
   │   - Or click Remove
   │
   └── Inventory Tab
       - View items
       - Click "Add Inventory"
       - Enter details
       - Save
       - Or click Remove
```

### Completing an Event

```
Active Event
   ↓
Click Complete Button
   ↓
Confirm Dialog
   ↓
Status → "completed"
   ↓
Event moves to History Tab
   ↓
Cannot be edited or deleted
```

## State Management

```
index.js
├── activeTab: 'events' | 'catalogs'
├── snackbar: { open, message, severity }
└── refs: { serviceListRef, serviceCatalogRef }

ServiceList.js
├── activeTab: 'active' | 'history'
├── viewEvent: Event | null
├── filteredEvents: Event[]
└── methods: { handleView, handleEdit, handleComplete, handleDelete }

ServiceEventTable.js
├── searchQuery: string
├── page: number
├── rowsPerPage: number
└── filteredEvents: Event[]

ServiceDetailsModal.js
├── activeTab: 0 | 1 | 2
├── eventDetails: Event | null
├── loading: boolean
├── editMode: boolean
├── editData: Object
├── addBeneficiaryOpen: boolean
├── addInventoryOpen: boolean
├── beneficiaryForm: Object
└── inventoryForm: Object

ServiceCatalogList.js
├── searchQuery: string
├── addModalOpen: boolean
├── editModalOpen: boolean
├── selectedCatalog: Catalog | null
└── formData: Object
```

## API Call Flow

```
User Action
   ↓
Component calls custom hook
   ↓
Hook calls axiosInstance
   ↓
API endpoint
   ↓
Backend processes
   ↓
Response returned
   ↓
Hook updates state
   ↓
Component re-renders
   ↓
User sees result
   ↓
Success/Error notification
```

## Event Status Flow

```
Event Created
   │
   ├── status: 'pending'
   │   ↓
   ├── Update to 'ongoing'
   │   ↓
   ├── Update to 'scheduled'
   │   ↓
   └── Update to 'completed'
       ↓
       Moves to History
       (Cannot be edited or deleted)

Or at any point:
   ↓
Update to 'cancelled'
   ↓
Moves to History
```

## File Dependencies

```
index.js
├── imports: ServiceList, ServiceCatalogList, PageHeader
├── uses: PageHeader for creation
├── renders: ServiceList OR ServiceCatalogList based on tab
└── provides: onOperation callback

ServiceList.js
├── imports: ServiceEventTable, ServiceEventHistoryTable, ServiceDetailsModal
├── uses: useServiceEvents hook
├── renders: Table based on activeTab
└── provides: refresh method via ref

ServiceEventTable.js
├── imports: MUI components, Lucide icons
├── receives: events array, handler functions
├── provides: table UI with actions
└── emits: onView, onEdit, onComplete, onDelete

ServiceDetailsModal.js
├── imports: MUI components, axiosInstance
├── receives: event object, handlers
├── provides: detailed view with tabs
└── makes: direct API calls for updates

ServiceCatalogList.js
├── imports: MUI components, axiosInstance
├── uses: useServiceCatalogs hook
├── provides: catalog management UI
└── makes: API calls for CRUD operations

useServiceManagement.js
├── imports: axiosInstance
├── exports: 14+ custom hooks
├── provides: API integration layer
└── handles: loading, error, data states
```

## Styling Approach

```
MUI Components (Base)
   ↓
sx prop (Inline styles)
   ↓
Custom colors:
   - Primary: #2d5016 (Dark green)
   - Secondary: #4a7c59 (Medium green)
   - Success: #2e7d32 (Green)
   - Error: #d32f2f (Red)
   - Warning: #ed6c02 (Orange)
   - Info: #1976d2 (Blue)
```

## Responsive Breakpoints

```
xs: 0px - 599px (Mobile)
sm: 600px - 959px (Tablet)
md: 960px - 1279px (Desktop)
lg: 1280px - 1919px (Large Desktop)
xl: 1920px+ (Extra Large)
```

## Performance Optimizations

```
1. Pagination
   - Limit DOM nodes
   - 10/25/50 rows per page

2. Search
   - Client-side filtering
   - No unnecessary API calls

3. Lazy Loading
   - Details loaded on demand
   - Modal content on open

4. Memoization
   - useCallback for functions
   - useMemo for computed values

5. Proper Cleanup
   - useEffect cleanup
   - AbortController for API calls
```

## Security Features

```
1. Authentication
   - Bearer token in all requests
   - Axios instance with interceptors

2. Authorization
   - Sector-based filtering
   - Role-based permissions

3. Validation
   - Client-side validation
   - Server-side validation
   - Error message display

4. XSS Prevention
   - React auto-escaping
   - No dangerouslySetInnerHTML

5. CSRF Protection
   - Laravel CSRF tokens
   - Same-site cookies
```
