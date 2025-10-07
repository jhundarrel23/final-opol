// src/api/rsbsaService.js
/* eslint-disable no-return-await */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-useless-escape */
import axiosInstance from './axiosInstance';

const RSBSA_ENDPOINTS = {
  ENROLLMENTS: '/api/rsbsa/enrollments',
  BENEFICIARY_DETAILS: '/api/rsbsa/beneficiary-details',
  FARM_PROFILES: '/api/rsbsa/farm-profiles',
  FARM_PARCELS: '/api/rsbsa/farm-parcels',
  BENEFICIARY_LIVELIHOODS: '/api/rsbsa/beneficiary-livelihoods',
  FARMER_ACTIVITIES: '/api/rsbsa/farmer-activities',
  FISHERFOLK_ACTIVITIES: '/api/rsbsa/fisherfolk-activities',
  FARMWORKER_ACTIVITIES: '/api/rsbsa/farmworker-activities',
  AGRI_YOUTH_ACTIVITIES: '/api/rsbsa/agri-youth-activities',
  LIVELIHOOD_CATEGORIES: '/api/rsbsa/livelihood-categories',
  COMMODITY_CATEGORIES: '/api/rsbsa/commodity-categories',
  COMMODITIES: '/api/rsbsa/commodities'
};

const VALIDATION_SCHEMAS = {
  beneficiaryDetails: {
    required: ['contact_number', 'barangay', 'birth_date', 'sex', 'municipality', 'province', 'region'],
    string: ['contact_number', 'barangay', 'municipality', 'province', 'region', 'place_of_birth', 'religion', 'mothers_maiden_name', 'household_head_name', 'emergency_contact_number', 'name_of_spouse', 'gov_id_type', 'gov_id_number', 'association_name'],
    email: ['email'],
    phone: ['contact_number', 'emergency_contact_number'],
    enum: {
      sex: ['male', 'female'],
      civil_status: ['single', 'married', 'widowed', 'separated', 'divorced'],
      highest_education: ['None', 'Pre-school', 'Elementary', 'Junior High School', 'Senior High School', 'Vocational', 'College', 'Post Graduate'],
      has_government_id: ['yes', 'no'],
      is_association_member: ['yes', 'no'],
      data_source: ['self_registration', 'coordinator_input']
    }
  },
  farmProfile: {
    required: ['livelihood_category_id'],
    integer: ['livelihood_category_id']
  },
  farmParcel: {
    required: ['barangay', 'tenure_type', 'total_farm_area'],
    string: ['parcel_number', 'barangay', 'landowner_name', 'ownership_document_number', 'remarks'],
    decimal: ['total_farm_area'],
    boolean: ['is_ancestral_domain', 'is_agrarian_reform_beneficiary'],
    enum: {
      tenure_type: ['registered_owner', 'tenant', 'lessee'],
      ownership_document_type: [
        'certificate_of_land_transfer', 
        'emancipation_patent', 
        'individual_cloa', 
        'collective_cloa', 
        'co_ownership_cloa', 
        'agricultural_sales_patent', 
        'homestead_patent', 
        'free_patent', 
        'certificate_of_title', 
        'certificate_ancestral_domain_title', 
        'certificate_ancestral_land_title', 
        'tax_declaration', 
        'others'
      ]
    }
  },
  commodity: {
    required: ['commodity_id'],
    integer: ['commodity_id', 'number_of_heads'],
    decimal: ['size_hectares'],
    boolean: ['is_organic_practitioner'],
    string: ['remarks'],
    enum: {
      farm_type: ['irrigated', 'rainfed upland', 'rainfed lowland']
    }
  },
  formSubmission: {
    beneficiaryDetails: {
      required: ['contact_number', 'barangay', 'birth_date', 'sex', 'municipality', 'province', 'region'],
      string: ['contact_number', 'barangay', 'municipality', 'province', 'region', 'place_of_birth', 'religion', 'mothers_maiden_name', 'household_head_name', 'emergency_contact_number', 'name_of_spouse', 'gov_id_type', 'gov_id_number', 'association_name'],
      email: ['email'],
      phone: ['contact_number', 'emergency_contact_number'],
      enum: {
        sex: ['male', 'female'],
        civil_status: ['single', 'married', 'widowed', 'separated', 'divorced'],
        highest_education: ['None', 'Pre-school', 'Elementary', 'Junior High School', 'Senior High School', 'Vocational', 'College', 'Post Graduate'],
        has_government_id: ['yes', 'no'],
        is_association_member: ['yes', 'no']
      }
    },
    farmProfile: {
      required: ['livelihood_category_id'],
      integer: ['livelihood_category_id']
    },
    farmParcel: {
      required: ['barangay', 'tenure_type', 'total_farm_area'],
      string: ['parcel_number', 'barangay', 'landowner_name', 'ownership_document_number', 'remarks'],
      decimal: ['total_farm_area'],
      boolean: ['is_ancestral_domain', 'is_agrarian_reform_beneficiary'],
      enum: {
        tenure_type: ['registered_owner', 'tenant', 'lessee'],
        ownership_document_type: [
          'certificate_of_land_transfer', 
          'emancipation_patent', 
          'individual_cloa', 
          'collective_cloa', 
          'co_ownership_cloa', 
          'agricultural_sales_patent', 
          'homestead_patent', 
          'free_patent', 
          'certificate_of_title', 
          'certificate_ancestral_domain_title', 
          'certificate_ancestral_land_title', 
          'tax_declaration', 
          'others'
        ]
      }
    },
    commodity: {
      required: ['commodity_id'],
      integer: ['commodity_id', 'number_of_heads'],
      decimal: ['size_hectares'],
      boolean: ['is_organic_practitioner'],
      string: ['remarks'],
      enum: {
        farm_type: ['irrigated', 'rainfed upland', 'rainfed lowland']
      }
    }
  }
};

