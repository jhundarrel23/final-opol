import { useState, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';

export const useBeneficiaries = () => {
  const [beneficiaryOptions, setBeneficiaryOptions] = useState([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
  const [beneficiariesError, setBeneficiariesError] = useState(null);

  const fetchBeneficiaries = useCallback(async (searchTerm = '') => {
    setBeneficiariesLoading(true);
    setBeneficiariesError(null);

    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await axiosInstance.get(
        'api/rsbsa/coordinator-beneficiaries/my-beneficiaries',
        { params }
      );

      console.log('Full API Response:', response);
      console.log('Response Data:', response.data);

      if (response.data.success) {
        console.log('Raw beneficiary IDs from API:', response.data.data.map(b => ({
          id: b.id,
          type: typeof b.id,
          isValid: b.id && typeof b.id === 'number' && b.id > 0
        })));

        const transformedBeneficiaries = response.data.data
          .map((beneficiary) => {
            if (!beneficiary.id || typeof beneficiary.id !== 'number' || beneficiary.id <= 0) {
              console.error('Invalid beneficiary ID detected:', beneficiary);
              return null;
            }

            return {
              id: beneficiary.id,
              beneficiary_id: beneficiary.id,
              // ✅ UPDATED: Separate Reference Code and RSBSA Number
              reference_code: beneficiary.systemGeneratedRsbaNumber || 'N/A', // From enrollment
              rsbsa_number: beneficiary.rsbsaNumber || 'Not Set', // From beneficiary_details
              full_name:
                beneficiary.name ||
                [
                  beneficiary.firstName,
                  beneficiary.middleName,
                  beneficiary.lastName,
                ]
                  .filter(Boolean)
                  .join(' ') ||
                'Unknown',
              hectar: parseFloat(beneficiary.totalParcelArea) || 0,
              commodity: beneficiary.commodity || '',
              address: [
                beneficiary.streetPurokBarangay,
                beneficiary.municipality,
                beneficiary.province,
              ]
                .filter(Boolean)
                .join(', ') ||
                'No address',
              barangay: beneficiary.streetPurokBarangay || '',
            };
          })
          .filter(Boolean);

        console.log(
          'Transformed Beneficiaries:',
          transformedBeneficiaries.map((b) => ({
            database_id: b.id,
            beneficiary_id: b.beneficiary_id,
            reference_code: b.reference_code,
            rsbsa_number: b.rsbsa_number,
            name: b.full_name,
            idsMatch: b.id === b.beneficiary_id,
          }))
        );

        if (transformedBeneficiaries.length === 0) {
          console.warn('No valid beneficiaries found after transformation');
        }

        setBeneficiaryOptions(transformedBeneficiaries);
      } else {
        console.warn('API returned success: false');
        setBeneficiaryOptions([]);
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setBeneficiaryOptions([]);
      setBeneficiariesError(
        error.response?.data?.message || 
        'Failed to load beneficiaries. Please try again.'
      );
    } finally {
      setBeneficiariesLoading(false);
    }
  }, []);

  const resetBeneficiariesState = useCallback(() => {
    setBeneficiaryOptions([]);
    setBeneficiariesLoading(false);
    setBeneficiariesError(null);
  }, []);

  return {
    beneficiaryOptions,
    beneficiariesLoading,
    beneficiariesError,
    fetchBeneficiaries,
    resetBeneficiariesState,
  };
};