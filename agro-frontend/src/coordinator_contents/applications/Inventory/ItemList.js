/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  Card, 
  CircularProgress, 
  Box, 
  Typography, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import axiosInstance from '../../../api/axiosInstance';
import InventoryTable from './InventoryTable';
import AddItemModal from './AddItemModal';
import EditItemModal from './EditItemModal'; // Import the new EditItemModal

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false); // New state for edit modal
  const [selectedItem, setSelectedItem] = useState(null); // New state for selected item
  const [filters, setFilters] = useState({
    assistance_category: 'all',
    item_type: 'all', 
    is_trackable_stock: 'all'
  });

  const assistanceCategoryOptions = [
    { id: 'all', name: 'All Categories' },
    { id: 'aid', name: 'Aid Items' },
    { id: 'monetary', name: 'Monetary Assistance' },
    { id: 'service', name: 'Service/Support' }
  ];

  const itemTypeOptions = [
    { id: 'all', name: 'All Types' },
    { id: 'seed', name: 'Seeds' },
    { id: 'fertilizer', name: 'Fertilizer' },
    { id: 'pesticide', name: 'Pesticide' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'fuel', name: 'Fuel' },
    { id: 'cash', name: 'Cash' },
    { id: 'other', name: 'Other' }
  ];

  const stockTrackingOptions = [
    { id: 'all', name: 'All Items' },
    { id: 'tracked', name: 'Stock Tracked' },
    { id: 'not_tracked', name: 'Not Tracked' }
  ];

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/inventory/items'); 
      console.log("API Response:", response.data);

      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
      if (err.response) {
        setError(`Server responded with status ${err.response.status}`);
      } else if (err.request) {
        setError('No response received from server');
      } else {
        setError('Error setting up the request');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFilterChange = (filterType) => (event) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: event.target.value
    }));
  };

  const applyFilters = (items, filters) => {
    return items.filter((item) => {
      if (filters.assistance_category !== 'all' && item.assistance_category !== filters.assistance_category) return false;
      if (filters.item_type !== 'all' && item.item_type !== filters.item_type) return false;
      if (filters.is_trackable_stock !== 'all') {
        const isTracked = filters.is_trackable_stock === 'tracked';
        if (item.is_trackable_stock !== isTracked) return false;
      }
      return true;
    });
  };

  // FIXED: Corrected the delete endpoint to match Laravel routes
  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.item_name}"?`)) {
      try {
        // FIXED: Changed from /api/inventories/ to /api/inventory/items/
        await axiosInstance.delete(`/api/inventory/items/${item.id}`);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        
        // Optional: Show success message
        console.log(`Item "${item.item_name}" deleted successfully`);
      } catch (err) {
        console.error('Error deleting item:', err);
        
        // Improved error handling
        let errorMessage = 'Failed to delete item';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.status === 404) {
          errorMessage = 'Item not found';
        } else if (err.response?.status === 403) {
          errorMessage = 'You do not have permission to delete this item';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error occurred while deleting item';
        }
        
        alert(errorMessage);
      }
    }
  };

  // New function to handle edit
  const handleEdit = (item) => {
    console.log('Edit item:', item);
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleAddItem = () => {
    setAddModalOpen(true);
  };

  const handleAddItemSubmit = (newItem) => {
    console.log('Item Created:', newItem);
    setItems((prev) => [newItem, ...prev]);
  };

  // New function to handle edit item submit
  const handleEditItemSubmit = (updatedItem) => {
    console.log('Item Updated:', updatedItem);
    setItems((prev) => 
      prev.map((item) => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  // Function to close edit modal
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedItem(null);
  };

  const filteredItems = applyFilters(items, filters);

  if (loading) {
    return (
      <Card sx={{ p: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={fetchItems} 
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <Box>
      {/* Filter Controls with Add Button */}
      <Box 
        display="flex" 
        gap={2} 
        alignItems="center" 
        justifyContent="space-between"
        sx={{ 
          mb: 2, 
          p: 2, 
          backgroundColor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>All Categories</InputLabel>
            <Select
              value={filters.assistance_category}
              onChange={handleFilterChange('assistance_category')}
              label="All Categories"
            >
              {assistanceCategoryOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>All Types</InputLabel>
            <Select
              value={filters.item_type}
              onChange={handleFilterChange('item_type')}
              label="All Types"
            >
              {itemTypeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>All Items</InputLabel>
            <Select
              value={filters.is_trackable_stock}
              onChange={handleFilterChange('is_trackable_stock')}
              label="All Items"
            >
              {stockTrackingOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddTwoToneIcon fontSize="small" />}
          onClick={handleAddItem}
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          Add New Item
        </Button>
      </Box>

      <Box sx={{ mb: 2, px: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Inventory Items ({filteredItems.length} items found)
        </Typography>
      </Box>

      <InventoryTable
        items={filteredItems}
        onEdit={handleEdit} // Pass the edit handler
        onDelete={handleDelete}
      />
      
      {/* Add Item Modal */}
      <AddItemModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddItemSubmit}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        onSubmit={handleEditItemSubmit}
        item={selectedItem}
      />
    </Box>
  );
}

export default ItemList;