// Helper function to check if livelihood requires farm data
const requiresFarmData = (livelihoodCategoryId) => {
  // Categories that DO NOT require farm parcels:
  // 2 = Farm Worker
  // 4 = Agri-Youth
  const noParcelCategories = [2, 4];
  return !noParcelCategories.includes(Number(livelihoodCategoryId));
};

const validateField = (value, fieldName, rules) => {
  const errors = [];
  if (rules.required && rules.required.includes(fieldName)) {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) errors.push(`${fieldName} is required`);
  }
  if (rules.string && rules.string.includes(fieldName)) {
    if (value && typeof value !== 'string') errors.push(`${fieldName} must be a string`);
  }
  if (rules.integer && rules.integer.includes(fieldName)) {
    if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) errors.push(`${fieldName} must be a positive integer`);
  }
  if (rules.decimal && rules.decimal.includes(fieldName)) {
    if (value && (isNaN(Number(value)) || Number(value) <= 0  )) errors.push(`${fieldName} must be a positive number`);
  }
  if (rules.boolean && rules.boolean.includes(fieldName)) {
    if (value !== undefined && typeof value !== 'boolean') errors.push(`${fieldName} must be a boolean`);
  }
  if (rules.email && rules.email.includes(fieldName)) {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push(`${fieldName} must be a valid email`);
  }
  if (rules.phone && rules.phone.includes(fieldName)) {
    if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) errors.push(`${fieldName} must be a valid phone number`);
  }
  if (rules.enum && rules.enum[fieldName]) {
    if (value === '' || value === null || value === undefined) {
      // allow empty for nullable enums
    } else if (!rules.enum[fieldName].includes(value)) {
      errors.push(`${fieldName} must be one of: ${rules.enum[fieldName].join(', ')}`);
    }
  }
  return errors;
};

const validateObject = (data, schema) => {
  const errors = {};
  let hasErrors = false;
  Object.keys(schema).forEach(ruleType => {
    if (ruleType === 'enum') {
      Object.keys(schema[ruleType]).forEach(fieldName => {
        const fe = validateField(data[fieldName], fieldName, { enum: { [fieldName]: schema[ruleType][fieldName] } });
        if (fe.length > 0) { errors[fieldName] = fe; hasErrors = true; }
      });
    } else {
      schema[ruleType].forEach(fieldName => {
        const fe = validateField(data[fieldName], fieldName, { [ruleType]: [fieldName] });
        if (fe.length > 0) { errors[fieldName] = fe; hasErrors = true; }
      });
    }
  });
  return { errors, hasErrors };
};

const logError = (context, error, additionalData = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: { message: error.message, stack: error.stack, name: error.name },
    additionalData,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  };
  console.error(`[RSBSA Error] ${context}:`, errorInfo);
};

const createResponse = (success, data = null, error = null, validationErrors = null) => {
  return { success, data, error, ...(validationErrors && { validationErrors }) };
};

