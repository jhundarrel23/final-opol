import { useState, useEffect, useCallback } from 'react';

const useBeneficiaryData = () => {
  const [beneficiaryData, setBeneficiaryData] = useState({
    beneficiaryId: null,
    rsbsaNumber: null,
    beneficiaryDetails: null
  });

  // Load beneficiary data from localStorage
  const loadBeneficiaryData = useCallback(() => {
    try {
      const beneficiaryId = localStorage.getItem('beneficiaryId');
      const rsbsaNumber = localStorage.getItem('rsbsaNumber');
      const beneficiaryDetailsStr = localStorage.getItem('beneficiaryDetails');
      
      let beneficiaryDetails = null;
      if (beneficiaryDetailsStr) {
        beneficiaryDetails = JSON.parse(beneficiaryDetailsStr);
      }

      setBeneficiaryData({
        beneficiaryId,
        rsbsaNumber,
        beneficiaryDetails
      });

      return { beneficiaryId, rsbsaNumber, beneficiaryDetails };
    } catch (err) {
      console.error('Error loading beneficiary data from localStorage:', err);
      return { beneficiaryId: null, rsbsaNumber: null, beneficiaryDetails: null };
    }
  }, []);

  // Clear beneficiary data (useful for logout)
  const clearBeneficiaryData = useCallback(() => {
    localStorage.removeItem('beneficiaryId');
    localStorage.removeItem('rsbsaNumber');
    localStorage.removeItem('beneficiaryDetails');
    setBeneficiaryData({
      beneficiaryId: null,
      rsbsaNumber: null,
      beneficiaryDetails: null
    });
  }, []);

  // Refresh beneficiary data from localStorage
  const refreshBeneficiaryData = useCallback(() => {
    return loadBeneficiaryData();
  }, [loadBeneficiaryData]);

  // Check if beneficiary data is available
  const hasBeneficiaryData = useCallback(() => {
    // Check if we have beneficiary ID or can get user ID as fallback
    if (beneficiaryData.beneficiaryId) {
      return true;
    }
    
    // Fallback: check if we have user data
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return !!user.id;
      }
    } catch (err) {
      console.error('Error checking user data:', err);
    }
    
    return false;
  }, [beneficiaryData.beneficiaryId]);

  // Get RSBSA number (system generated or manual)
  const getRSBSANumber = useCallback(() => {
    return beneficiaryData.rsbsaNumber || 'Not assigned';
  }, [beneficiaryData.rsbsaNumber]);

  // Get beneficiary ID (with fallback to user ID)
  const getBeneficiaryId = useCallback(() => {
    if (beneficiaryData.beneficiaryId) {
      return beneficiaryData.beneficiaryId;
    }
    
    // Fallback: try to get from user data
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (err) {
      console.error('Error getting user ID as fallback:', err);
    }
    
    return null;
  }, [beneficiaryData.beneficiaryId]);

  // Load data on mount
  useEffect(() => {
    loadBeneficiaryData();
  }, [loadBeneficiaryData]);

  return {
    ...beneficiaryData,
    loadBeneficiaryData,
    clearBeneficiaryData,
    refreshBeneficiaryData,
    hasBeneficiaryData,
    getRSBSANumber,
    getBeneficiaryId
  };
};

export default useBeneficiaryData;
