 /* eslint-disable no-restricted-syntax */
// src/beneficiary/contents/applications/useRSBSAForm.js
/* eslint-disable no-empty */
/* eslint-disable no-else-return */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from 'react';
import { rsbsaFormService, beneficiaryDetailsService } from '../../../api/rsbsaService';
import axiosInstance from '../../../api/axiosInstance';

export const useRSBSAForm = () => {
  const isMountedRef = useRef(true);

  const [formData, setFormData] = useState({
    beneficiaryDetails: {
        user_id: null, // foreign key to users table
        
        // RSBSA Identifiers
        system_generated_rsbsa_number: null,
        manual_rsbsa_number: null,
        

        barangay: null, // required
        municipality: 'Opol', // default
        province: 'Misamis Oriental', // default
        region: 'Region X (Northern Mindanao)', // default
        
 
        contact_number: null, 
        emergency_contact_number: null,
        

        birth_date: '',
        place_of_birth: null,
        sex: '', 
        civil_status: null,
        name_of_spouse: null,
        

        highest_education: null,
        religion: null,
        is_pwd: false,
        

        has_government_id: 'no',
        gov_id_type: null,
        gov_id_number: null,
        
   
        is_association_member: 'no',
        association_name: null,
        
        // HOUSEHOLD INFORMATION
        mothers_maiden_name: null,
        is_household_head: false,
        household_head_name: null,
        
        // DATA SOURCE
        data_source: 'self_registration',
    },
    farmProfile: {
      id: null,
      user_id: null,
      livelihood_category_id: null,
      created_at: null,
      updated_at: null
    },
    farmParcels: [],
    beneficiaryLivelihoods: [],
    farmerActivities: { id: null, beneficiary_livelihood_id: null, rice: false, corn: false, other_crops: false, other_crops_specify: '', livestock: false, livestock_specify: '', poultry: false, poultry_specify: '', created_at: null, updated_at: null },
    fisherfolkActivities: { id: null, beneficiary_livelihood_id: null, fish_capture: false, aquaculture: false, seaweed_farming: false, gleaning: false, fish_processing: false, fish_vending: false, others: false, others_specify: '', created_at: null, updated_at: null },
    farmworkerActivities: { id: null, beneficiary_livelihood_id: null, land_preparation: false, planting: false, cultivation: false, harvesting: false, others: false, others_specify: '', created_at: null, updated_at: null },
    agriYouthActivities: { id: null, beneficiary_livelihood_id: null, is_agri_youth: false, is_part_of_farming_household: false, is_formal_agri_course: false, is_nonformal_agri_course: false, is_agri_program_participant: false, others: false, others_specify: '', created_at: null, updated_at: null }
  });

  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Application status state
  const [applicationStatus, setApplicationStatus] = useState({
    hasActiveEnrollment: false,
    isCheckingStatus: true,
    statusMessage: '',
    statusError: null
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  useEffect(() => () => { isMountedRef.current = false; }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rsbsa_form_data');
      if (saved) setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem('rsbsa_form_data', JSON.stringify(formData)); } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [formData]);

  // Function to check application status
  const checkApplicationStatus = useCallback(async (userId) => {
    if (!userId) {
      console.log('[checkApplicationStatus] No userId provided');
      return;
    }
    
    console.log('[checkApplicationStatus] Checking status for userId:', userId);
    setApplicationStatus(prev => ({ ...prev, isCheckingStatus: true, statusError: null }));
    
    try {
      const endpoint = `api/rsbsa/enrollments/user/${userId}/application_status`;
      console.log('[checkApplicationStatus] Fetching from endpoint:', endpoint);
      
      const response = await axiosInstance.get(endpoint);
      
      console.log('[checkApplicationStatus] Response:', {
        status: response.status,
        data: response.data
      });
      
      if (!isMountedRef.current) return;
      
      if (response.data.success) {
        setApplicationStatus({
          hasActiveEnrollment: response.data.has_active_enrollment,
          isCheckingStatus: false,
          statusMessage: response.data.message,
          statusError: null
        });
        console.log('[checkApplicationStatus] Success - hasActiveEnrollment:', response.data.has_active_enrollment);
      } else {
        setApplicationStatus(prev => ({
          ...prev,
          isCheckingStatus: false,
          statusError: response.data.message || 'Failed to check application status'
        }));
        console.log('[checkApplicationStatus] Failed:', response.data.message);
      }
    } catch (error) {
      console.error('[checkApplicationStatus] ERROR:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        endpoint: error.config?.url,
        fullError: error
      });
      
      if (!isMountedRef.current) return;
      
      setApplicationStatus(prev => ({
        ...prev,
        isCheckingStatus: false,
        statusError: 'Failed to check application status. Please try again.'
      }));
    }
  }, []);

  // FIXED: Helper function to check if livelihood category requires farm profile/parcels
  const requiresFarmData = useCallback((livelihoodCategoryId) => {
    // Categories that DO NOT require farm parcels:
    // 2 = Farm Worker
    // 4 = Agri-Youth
    // Categories that DO require farm parcels:
    // 1 = Farmer
    // 3 = Fisherfolk
    const noParcelCategories = [2, 4];
    return !noParcelCategories.includes(Number(livelihoodCategoryId));
  }, []);

  // NEW: Load existing enrollment data directly from API
  const loadExistingEnrollment = useCallback(async (userId) => {
    if (!userId) {
      console.log('[loadExistingEnrollment] No userId provided');
      return;
    }
    
    console.log('[loadExistingEnrollment] Starting to load enrollment for userId:', userId);
    setIsLoadingExisting(true);
    setBackendErrors({});
    
    try {
      const endpoint = `api/rsbsa/enrollments/user/${userId}`;
      console.log('[loadExistingEnrollment] Fetching from endpoint:', endpoint);
      console.log('[loadExistingEnrollment] Full URL:', axiosInstance.defaults.baseURL + '/' + endpoint);
      
      // Use the getByUserId endpoint from your controller
      const response = await axiosInstance.get(endpoint);
      
      console.log('[loadExistingEnrollment] Response received:', {
        status: response.status,
        hasData: !!response.data,
        success: response.data?.success,
        fullResponse: response.data
      });
      
      if (!isMountedRef.current) return;
      
      if (response.data.success && response.data.data) {
        const enrollment = response.data.data;
        console.log('[loadExistingEnrollment] Enrollment data:', enrollment);
        
        // Extract beneficiary details
        if (enrollment.beneficiaryDetail) {
          setFormData(prev => ({
            ...prev,
            beneficiaryDetails: {
              ...prev.beneficiaryDetails,
              ...enrollment.beneficiaryDetail,
              user_id: userId
            }
          }));
          console.log('[loadExistingEnrollment] Loaded beneficiary details');
        }
        
        // Extract farm profile (only if exists - optional for farmworkers/agri-youth)
        if (enrollment.farmProfile) {
          setFormData(prev => ({
            ...prev,
            farmProfile: {
              ...prev.farmProfile,
              ...enrollment.farmProfile,
              user_id: userId
            }
          }));
          console.log('[loadExistingEnrollment] Loaded farm profile');
        }
        
        // Extract farm parcels (only if exists - optional for farmworkers/agri-youth)
        if (enrollment.farmProfile?.farmParcels) {
          setFormData(prev => ({
            ...prev,
            farmParcels: enrollment.farmProfile.farmParcels.map(parcel => ({
              ...parcel,
              commodities: parcel.commodities || []
            }))
          }));
          console.log('[loadExistingEnrollment] Loaded', enrollment.farmProfile.farmParcels.length, 'farm parcels');
        }
        
        // Extract livelihood activities
        if (enrollment.beneficiaryDetail?.beneficiaryLivelihoods) {
          const livelihoods = enrollment.beneficiaryDetail.beneficiaryLivelihoods;
          
          setFormData(prev => ({
            ...prev,
            beneficiaryLivelihoods: livelihoods,
            farmerActivities: livelihoods.find(l => l.farmerActivity) 
              ? { ...prev.farmerActivities, ...livelihoods.find(l => l.farmerActivity).farmerActivity }
              : prev.farmerActivities,
            fisherfolkActivities: livelihoods.find(l => l.fisherfolkActivity)
              ? { ...prev.fisherfolkActivities, ...livelihoods.find(l => l.fisherfolkActivity).fisherfolkActivity }
              : prev.fisherfolkActivities,
            farmworkerActivities: livelihoods.find(l => l.farmworkerActivity)
              ? { ...prev.farmworkerActivities, ...livelihoods.find(l => l.farmworkerActivity).farmworkerActivity }
              : prev.farmworkerActivities,
            agriYouthActivities: livelihoods.find(l => l.agriYouthActivity)
              ? { ...prev.agriYouthActivities, ...livelihoods.find(l => l.agriYouthActivity).agriYouthActivity }
              : prev.agriYouthActivities
          }));
          console.log('[loadExistingEnrollment] Loaded', livelihoods.length, 'livelihoods');
        }
        
        console.log('[loadExistingEnrollment] Existing enrollment loaded successfully');
        
      } else if (response.data.message === 'No enrollment found for this user') {
        // No existing enrollment found, this is normal for new users
        console.log('[loadExistingEnrollment] No existing enrollment found for user (normal for new users)');
      } else {
        console.log('[loadExistingEnrollment] Unexpected response:', response.data);
        setBackendErrors(prev => ({ 
          ...prev, 
          loadError: response.data.message || 'Failed to load existing enrollment' 
        }));
      }
    } catch (error) {
      console.error('[loadExistingEnrollment] ERROR:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        endpoint: error.config?.url,
        responseData: error.response?.data,
        fullError: error
      });
      
      if (!isMountedRef.current) return;
      
      // Check if it's a 404 (no enrollment found) - this is normal
      if (error.response?.status === 404) {
        console.log('[loadExistingEnrollment] 404 - No existing enrollment found for user (normal for new users)');
        console.log('[loadExistingEnrollment] 404 Details:', {
          userId: userId,
          endpoint: error.config?.url,
          responseMessage: error.response?.data?.message
        });
      } else {
        setBackendErrors(prev => ({ 
          ...prev, 
          loadError: 'Failed to load existing enrollment data' 
        }));
        console.error('[loadExistingEnrollment] Non-404 error occurred');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingExisting(false);
        console.log('[loadExistingEnrollment] Finished loading (isLoadingExisting set to false)');
      }
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      console.log('[useEffect] Raw user data from localStorage:', raw);
      
      if (!raw) {
        console.log('[useEffect] No user data in localStorage');
        return;
      }
      
      const user = JSON.parse(raw);
      console.log('[useEffect] Parsed user:', user);
      
      if (!user?.id) {
        console.log('[useEffect] No user ID found');
        return;
      }
      
      console.log('[useEffect] User ID found:', user.id);
      
      setFormData(prev => ({
        ...prev,
        beneficiaryDetails: { ...prev.beneficiaryDetails, user_id: user.id },
        farmProfile: { ...prev.farmProfile, user_id: user.id }
      }));
      
      // Check application status first
      console.log('[useEffect] Calling checkApplicationStatus...');
      checkApplicationStatus(user.id);
      
      // Load existing enrollment data (API-based)
      console.log('[useEffect] Calling loadExistingEnrollment...');
      loadExistingEnrollment(user.id);
      
      // Load existing beneficiary details (service-based)
      console.log('[useEffect] Calling loadExistingBeneficiaryDetails...');
      loadExistingBeneficiaryDetails(user.id);
    } catch (error) {
      console.error('[useEffect] Error:', error);
    }
  }, [checkApplicationStatus, loadExistingEnrollment]);

  const loadExistingBeneficiaryDetails = useCallback(async (userId) => {
    if (!userId) return;
    setIsLoadingExisting(true);
    setBackendErrors({});
    try {
      const res = await beneficiaryDetailsService.getDetailsByUserId(userId);
      if (!isMountedRef.current) return;
      if (res.success && res.data) {
        const b = res.data;
        setFormData(prev => ({
          ...prev,
          beneficiaryDetails: {
            ...prev.beneficiaryDetails,
            ...b,
            sex: b.sex || '',
            civil_status: b.civil_status || '',
            highest_education: b.highest_education || '',
            has_government_id: b.has_government_id ?? 'no',
            is_association_member: b.is_association_member ?? 'no',
            completion_tracking: b.completion_tracking ?? {}
          }
        }));
      }
    } catch {
      setBackendErrors(prev => ({ ...prev, loadError: 'Failed to load beneficiary details' }));
      
    } finally {
      if (isMountedRef.current) setIsLoadingExisting(false);
    }
  }, []);

  const updateField = useCallback((section, field, value) => {
    setFormData(prev => {
      const next = { ...prev, [section]: { ...prev[section], [field]: value } };
      if (section === 'farmProfile' && field === 'livelihood_category_id') {
        next.beneficiaryLivelihoods = value ? [{ livelihood_category_id: value }] : [];
      }
      return next;
    });
    setErrors(prev => { const n = { ...prev }; delete n[`${section}.${field}`]; return n; });
  }, []);

  // Updated addFarmParcel function - removed sector_id
  const addFarmParcel = useCallback(() => {
    const newParcel = {
      id: Date.now(),
      farm_profile_id: null,
      parcel_number: '',
      barangay: '',
      total_farm_area: 0,                // Required - must be > 0
      tenure_type: null,                 // Required - registered_owner, tenant, lessee
      landowner_name: '',
      ownership_document_number: '',
      ownership_document_type: null,
      is_ancestral_domain: false,
      is_agrarian_reform_beneficiary: false,
      remarks: '',
      commodities: [],                   // Required - at least one commodity
      created_at: null,
      updated_at: null
    };
    setFormData(prev => ({ ...prev, farmParcels: [...prev.farmParcels, newParcel] }));
  }, []);

  const updateFarmParcel = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      farmParcels: prev.farmParcels.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[`farmParcels.${index}.${field}`];
      return next;
    });
  }, []);

  const removeFarmParcel = useCallback((index) => {
    setFormData(prev => ({ ...prev, farmParcels: prev.farmParcels.filter((_, i) => i !== index) }));
  }, []);

  // NEW: Add commodity to a specific parcel
  const addCommodityToParcel = useCallback((parcelIndex) => {
    const newCommodity = {
      commodity_id: null,           // Required
      size_hectares: null,          // Optional for crops
      number_of_heads: null,        // Optional for livestock/poultry
      farm_type: null,              // irrigated, rainfed upland, rainfed lowland
      is_organic_practitioner: false,
      remarks: ''
    };

    setFormData(prev => ({
      ...prev,
      farmParcels: prev.farmParcels.map((parcel, i) => 
        i === parcelIndex 
          ? { ...parcel, commodities: [...(parcel.commodities || []), newCommodity] }
          : parcel
      )
    }));
  }, []);

  // NEW: Update commodity in a specific parcel
  const updateParcelCommodity = useCallback((parcelIndex, commodityIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      farmParcels: prev.farmParcels.map((parcel, i) => 
        i === parcelIndex 
          ? {
              ...parcel,
              commodities: parcel.commodities.map((commodity, j) => 
                j === commodityIndex 
                  ? { ...commodity, [field]: value }
                  : commodity
              )
            }
          : parcel
      )
    }));

    // Clear related errors
    setErrors(prev => {
      const next = { ...prev };
      delete next[`farmParcels.${parcelIndex}.commodities.${commodityIndex}.${field}`];
      return next;
    });
  }, []);

  // NEW: Remove commodity from a specific parcel
  const removeCommodityFromParcel = useCallback((parcelIndex, commodityIndex) => {
    setFormData(prev => ({
      ...prev,
      farmParcels: prev.farmParcels.map((parcel, i) => 
        i === parcelIndex 
          ? {
              ...parcel,
              commodities: parcel.commodities.filter((_, j) => j !== commodityIndex)
            }
          : parcel
      )
    }));
  }, []);

  const validateLivelihoodActivities = useCallback((livelihoodCategoryId, data, newErrors) => {
    if (livelihoodCategoryId === 1) {
      const a = data.farmerActivities;
      if (!(a.rice || a.corn || a.other_crops || a.livestock || a.poultry)) newErrors.farmerActivities = 'Please select at least one farming activity';
    } else if (livelihoodCategoryId === 3) {
      const a = data.fisherfolkActivities;
      if (!(a.fish_capture || a.aquaculture || a.gleaning || a.fish_processing || a.fish_vending)) newErrors.fisherfolkActivities = 'Please select at least one fishing activity';
    } else if (livelihoodCategoryId === 2) {
      const a = data.farmworkerActivities;
      if (!(a.land_preparation || a.planting || a.cultivation || a.harvesting || a.others)) newErrors.farmworkerActivities = 'Please select at least one farmworker activity';
    } else if (livelihoodCategoryId === 4) {
      if (!data.agriYouthActivities.is_agri_youth) newErrors['agriYouthActivities.is_agri_youth'] = 'Please confirm you are an Agri-Youth';
    }
  }, []);

  // Updated validateForm - removed sector_id validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    try {
      const b = formData.beneficiaryDetails;
      if (!b.barangay?.trim()) newErrors['beneficiaryDetails.barangay'] = 'Barangay is required';
      if (!b.contact_number?.trim()) newErrors['beneficiaryDetails.contact_number'] = 'Contact number is required';
      if (!b.birth_date) newErrors['beneficiaryDetails.birth_date'] = 'Birth date is required';
      if (!b.sex) newErrors['beneficiaryDetails.sex'] = 'Sex is required';
      if (!b.municipality?.trim()) newErrors['beneficiaryDetails.municipality'] = 'Municipality is required';
      if (!b.province?.trim()) newErrors['beneficiaryDetails.province'] = 'Province is required';
      if (!b.region?.trim()) newErrors['beneficiaryDetails.region'] = 'Region is required';

      if (!formData.farmProfile.livelihood_category_id) newErrors['farmProfile.livelihood_category_id'] = 'Livelihood category is required';

      // Only validate farm parcels for Farmers (1) and Fisherfolk (3)
      // Farmworkers (2) and Agri-Youth (4) don't need farm parcels
      const livelihoodId = formData.farmProfile.livelihood_category_id;
      if (requiresFarmData(livelihoodId)) {
        if (formData.farmParcels.length === 0) {
          newErrors.farmParcels = 'At least one farm parcel is required';
        } else {
          formData.farmParcels.forEach((p, i) => {
            if (!p.barangay?.trim()) newErrors[`farmParcels.${i}.barangay`] = 'Parcel barangay is required';
            if (!p.tenure_type) newErrors[`farmParcels.${i}.tenure_type`] = 'Tenure type is required';
            if (!p.total_farm_area || p.total_farm_area <= 0) newErrors[`farmParcels.${i}.total_farm_area`] = 'Total farm area must be greater than 0';
            
            // Updated commodity validation
            if (!p.commodities || p.commodities.length === 0) {
              newErrors[`farmParcels.${i}.commodities`] = 'At least one commodity is required';
            } else {
              p.commodities.forEach((commodity, j) => {
                if (!commodity.commodity_id) {
                  newErrors[`farmParcels.${i}.commodities.${j}.commodity_id`] = 'Commodity is required';
                }
                // Add more commodity-specific validation as needed
              });
            }
          });
        }
      }

      if (formData.beneficiaryLivelihoods?.length > 0) {
        formData.beneficiaryLivelihoods.forEach(l => validateLivelihoodActivities(l.livelihood_category_id, formData, newErrors));
      } else if (formData.farmProfile.livelihood_category_id) {
        validateLivelihoodActivities(formData.farmProfile.livelihood_category_id, formData, newErrors);
      }

      setErrors(newErrors);
      setBackendErrors({});
      return Object.keys(newErrors).length === 0;
    } catch {
      setBackendErrors(prev => ({ ...prev, validationError: 'Validation error occurred' }));
      return false;
    }
  }, [formData, validateLivelihoodActivities, requiresFarmData]);

  const submitForm = useCallback(async (userId) => {
    // Prevent submission if user has active enrollment
    if (applicationStatus.hasActiveEnrollment) {
      setBackendErrors(prev => ({ 
        ...prev, 
        submissionError: 'You already have a pending or approved enrollment. Cannot submit a new form.' 
      }));
      return { success: false, error: 'Cannot submit - active enrollment exists' };
    }

    if (!validateForm()) return { success: false, error: 'Form validation failed' };
    if (!userId) { setBackendErrors(prev => ({ ...prev, submissionError: 'User ID is required' })); return { success: false, error: 'User ID is required' }; }
    setIsSubmitting(true);
    setBackendErrors({});
    try {
      const result = await rsbsaFormService.submitCompleteForm(formData, userId);
      if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };
      if (result.success) {
        setSubmissionResult(result);
        try { localStorage.removeItem('rsbsa_form_data'); } catch {}
        
        // Update application status after successful submission
        setApplicationStatus(prev => ({
          ...prev,
          hasActiveEnrollment: true,
          statusMessage: 'Your enrollment has been submitted successfully.'
        }));
        
        return { success: true, data: result.data };
      }
      setBackendErrors(prev => ({ ...prev, submissionError: result.error, validationErrors: result.validationErrors }));
      return { success: false, error: result.error, details: result.details };
    } catch {
      setBackendErrors(prev => ({ ...prev, submissionError: 'Unexpected error occurred' }));
      return { success: false, error: 'Unexpected error occurred' };
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }, [formData, validateForm, applicationStatus.hasActiveEnrollment]);

  const saveDraft = useCallback(async (userId) => {
    // Prevent draft saving if user has active enrollment
    if (applicationStatus.hasActiveEnrollment) {
      setBackendErrors(prev => ({ 
        ...prev, 
        draftError: 'You already have a pending or approved enrollment. Cannot save draft.' 
      }));
      return { success: false, error: 'Cannot save draft - active enrollment exists' };
    }

    if (!userId) { setBackendErrors(prev => ({ ...prev, draftError: 'User ID is required' })); return { success: false, error: 'User ID is required' }; }
    setIsSavingDraft(true);
    setBackendErrors({});
    try {
      const result = await rsbsaFormService.saveDraft(formData, userId);
      if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };
      return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    } catch {
      setBackendErrors(prev => ({ ...prev, draftError: 'Failed to save draft' }));
      return { success: false, error: 'Failed to save draft' };
    } finally {
      if (isMountedRef.current) setIsSavingDraft(false);
    }
  }, [formData, applicationStatus.hasActiveEnrollment]);

  const resetForm = useCallback(() => {
    setFormData(prev => ({
      ...prev,
    beneficiaryDetails: {
        ...prev.beneficiaryDetails,
        system_generated_rsbsa_number: null,
        manual_rsbsa_number: null,
        contact_number: null,
        emergency_contact_number: null,
        birth_date: null,
        place_of_birth: null,
        sex: '',
        civil_status: null,
        name_of_spouse: null,
        highest_education: null,
        religion: null,
        is_pwd: false,
        has_government_id: 'no',
        gov_id_type: null,
        gov_id_number: null,
        is_association_member: 'no',
        association_name: null,
        mothers_maiden_name: null,
        is_household_head: false,
        household_head_name: null,   
        data_source: 'self_registration',
      },
      farmProfile: { ...prev.farmProfile, livelihood_category_id: null },
      farmParcels: [],
      beneficiaryLivelihoods: [],
      farmerActivities: { ...prev.farmerActivities, rice: false, corn: false, other_crops: false, livestock: false, poultry: false, other_crops_specify: '', livestock_specify: '', poultry_specify: '' },
      fisherfolkActivities: { ...prev.fisherfolkActivities, fish_capture: false, aquaculture: false, seaweed_farming: false, gleaning: false, fish_processing: false, fish_vending: false, others: false, others_specify: '' },
      farmworkerActivities: { ...prev.farmworkerActivities, land_preparation: false, planting: false, cultivation: false, harvesting: false, others: false, others_specify: '' },
      agriYouthActivities: { ...prev.agriYouthActivities, is_agri_youth: false, is_part_of_farming_household: false, is_formal_agri_course: false, is_nonformal_agri_course: false, is_agri_program_participant: false, others: false, others_specify: '' }
    }));
    setErrors({});
    setBackendErrors({});
    setSubmissionResult(null);
    setCurrentStep(1);
    try { localStorage.removeItem('rsbsa_form_data'); } catch {}
  }, []);

  // Updated getFormProgress to account for optional farm data
  const getFormProgress = useCallback(() => {
    try {
      const livelihoodId = formData.farmProfile.livelihood_category_id;
      const needsFarmData = requiresFarmData(livelihoodId);
      
      // Base fields for all types (adjust total based on livelihood type)
      const baseFields = 7; // barangay, contact, birth_date, sex, civil_status, livelihood, activities
      const farmFields = needsFarmData ? 5 : 0; // farm parcels and related fields
      const totalFields = baseFields + farmFields;
      
      let completed = 0;
      
      const b = formData.beneficiaryDetails;
      if (b.barangay?.trim()) completed++;
      if (b.contact_number?.trim()) completed++;
      if (b.birth_date) completed++;
      if (b.sex) completed++;
      if (b.civil_status) completed++;
      if (formData.farmProfile.livelihood_category_id) completed++;
      
      // Only count farm data if required for this livelihood type
      if (needsFarmData) {
        if (formData.farmParcels.length > 0) {
          completed++;
          const f = formData.farmParcels[0];
          if (f?.barangay && f?.tenure_type && f?.total_farm_area > 0) completed += 3;
          if (f?.commodities && f.commodities.length > 0 && f.commodities[0]?.commodity_id) completed++;
        }
      }
      
      // Check activity completion
      if (livelihoodId === 1) {
        const a = formData.farmerActivities;
        if (a.rice || a.corn || a.other_crops || a.livestock || a.poultry) completed++;
      } else if (livelihoodId === 3) {
        const a = formData.fisherfolkActivities;
        if (a.fish_capture || a.aquaculture || a.gleaning || a.fish_processing || a.fish_vending) completed++;
      } else if (livelihoodId === 2) {
        const a = formData.farmworkerActivities;
        if (a.land_preparation || a.planting || a.cultivation || a.harvesting || a.others) completed++;
      } else if (livelihoodId === 4) {
        if (formData.agriYouthActivities.is_agri_youth) completed++;
      }
      
      return Math.round((completed / totalFields) * 100);
    } catch { 
      return 0; 
    }
  }, [formData, requiresFarmData]);

  const nextStep = useCallback(() => { if (currentStep < totalSteps) setCurrentStep(s => s + 1); }, [currentStep, totalSteps]);
  const prevStep = useCallback(() => { if (currentStep > 1) setCurrentStep(s => s - 1); }, [currentStep]);
  const goToStep = useCallback((s) => { if (s >= 1 && s <= totalSteps) setCurrentStep(s); }, [totalSteps]);

  // Updated canSubmit calculation - removed sector_id check
  const canSubmit = useCallback(() => {
    try {
      // Prevent submission if user has active enrollment
      if (applicationStatus.hasActiveEnrollment) return false;
      
      // Check if form is currently submitting
      if (isSubmitting) return false;
      
      // Check for validation errors
      if (Object.keys(errors).length > 0) return false;
      
      // Check for backend errors
      if (Object.keys(backendErrors).length > 0) return false;
      
      // Check beneficiary details
      const b = formData.beneficiaryDetails;
      if (!b.barangay?.trim() || !b.contact_number?.trim() || !b.birth_date || !b.sex || !b.municipality?.trim() || !b.province?.trim() || !b.region?.trim()) {
        return false;
      }
      
      // Check livelihood category is selected
      if (!formData.farmProfile.livelihood_category_id) return false;
      
      const livelihoodId = formData.farmProfile.livelihood_category_id;
      
      // Only require farm data for Farmers (1) and Fisherfolk (3)
      // Farmworkers (2) and Agri-Youth (4) can submit without farm parcels
      if (requiresFarmData(livelihoodId)) {
        // Check farm parcels for farmers and fisherfolk
        if (formData.farmParcels.length === 0) return false;
        
        // Check each farm parcel
        for (const parcel of formData.farmParcels) {
          if (!parcel.barangay?.trim() || !parcel.tenure_type || !parcel.total_farm_area || parcel.total_farm_area <= 0) {
            return false;
          }
          // Check commodities (updated for new structure)
          if (!parcel.commodities || parcel.commodities.length === 0) {
            return false;
          }
          // Check each commodity has required fields
          for (const commodity of parcel.commodities) {
            if (!commodity.commodity_id) {
              return false;
            }
          }
        }
      }
      
      // Check livelihood activities are selected
      if (livelihoodId === 1) {
        const a = formData.farmerActivities;
        if (!(a.rice || a.corn || a.other_crops || a.livestock || a.poultry)) return false;
      } else if (livelihoodId === 3) {
        const a = formData.fisherfolkActivities;
        if (!(a.fish_capture || a.aquaculture || a.gleaning || a.fish_processing || a.fish_vending)) return false;
      } else if (livelihoodId === 2) {
        const a = formData.farmworkerActivities;
        if (!(a.land_preparation || a.planting || a.cultivation || a.harvesting || a.others)) return false;
      } else if (livelihoodId === 4) {
        if (!formData.agriYouthActivities.is_agri_youth) return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }, [formData, errors, backendErrors, isSubmitting, applicationStatus.hasActiveEnrollment, requiresFarmData]);

  // Function to refresh application status
  const refreshApplicationStatus = useCallback(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const user = JSON.parse(raw);
      if (!user?.id) return;
      checkApplicationStatus(user.id);
    } catch {}
  }, [checkApplicationStatus]);

  return {
    formData, errors, backendErrors,
    isSubmitting, isSavingDraft, isLoadingExisting,
    submissionResult, currentStep, totalSteps,

    applicationStatus,
    refreshApplicationStatus,

    updateField, addFarmParcel, updateFarmParcel, removeFarmParcel,
    
    addCommodityToParcel,
    updateParcelCommodity,
    removeCommodityFromParcel,
    
    loadExistingEnrollment,
    
    validateForm, nextStep, prevStep, goToStep,
    submitForm, saveDraft, resetForm,

    // Helper functions
    requiresFarmData,

    formProgress: getFormProgress(),
    isValid: Object.keys(errors).length === 0 && Object.keys(backendErrors).length === 0,
    canSubmit: canSubmit(),
    hasBackendErrors: Object.keys(backendErrors).length > 0,
    
    shouldHideForm: applicationStatus.hasActiveEnrollment,
    isCheckingApplicationStatus: applicationStatus.isCheckingStatus
  };
};

export default useRSBSAForm;