/* ---------------- Beneficiary Details ---------------- */

export const beneficiaryDetailsService = {
  async createDetails(detailsData) {
    try {
      const validation = validateObject(detailsData, VALIDATION_SCHEMAS.beneficiaryDetails);
      if (validation.hasErrors) {
        const error = new Error('Beneficiary details validation failed');
        error.validationErrors = validation.errors;
        throw error;
      }
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.BENEFICIARY_DETAILS, detailsData);
      return createResponse(true, response.data?.data);
    } catch (error) {
      console.error('API error createDetails:', error.response?.status, error.config?.url, error.response?.data, error.config?.data);
      logError('Create Beneficiary Details', error, { detailsData });
      return createResponse(false, null, error.response?.data?.message || 'Failed to create beneficiary details', error.response?.data?.errors || error.validationErrors);
    }
  },
  async getDetailsByUserId(userId) {
    try {
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.BENEFICIARY_DETAILS}/user/${userId}`);
      return createResponse(true, response.data?.data);
    } catch (error) {
      logError('Get Beneficiary Details By User ID', error, { userId });
      return createResponse(false, null, error.response?.data?.message || 'Failed to fetch user details');
    }
  },
  async updateDetails(detailsId, updateData) {
    try {
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.BENEFICIARY_DETAILS}/${detailsId}`, updateData);
      return createResponse(true, response.data?.data);
    } catch (error) {
      console.error('API error updateDetails:', error.response?.status, error.config?.url, error.response?.data, error.config?.data);
      logError('Update Beneficiary Details', error, { detailsId, updateData });
      return createResponse(false, null, error.response?.data?.message || 'Failed to update beneficiary details', error.response?.data?.errors);
    }
  }
};

/* ---------------- Farm Profile ---------------- */

export const farmProfileService = {
  async createProfile(profileData) {
    try {
      if (!profileData.livelihood_category_id) return createResponse(false, null, 'Livelihood category is required');
      const validation = validateObject(profileData, VALIDATION_SCHEMAS.farmProfile);
      if (validation.hasErrors) {
        const error = new Error('Farm profile validation failed');
        error.validationErrors = validation.errors;
        throw error;
      }
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.FARM_PROFILES, profileData);
      return createResponse(true, response.data?.data);
    } catch (error) {
      logError('Create Farm Profile', error, { profileData });
      return createResponse(false, null, error.response?.data?.message || 'Failed to create farm profile', error.response?.data?.errors || error.validationErrors);
    }
  }
};

/* ---------------- Farm Parcels ---------------- */
export const farmParcelsService = {
  async createMultipleParcels(parcelsData) {
    try {
      const validationErrors = [];
      
      for (let i = 0; i < parcelsData.length; i++) {
        const parcel = parcelsData[i];
        
        const parcelValidation = validateObject(parcel, VALIDATION_SCHEMAS.farmParcel);
        
        if (parcelValidation.hasErrors) {
          validationErrors.push({
            parcelIndex: i + 1,
            parcelData: parcel,
            errors: parcelValidation.errors,
          });
        }

        if (parcel.commodities && Array.isArray(parcel.commodities)) {
          for (let j = 0; j < parcel.commodities.length; j++) {
            const commodity = parcel.commodities[j];
            const commodityValidation = validateObject(commodity, VALIDATION_SCHEMAS.commodity);
            
            if (commodityValidation.hasErrors) {
              validationErrors.push({
                parcelIndex: i + 1,
                commodityIndex: j + 1,
                commodityData: commodity,
                errors: commodityValidation.errors,
              });
            }
          }
        } else {
          validationErrors.push({
            parcelIndex: i + 1,
            parcelData: parcel,
            errors: { commodities: ['At least one commodity is required'] },
          });
        }
      }

      if (validationErrors.length > 0) {
        return createResponse(
          false,
          null,
          "Validation failed for one or more parcels",
          validationErrors
        );
      }

      const response = await axiosInstance.post(
        `${RSBSA_ENDPOINTS.FARM_PARCELS}/bulk`,
        { 
          parcels: parcelsData
        }
      );

      return createResponse(true, response.data?.data);
      
    } catch (error) {
      logError("Create Multiple Parcels", error, { parcelsData });
      
      return createResponse(
        false,
        null,
        error.response?.data?.message || "Failed to create farm parcels",
        error.response?.data?.errors
      );
    }
  },
};

/* ---------------- Beneficiary Livelihoods ---------------- */

