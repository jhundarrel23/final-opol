/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { useState, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const useProgramDetailsModal = () => {
  const [loading, setLoading] = useState(false);
  const [distributingItems, setDistributingItems] = useState(new Set());
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Validate program approval status
  const validateApprovalStatus = useCallback((program) => {
    if (!program) {
      throw new Error('Program data is required');
    }

    if (program.approval_status !== 'approved') {
      const statusText = program.approval_status === 'pending' 
        ? 'pending approval' 
        : program.approval_status === 'rejected' 
          ? 'rejected' 
          : 'not approved';
      
      throw new Error(`Cannot distribute items. Program is ${statusText}.`);
    }

    if (program.status === 'completed') {
      throw new Error('Cannot distribute items. Program is already completed.');
    }

    if (program.status === 'cancelled') {
      throw new Error('Cannot distribute items. Program has been cancelled.');
    }

    return true;
  }, []);

  // Complete program
  const completeProgram = useCallback(async (programId, program = null) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate if program data is provided
      if (program) {
        validateApprovalStatus(program);
      }

      console.log(`[completeProgram] Completing program ${programId}`);
      const response = await axiosInstance.post(`/api/subsidy-programs/${programId}/complete`);
      
      setSuccessMessage(response.data.message || 'Program completed successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 
                          err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Failed to complete program';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [validateApprovalStatus]);

  // Distribute individual item
  const distributeItem = useCallback(async (itemId, beneficiaryName = '', program = null) => {
    setDistributingItems(prev => new Set(prev).add(itemId));
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate program approval before distribution
      if (program) {
        validateApprovalStatus(program);
      }

      console.log(`[distributeItem] Distributing item ${itemId}`);
      
      const response = await axiosInstance.post(`/api/subsidy-programs/items/${itemId}/distribute`);
      
      const successMsg = beneficiaryName 
        ? `Item distributed successfully to ${beneficiaryName}`
        : 'Item distributed successfully';
      
      console.log(`[distributeItem] Success: ${successMsg}`);
      setSuccessMessage(successMsg);
      
      return {
        success: true,
        message: response.data.message || successMsg,
        item: response.data.item,
        itemId: itemId,
        beneficiaryName: beneficiaryName,
        distributedAt: response.data.distributed_at || new Date().toISOString(),
        distributedBy: response.data.distributed_by || 'Current User'
      };
    } catch (err) {
      console.error(`[distributeItem] Error distributing item ${itemId}:`, err.response?.data || err.message);
      
      // Extract detailed error message
      let errorMessage = 'Failed to distribute item';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Distribution failed - Item may already be distributed or insufficient stock';
      } else if (err.response?.status === 404) {
        errorMessage = 'Item not found';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      if (beneficiaryName) {
        errorMessage = `${errorMessage} (${beneficiaryName})`;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setDistributingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [validateApprovalStatus]);

  // Bulk distribute items
  const bulkDistributeItems = useCallback(async (itemIds, program = null, allItems = []) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate program approval before bulk distribution
      if (program) {
        validateApprovalStatus(program);
      }

      console.log(`[bulkDistributeItems] Starting bulk distribution for ${itemIds.length} items`);

      // Filter out already distributed items if allItems provided
      let pendingItemIds = itemIds;
      
      if (allItems.length > 0) {
        pendingItemIds = itemIds.filter(itemId => {
          const item = allItems.find(i => i.id === itemId);
          const isPending = item && item.status !== 'distributed';
          
          if (!isPending && item) {
            console.log(`[bulkDistributeItems] Skipping item ${itemId} - already distributed`);
          }
          
          return isPending;
        });

        if (pendingItemIds.length === 0) {
          throw new Error('No pending items to distribute. All selected items are already distributed.');
        }

        if (pendingItemIds.length < itemIds.length) {
          const skipped = itemIds.length - pendingItemIds.length;
          console.warn(`[bulkDistributeItems] Skipped ${skipped} already distributed items`);
        }
      }

      console.log(`[bulkDistributeItems] Processing ${pendingItemIds.length} pending items`);

      // Process items sequentially for better error tracking
      const successful = [];
      const failed = [];
      
      for (const itemId of pendingItemIds) {
        try {
          console.log(`[bulkDistributeItems] Distributing item ${itemId}...`);
          
          const response = await axiosInstance.post(
            `/api/subsidy-programs/items/${itemId}/distribute`
          );
          
          successful.push({
            itemId,
            data: response.data
          });
          
          console.log(`[bulkDistributeItems] ✓ Item ${itemId} distributed`);
        } catch (itemError) {
          const errorMsg = itemError.response?.data?.error || 
                          itemError.response?.data?.message || 
                          itemError.message ||
                          'Distribution failed';
          
          console.error(`[bulkDistributeItems] ✗ Item ${itemId} failed:`, errorMsg);
          
          failed.push({
            itemId,
            error: errorMsg
          });
        }
      }

      // Handle results
      if (successful.length === 0 && failed.length > 0) {
        console.error('[bulkDistributeItems] All distributions failed:', failed);
        throw new Error(`Distribution failed: ${failed[0].error}`);
      }

      const successMsg = failed.length > 0
        ? `Distributed ${successful.length} of ${itemIds.length} items (${failed.length} failed)`
        : `Successfully distributed ${successful.length} items`;
      
      console.log(`[bulkDistributeItems] Complete: ${successMsg}`);
      setSuccessMessage(successMsg);

      if (failed.length > 0) {
        const failedDetails = failed.map(f => `Item ${f.itemId}: ${f.error}`).join('; ');
        setError(`${failed.length} items failed - ${failedDetails}`);
        console.warn('[bulkDistributeItems] Partial failure details:', failed);
      }

      return {
        successful,
        failed,
        totalProcessed: itemIds.length,
        successCount: successful.length,
        failCount: failed.length
      };
    } catch (err) {
      const errorMessage = err.message || 
                          err.response?.data?.error || 
                          'Failed to process bulk distribution';
      
      console.error('[bulkDistributeItems] Fatal error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [validateApprovalStatus]);

  // Mark item as unclaimed with coordinator note
  const markItemUnclaimed = useCallback(async (itemId, reason = '', program = null) => {
    setDistributingItems(prev => new Set(prev).add(itemId));
    setError(null);
    setSuccessMessage(null);

    try {
      if (program) {
        validateApprovalStatus(program);
      }

      const response = await axiosInstance.post(`/api/subsidy-programs/items/${itemId}/unclaim`, { reason });
      const msg = response.data?.message || 'Item marked as unclaimed';
      setSuccessMessage(msg);
      return { success: true, message: msg, item: response.data?.item };
    } catch (err) {
      let errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to mark item as unclaimed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setDistributingItems(prev => {
        const s = new Set(prev);
        s.delete(itemId);
        return s;
      });
    }
  }, [validateApprovalStatus]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setLoading(false);
    setDistributingItems(new Set());
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    // State
    loading,
    distributingItems,
    error,
    successMessage,
    
    // Actions
    completeProgram,
    distributeItem,
    bulkDistributeItems,
    markItemUnclaimed,
    
    // Utilities
    clearMessages,
    resetState,
    validateApprovalStatus
  };
};

export default useProgramDetailsModal;