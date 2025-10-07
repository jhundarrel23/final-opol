
import { useState, useRef, useCallback, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';

export const useInventory = () => {
  const [inventoryOptions, setInventoryOptions] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);
  const isMounted = useRef(true);

  const fetchInventoryItems = useCallback(async () => {
    if (!isMounted.current) return;

    console.log('[useInventory] Fetching inventory items...');
    setInventoryLoading(true);
    setInventoryError(null);

    try {
      const response = await axiosInstance.get('/api/inventory/items');
      console.log('[useInventory] API response (raw):', response.data);

      if (isMounted.current && Array.isArray(response.data)) {
        const transformedInventory = response.data.map(item => {
          const onHand = parseFloat(item.on_hand) || 0;
          const reserved = parseFloat(item.reserved) || 0;
          const available = Math.max(0, onHand - reserved); 

          const transformed = {
            id: item.id,
            item_name: item.item_name,
            unit: item.unit,
            unit_value: item.unit_value,
            item_type: item.item_type,
            assistance_category: item.assistance_category,
            is_trackable_stock: item.is_trackable_stock,
            on_hand: onHand,
            reserved: reserved,
            available: available,
          
            available_stock: available,
            current_stock: available
          };

          console.log(
            `[useInventory] Item ${item.item_name} (ID: ${item.id}) → On hand: ${onHand}, Reserved: ${reserved}, Available: ${available}`
          );

          return transformed;
        });

        console.log('[useInventory] Transformed inventory list:', transformedInventory);
        setInventoryOptions(transformedInventory);
      } else if (isMounted.current) {
        console.warn('[useInventory] Response data is not an array:', response.data);
        setInventoryOptions([]);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('[useInventory] Error fetching inventory:', error);
        setInventoryError('Failed to load inventory items. Please try again.');
        setInventoryOptions([]);
      }
    } finally {
      if (isMounted.current) {
        console.log('[useInventory] Fetch complete');
        setInventoryLoading(false);
      }
    }
  }, []);

  const resetInventoryState = useCallback(() => {
    if (isMounted.current) {
      console.log('[useInventory] Resetting state...');
      setInventoryOptions([]);
      setInventoryLoading(false);
      setInventoryError(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    inventoryOptions,
    inventoryLoading,
    inventoryError,
    fetchInventoryItems,
    resetInventoryState,
  };
};