export const beneficiaryLivelihoodsService = {
  async createBeneficiaryLivelihood(livelihoodData) {
    try {
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.BENEFICIARY_LIVELIHOODS, livelihoodData);
      
      // Handle both new creation and reuse of existing relationship
      if (response.data.success) {
        const result = createResponse(true, response.data.data);
        
        // Add warning if it's reusing existing relationship
        if (response.data.warning) {
          result.warning = response.data.warning;
          result.message = response.data.message;
        }
        
        return result;
      }
      
      return createResponse(response.data.success, response.data.data, response.data.message);
    } catch (error) {
      logError('Create Beneficiary Livelihood', error, { livelihoodData });
      return createResponse(false, null, error.response?.data?.message || 'Failed to create beneficiary livelihood', error.response?.data?.errors);
    }
  }
};

/* ---------------- Activities ---------------- */

export const activityService = {
  async createActivity(activityType, activitiesData) {
    const endpoints = {
      farmer: RSBSA_ENDPOINTS.FARMER_ACTIVITIES,
      fisherfolk: RSBSA_ENDPOINTS.FISHERFOLK_ACTIVITIES,
      farmworker: RSBSA_ENDPOINTS.FARMWORKER_ACTIVITIES,
      agri_youth: RSBSA_ENDPOINTS.AGRI_YOUTH_ACTIVITIES
    };
    const endpoint = endpoints[activityType];
    if (!endpoint) return createResponse(false, null, `Unknown activity type: ${activityType}`);
    try {
      const response = await axiosInstance.post(endpoint, activitiesData);
      return createResponse(true, response.data?.data);
    } catch (error) {
      logError(`Create ${activityType} Activities`, error, { activitiesData });
      return createResponse(false, null, error.response?.data?.message || `Failed to create ${activityType} activities`, error.response?.data?.errors);
    }
  }
};

/* ---------------- Reference Data ---------------- */

export const referenceDataService = {
  async getLivelihoodCategories() {
    try {
      const response = await axiosInstance.get(RSBSA_ENDPOINTS.LIVELIHOOD_CATEGORIES);
      return createResponse(true, response.data?.data);
    } catch (error) {
      logError('Get Livelihood Categories', error);
      return createResponse(false, null, error.response?.data?.message || 'Failed to fetch livelihood categories');
    }
  },
  async getCommodities() {
    try {
      const response = await axiosInstance.get(RSBSA_ENDPOINTS.COMMODITIES);
      return createResponse(true, response.data?.data);
    } catch (error) {
      logError('Get Commodities', error);
      return createResponse(false, null, error.response?.data?.message || 'Failed to fetch commodities');
    }
  }
};

/* ---------------- RSBSA Form Orchestration ---------------- */

