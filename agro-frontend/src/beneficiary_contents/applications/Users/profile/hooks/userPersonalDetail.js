import { useState, useCallback, useEffect } from 'react';
import axiosInstance from 'src/api/axiosInstance';

const usePersonalDetails = (userId = null) => {
  const [formData, setFormData] = useState({
    system_generated_rsbsa_number: '',
    manual_rsbsa_number: '',
    rsbsa_verification_status: 'not_verified',
    rsbsa_verification_notes: '',
    barangay: '',
    municipality: 'Opol',
    province: 'Misamis Oriental',
    region: 'Region X (Northern Mindanao)',
    contact_number: '',
    emergency_contact_number: '',
    birth_date: '',
    place_of_birth: '',
    sex: '',
    civil_status: '',
    name_of_spouse: '',
    highest_education: '',
    religion: '',
    is_pwd: false,
    has_government_id: 'no',
    gov_id_type: '',
    gov_id_number: '',
    is_association_member: 'no',
    association_name: '',
    mothers_maiden_name: '',
    is_household_head: false,
    household_head_name: '',
    profile_completion_status: 'pending',
    is_profile_verified: false,
    verification_notes: '',
    profile_verified_at: null,
    profile_verified_by: null,
    data_source: 'self_registration',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExistingRecord, setIsExistingRecord] = useState(false);

  // ✅ new states for enrollment status
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const barangayOptions = [
    'Awang','Bagocboc','Barra','Bonbon','Cauyonan','Igpit','Limonda',
    'Luyong Bonbon','Malanang','Nangcaon','Patag','Poblacion','Taboc','Tingalan'
  ];

  const civilStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
    { value: 'divorced', label: 'Divorced' }
  ];

  const educationOptions = [
    { value: 'None', label: 'None' },
    { value: 'Pre-school', label: 'Pre-school' },
    { value: 'Elementary', label: 'Elementary' },
    { value: 'Junior High School', label: 'Junior High School' },
    { value: 'Senior High School', label: 'Senior High School' },
    { value: 'Vocational', label: 'Vocational' },
    { value: 'College', label: 'College' },
    { value: 'Post Graduate', label: 'Post Graduate' }
  ];

  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === 'civil_status' && value !== 'married') {
      setFormData(prev => ({ ...prev, name_of_spouse: '' }));
    }

    if (field === 'has_government_id' && value === 'no') {
      setFormData(prev => ({ ...prev, gov_id_type: '', gov_id_number: '' }));
    }

    if (field === 'is_association_member' && value === 'no') {
      setFormData(prev => ({ ...prev, association_name: '' }));
    }

    if (field === 'is_household_head' && value === true) {
      setFormData(prev => ({ ...prev, household_head_name: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.barangay) newErrors.barangay = 'Barangay is required';
    if (!formData.contact_number) newErrors.contact_number = 'Contact number is required';
    if (!formData.birth_date) newErrors.birth_date = 'Birth date is required';
    if (!formData.sex) newErrors.sex = 'Sex is required';
    if (formData.contact_number && !/^09\d{9}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Contact number must be in format 09XXXXXXXXX';
    }
    if (formData.emergency_contact_number && !/^09\d{9}$/.test(formData.emergency_contact_number)) {
      newErrors.emergency_contact_number = 'Emergency contact must be in format 09XXXXXXXXX';
    }
    if (formData.civil_status === 'married' && !formData.name_of_spouse) {
      newErrors.name_of_spouse = 'Spouse name is required for married status';
    }
    if (formData.has_government_id === 'yes') {
      if (!formData.gov_id_type) newErrors.gov_id_type = 'Government ID type is required';
      if (!formData.gov_id_number) newErrors.gov_id_number = 'Government ID number is required';
    }
    if (formData.is_association_member === 'yes' && !formData.association_name) {
      newErrors.association_name = 'Association name is required';
    }
    if (!formData.is_household_head && !formData.household_head_name) {
      newErrors.household_head_name = 'Household head name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const loadPersonalDetails = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/rsbsa/beneficiary-details/user/${userId}`);
      const backendData = response.data.data;
      if (backendData) {
        setFormData({
          ...backendData,
          sex: backendData.sex ? backendData.sex.charAt(0).toUpperCase() + backendData.sex.slice(1) : ''
        });
        setIsExistingRecord(true);
      } else {
        setIsExistingRecord(false);
      }
    } catch (error) {
      console.error("Error loading personal details:", error);
      setIsExistingRecord(false);
      setErrors({ general: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const savePersonalDetails = useCallback(async () => {
    if (!validateForm()) return false;
    if (!userId) return false;
    setSaving(true);
    try {
      const backendData = { ...formData, sex: formData.sex.toLowerCase() };
      const payload = { user_id: userId, ...backendData };
      let response;

      if (isExistingRecord) {
        response = await axiosInstance.put(`/api/rsbsa/beneficiary-details/user/${userId}`, payload);
      } else {
        response = await axiosInstance.post('/api/rsbsa/beneficiary-details', payload);
      }

      const savedData = response.data.data;
      setFormData({
        ...savedData,
        sex: savedData.sex ? savedData.sex.charAt(0).toUpperCase() + savedData.sex.slice(1) : ''
      });
      setIsExistingRecord(true);

      localStorage.setItem(`personal_details_${userId}`, JSON.stringify(savedData));

      return true;
    } catch (error) {
      console.error("Error saving personal details:", error.response?.data || error.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [formData, userId, validateForm, isExistingRecord]);

  const getCompletionPercentage = useCallback(() => {
    const ignoredFields = [
      'system_generated_rsbsa_number','manual_rsbsa_number',
      'rsbsa_verification_status','rsbsa_verification_notes',
      'data_source'
    ];
    const relevantKeys = Object.keys(formData).filter(k => !ignoredFields.includes(k));
    const completedFields = relevantKeys.filter(key => {
      const value = formData[key];
      return value !== '' && value !== null && value !== undefined && value !== false;
    }).length;
    return Math.round((completedFields / relevantKeys.length) * 100);
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      system_generated_rsbsa_number: '',
      manual_rsbsa_number: '',
      rsbsa_verification_status: 'not_verified',
      rsbsa_verification_notes: '',
      barangay: '',
      municipality: 'Opol',
      province: 'Misamis Oriental',
      region: 'Region X (Northern Mindanao)',
      contact_number: '',
      emergency_contact_number: '',
      birth_date: '',
      place_of_birth: '',
      sex: '',
      civil_status: '',
      name_of_spouse: '',
      highest_education: '',
      religion: '',
      is_pwd: false,
      has_government_id: 'no',
      gov_id_type: '',
      gov_id_number: '',
      is_association_member: 'no',
      association_name: '',
      mothers_maiden_name: '',
      is_household_head: false,
      household_head_name: '',
      profile_completion_status: 'pending',
      is_profile_verified: false,
      verification_notes: '',
      profile_verified_at: null,
      profile_verified_by: null,
      data_source: 'self_registration',
    });
    setErrors({});
    setIsExistingRecord(false);
    setEnrollmentStatus(null);
  }, []);

  // ✅ new function to fetch enrollment status
  const loadEnrollmentStatus = useCallback(async (beneficiaryId) => {
    if (!beneficiaryId) return;
    setEnrollmentLoading(true);
    try {
      const response = await axiosInstance.get(`/api/rsbsa/beneficiary-details/${beneficiaryId}/enrollment-status`);
      setEnrollmentStatus(response.data.status || null);
    } catch (error) {
      console.error("Error loading enrollment status:", error);
      setEnrollmentStatus(null);
    } finally {
      setEnrollmentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadPersonalDetails();
      // call enrollment status loader only if you already know the beneficiary id
      // e.g., once backend gives you BeneficiaryDetail.id
    }
  }, [userId, loadPersonalDetails]);

  return {
    formData,
    errors,
    loading,
    saving,
    isExistingRecord,
    barangayOptions,
    civilStatusOptions,
    educationOptions,
    yesNoOptions,
    updateField,
    validateForm,
    loadPersonalDetails,
    savePersonalDetails,
    resetForm,
    getCompletionPercentage,
    isCreate: !isExistingRecord,
    isUpdate: isExistingRecord,
    // ✅ new returns
    enrollmentStatus,
    enrollmentLoading,
    loadEnrollmentStatus,
  };
};

export default usePersonalDetails;