export const rsbsaFormService = {
  async submitCompleteForm(formData, userId) {
    try {
      console.log('[submitCompleteForm] Starting submission for userId:', userId);
      console.log('[submitCompleteForm] Livelihood Category ID:', formData.farmProfile?.livelihood_category_id);
      
      const formValidation = this.validateFormSubmission(formData);
      if (formValidation.hasErrors) {
        console.error('[submitCompleteForm] Validation errors:', formValidation.errors);
        return createResponse(false, null, 'Form validation failed', formValidation.errors);
      }

      let beneficiaryDetailsId;
      let beneficiaryResult;

      // Step 1: Beneficiary details
      try {
        const b = formData.beneficiaryDetails || {};

        const uid =
          Number(userId) ||
          Number(formData?.beneficiaryDetails?.user_id) ||
          Number((() => { try { return JSON.parse(localStorage.getItem('user') || '{}')?.id; } catch { return null; } })());

        if (!uid) {
          return createResponse(false, null, 'User ID missing - cannot submit');
        }

        const beneficiaryPayload = {
          user_id: uid,
          system_generated_rsbsa_number: b.system_generated_rsbsa_number ?? null,
          manual_rsbsa_number: b.manual_rsbsa_number ?? null,
          barangay: b.barangay || null,
          municipality: b.municipality || 'Opol',
          province: b.province || 'Misamis Oriental',
          region: b.region || 'Region X (Northern Mindanao)',
          contact_number: b.contact_number || null,
          emergency_contact_number: b.emergency_contact_number || null,
          birth_date: b.birth_date ? b.birth_date.toString().slice(0,10) : null,
          place_of_birth: b.place_of_birth || null,
          sex: ['male','female'].includes((b.sex||'').toLowerCase()) ? b.sex.toLowerCase() : null,
          civil_status: b.civil_status || null,
          name_of_spouse: b.name_of_spouse || null,
          highest_education: b.highest_education || null,
          religion: b.religion || null,
          is_pwd: !!b.is_pwd,
          has_government_id: b.has_government_id || 'no',
          gov_id_type: b.gov_id_type || null,
          gov_id_number: b.gov_id_number || null,
          is_association_member: b.is_association_member || 'no',
          association_name: b.association_name || null,
          mothers_maiden_name: b.mothers_maiden_name || null,
          is_household_head: !!b.is_household_head,
          household_head_name: b.household_head_name || null,
          data_source: 'self_registration',
        };

        const existingResult = await beneficiaryDetailsService.getDetailsByUserId(uid);
        if (existingResult.success && existingResult.data) {
          beneficiaryDetailsId = existingResult.data.id;
          beneficiaryResult = await beneficiaryDetailsService.updateDetails(beneficiaryDetailsId, beneficiaryPayload);
          if (!beneficiaryResult.success) return createResponse(false, null, beneficiaryResult.error, beneficiaryResult.validationErrors);
        } else {
          beneficiaryResult = await beneficiaryDetailsService.createDetails(beneficiaryPayload);
          if (!beneficiaryResult.success) return createResponse(false, null, beneficiaryResult.error, beneficiaryResult.validationErrors);
          beneficiaryDetailsId = beneficiaryResult.data.id;
        }
      } catch (error) {
        console.error('[submitCompleteForm] Error in beneficiary details:', error);
        return createResponse(false, null, 'Failed to handle beneficiary details');
      }
      if (!beneficiaryResult.success) return beneficiaryResult;

      // Step 2: Farm profile
      const farmProfileResult = await farmProfileService.createProfile({
        beneficiary_id: beneficiaryDetailsId,
        livelihood_category_id: formData.farmProfile?.livelihood_category_id
      });
      if (!farmProfileResult.success) return farmProfileResult;
      const farmProfileId = farmProfileResult.data.id;

      // Step 3: Farm parcels (only if livelihood requires it)
      const livelihoodId = formData.farmProfile?.livelihood_category_id;
      const needsFarmData = requiresFarmData(livelihoodId);
      console.log('[submitCompleteForm] Livelihood ID:', livelihoodId, '| Needs Farm Data:', needsFarmData);

      let parcelsResult = createResponse(true, []);
      
      if (needsFarmData) {
        const parcelsData = (formData.farmParcels || []).map(p => ({
          farm_profile_id: farmProfileId,
          parcel_number: p.parcel_number || null,
          barangay: p.barangay,
          total_farm_area: Number(p.total_farm_area || 0),
          tenure_type: p.tenure_type,
          landowner_name: p.landowner_name || null,
          ownership_document_number: p.ownership_document_number || null,
          ownership_document_type: p.ownership_document_type || null,
          is_ancestral_domain: !!p.is_ancestral_domain,
          is_agrarian_reform_beneficiary: !!p.is_agrarian_reform_beneficiary,
          remarks: p.remarks || null,
          commodities: (p.commodities || []).map(c => ({
            commodity_id: c.commodity_id,  
            size_hectares: c.size_hectares || null,
            number_of_heads: c.number_of_heads || null,
            farm_type: c.farm_type || null,
            is_organic_practitioner: !!c.is_organic_practitioner,
            remarks: c.remarks || null
          }))
        }));

        console.log('[submitCompleteForm] Creating farm parcels:', parcelsData.length);

        if (parcelsData.length > 0) {
          parcelsResult = await farmParcelsService.createMultipleParcels(parcelsData);
          if (!parcelsResult.success) return parcelsResult;
        }
      } else {
        console.log('[submitCompleteForm] Skipping farm parcels - not required for this livelihood type');
      }

      // Step 4: Livelihoods + activities
      const livelihoodResults = await this.createLivelihoodsAndActivities(formData, userId, beneficiaryDetailsId);
      if (!livelihoodResults.success) return livelihoodResults;

      // Step 5: Enrollment
      const enrollmentData = {
        user_id: Number(userId) || Number(formData?.beneficiaryDetails?.user_id),
        beneficiary_id: beneficiaryDetailsId,
        farm_profile_id: farmProfileId,
        enrollment_year: new Date().getFullYear(),
        enrollment_type: 'new',
        application_status: 'pending'
      };
      const enrollmentResult = await this.createEnrollment(enrollmentData);
      if (!enrollmentResult.success) return enrollmentResult;

      console.log('[submitCompleteForm] Submission successful!');

      return createResponse(true, {
        enrollment: enrollmentResult.data,
        beneficiaryDetails: beneficiaryResult.data,
        farmProfile: farmProfileResult.data,
        farmParcels: parcelsResult.data,
        livelihoods: livelihoodResults.data
      });
    } catch (error) {
      console.error('[submitCompleteForm] Unexpected error:', error);
      logError('Submit Complete Form', error, { formData, userId });
      return createResponse(false, null, 'Failed to submit RSBSA application');
    }
  },

  async createEnrollment(enrollmentData) {
    try {
      const requiredFields = ['user_id', 'beneficiary_id', 'farm_profile_id'];
      const missingFields = requiredFields.filter(field => !enrollmentData[field]);
      
      if (missingFields.length > 0) {
        return createResponse(false, null, `Missing required fields: ${missingFields.join(', ')}`);
      }

      const enrollmentPayload = {
        user_id: enrollmentData.user_id,
        beneficiary_id: enrollmentData.beneficiary_id,
        farm_profile_id: enrollmentData.farm_profile_id,
        enrollment_year: enrollmentData.enrollment_year,
        enrollment_type: enrollmentData.enrollment_type || 'new',
        application_status: enrollmentData.application_status || 'pending'
      };

      Object.keys(enrollmentPayload).forEach(key => {
        if (enrollmentPayload[key] === undefined) {
          delete enrollmentPayload[key];
        }
      });

      const response = await axiosInstance.post(RSBSA_ENDPOINTS.ENROLLMENTS, enrollmentPayload);
      return createResponse(true, response.data?.data);
      
    } catch (error) {
      console.error('API error createEnrollment:', error.response?.status, error.config?.url, error.response?.data);
      logError('Create Enrollment', error, { enrollmentData });
      
      return createResponse(
        false, 
        null, 
        error.response?.data?.message || 'Failed to create enrollment',
        error.response?.data?.errors
      );
    }
  },

  async createLivelihoodsAndActivities(formData, userId, beneficiaryDetailsId) {
    try {
      const results = [];
      let list = formData.beneficiaryLivelihoods || [];
      if (list.length === 0 && formData.farmProfile?.livelihood_category_id) {
        list = [{ livelihood_category_id: formData.farmProfile.livelihood_category_id }];
      }
      if (list.length === 0) return createResponse(false, null, 'At least one livelihood must be specified');

      for (const l of list) {
        const liv = await beneficiaryLivelihoodsService.createBeneficiaryLivelihood({
          beneficiary_id: beneficiaryDetailsId,
          livelihood_category_id: l.livelihood_category_id
        });
        if (!liv.success) return liv;

        const type = { 1: 'farmer', 3: 'fisherfolk', 2: 'farmworker', 4: 'agri_youth' }[l.livelihood_category_id];
        const actData = {
          farmer: formData.farmerActivities,
          fisherfolk: formData.fisherfolkActivities,
          farmworker: formData.farmworkerActivities,
          agri_youth: formData.agriYouthActivities
        }[type];

        if (type && actData) {
          const act = await activityService.createActivity(type, { ...actData, beneficiary_livelihood_id: liv.data.id });
          if (!act.success) return act;
          results.push({ livelihood: liv.data, activities: act.data });
        } else {
          results.push({ livelihood: liv.data, activities: null });
        }
      }
      return createResponse(true, results);
    } catch (error) {
      logError('Create Livelihoods and Activities', error, { formData, userId, beneficiaryDetailsId });
      return createResponse(false, null, 'Failed to create livelihoods and activities');
    }
  },

  validateFormSubmission(formData) {
    console.log('[validateFormSubmission] Starting validation');
    console.log('[validateFormSubmission] Livelihood Category:', formData.farmProfile?.livelihood_category_id);
    
    const errors = {};
    let hasErrors = false;

    // Validate beneficiary details
    if (formData.beneficiaryDetails) {
      const res = validateObject(formData.beneficiaryDetails, VALIDATION_SCHEMAS.formSubmission.beneficiaryDetails);
      if (res.hasErrors) { 
        errors.beneficiaryDetails = res.errors; 
        hasErrors = true; 
        console.log('[validateFormSubmission] Beneficiary details errors:', res.errors);
      }
    } else {
      errors.beneficiaryDetails = { general: ['Beneficiary details are required'] };
      hasErrors = true;
    }

    // Validate farm profile
    if (formData.farmProfile) {
      const res = validateObject(formData.farmProfile, VALIDATION_SCHEMAS.formSubmission.farmProfile);
      if (res.hasErrors) { 
        errors.farmProfile = res.errors; 
        hasErrors = true;
        console.log('[validateFormSubmission] Farm profile errors:', res.errors);
      }
    } else {
      errors.farmProfile = { general: ['Farm profile is required'] };
      hasErrors = true;
    }

    // FIXED: Only validate farm parcels for Farmers (1) and Fisherfolk (3)
    // Farm Workers (2) and Agri-Youth (4) don't need farm parcels
    const livelihoodId = formData.farmProfile?.livelihood_category_id;
    const needsFarmData = requiresFarmData(livelihoodId);
    
    console.log('[validateFormSubmission] Needs farm data:', needsFarmData);

    if (needsFarmData) {
      // Only validate parcels if required for this livelihood type
      if (formData.farmParcels && formData.farmParcels.length > 0) {
        const parcelErrors = {};
        formData.farmParcels.forEach((parcel, i) => {
          // Validate parcel structure
          const parcelValidation = validateObject(parcel, VALIDATION_SCHEMAS.formSubmission.farmParcel);
          if (parcelValidation.hasErrors) {
            Object.keys(parcelValidation.errors).forEach(fieldName => {
              const errorKey = `parcels.${i}.${fieldName}`;
              parcelErrors[errorKey] = parcelValidation.errors[fieldName];
            });
            hasErrors = true;
          }

          // Validate commodities
          if (!parcel.commodities || parcel.commodities.length === 0) {
            parcelErrors[`parcels.${i}.commodities`] = ['At least one commodity is required'];
            hasErrors = true;
          } else {
            parcel.commodities.forEach((commodity, j) => {
              const commodityValidation = validateObject(commodity, VALIDATION_SCHEMAS.formSubmission.commodity);
              if (commodityValidation.hasErrors) {
                Object.keys(commodityValidation.errors).forEach(fieldName => {
                  const errorKey = `parcels.${i}.commodities.${j}.${fieldName}`;
                  parcelErrors[errorKey] = commodityValidation.errors[fieldName];
                });
                hasErrors = true;
              }
            });
          }
        });
        if (Object.keys(parcelErrors).length > 0) {
          Object.assign(errors, parcelErrors);
          console.log('[validateFormSubmission] Parcel errors:', parcelErrors);
        }
      } else {
        // Farm parcels required but none provided
        errors.farmParcels = { general: ['At least one farm parcel is required for this livelihood type'] };
        hasErrors = true;
        console.log('[validateFormSubmission] No farm parcels provided, but required for livelihood:', livelihoodId);
      }
    } else {
      console.log('[validateFormSubmission] Farm parcels not required for livelihood:', livelihoodId);
    }

    // Validate livelihoods
    const hasLivelihoodCategory = formData.farmProfile?.livelihood_category_id;
    const hasBeneficiaryLivelihoods = formData.beneficiaryLivelihoods?.length > 0;
    if (!hasLivelihoodCategory && !hasBeneficiaryLivelihoods) {
      errors.livelihoods = { general: ['At least one livelihood must be selected'] };
      hasErrors = true;
    }

    console.log('[validateFormSubmission] Validation complete. Has errors:', hasErrors);
    if (hasErrors) {
      console.log('[validateFormSubmission] All errors:', errors);
    }

    return { errors, hasErrors };
  },

  validateCompleteForm(formData) {
    console.warn('validateCompleteForm is deprecated. Use validateFormSubmission instead.');
    return this.validateFormSubmission(formData);
  },

  validateDraftForm(formData) {
    const errors = {};
    let hasErrors = false;
    if (formData.beneficiaryDetails) {
      ['contact_number', 'barangay'].forEach(field => {
        if (formData.beneficiaryDetails[field] && typeof formData.beneficiaryDetails[field] === 'string' && formData.beneficiaryDetails[field].trim() === '') {
          errors[field] = [`${field} cannot be empty if provided`];
          hasErrors = true;
        }
      });
    }
    return { errors, hasErrors };
  }
};