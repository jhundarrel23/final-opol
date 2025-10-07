/* eslint-disable react/self-closing-comp */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Print as PrintIcon, Close as CloseIcon } from '@mui/icons-material';

// Import logos
import daLogo from './logo/Department_of_Agriculture_of_the_Philippines.svg.png';
import anikitaLogo from './logo/anikita.png';

const PrintableRSBSAForm = ({ open, onClose, interviewData }) => {
  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), 'MM/dd/yyyy') : '';
    } catch (error) {
      return '';
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('rsbsa-print-content');
    if (printContent) {
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>RSBSA Form - ${interviewData?.user?.fname} ${interviewData?.user?.lname}</title>
          <meta charset="utf-8">
          <style>
            @page { margin: 0.4in; size: A4; }
            * { box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 10px; 
              font-size: 9px; 
              line-height: 1.2; 
              color: #000; 
              background: white; 
            }
            .form-container { width: 100%; max-width: 8.5in; margin: 0 auto; border: 2px solid #000; }
            .page { page-break-after: always; border-bottom: 2px solid #000; }
            .page:last-child { page-break-after: auto; border-bottom: none; }
            
            /* Header */
            .form-header { 
              border-bottom: 2px solid #000; 
              padding: 8px; 
              display: grid;
              grid-template-columns: 80px 1fr 120px;
              gap: 10px;
              align-items: center;
            }
            .logo-img { width: 70px; height: 70px; object-fit: contain; }
            .header-center { text-align: center; }
            .header-center h1 { font-size: 14px; font-weight: bold; margin: 0 0 2px 0; letter-spacing: 2px; }
            .header-center h2 { font-size: 11px; font-weight: bold; margin: 0 0 1px 0; }
            .header-center h3 { font-size: 9px; margin: 0; font-weight: normal; }
            .photo-box { 
              width: 100px; 
              height: 100px; 
              border: 2px solid #000; 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center;
              text-align: center;
              font-size: 8px;
              font-weight: bold;
              margin-left: auto;
            }
            .photo-box-label { font-size: 10px; margin-bottom: 3px; }
            
            /* Reference Section */
            .reference-row { 
              display: grid; 
              grid-template-columns: 1fr 280px; 
              border-bottom: 1px solid #000;
              font-size: 8px;
            }
            .ref-left, .ref-right { padding: 4px 8px; display: flex; align-items: center; gap: 4px; }
            .ref-right { border-left: 1px solid #000; }
            .ref-label { font-weight: bold; white-space: nowrap; }
            .ref-boxes { display: flex; gap: 2px; }
            .ref-box { 
              width: 16px; 
              height: 18px; 
              border: 1px solid #000; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              font-weight: bold;
            }
            
            /* Section Headers */
            .section-header { 
              background-color: #000; 
              color: white; 
              padding: 4px 8px; 
              font-weight: bold; 
              font-size: 9px;
              text-align: center;
              letter-spacing: 0.5px;
            }
            
            /* Form Fields */
            .form-grid { 
              display: grid; 
              grid-template-columns: repeat(12, 1fr); 
              border-bottom: 1px solid #000;
            }
            .field { 
              padding: 3px 5px; 
              border-right: 1px solid #000; 
              display: flex;
              flex-direction: column;
              gap: 1px;
            }
            .field:last-child { border-right: none; }
            .field-label { 
              font-size: 7px; 
              font-weight: bold; 
              text-transform: uppercase;
              line-height: 1.1;
            }
            .field-value { 
              font-size: 9px; 
              border-bottom: 1px solid #000; 
              min-height: 14px;
              padding: 1px 2px;
            }
            .field-inline { display: flex; align-items: center; gap: 3px; }
            
            /* Checkboxes */
            .checkbox { 
              width: 10px; 
              height: 10px; 
              border: 1px solid #000; 
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: bold;
              flex-shrink: 0;
            }
            .checkbox-group { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
            .checkbox-item { display: flex; align-items: center; gap: 2px; font-size: 8px; }
            
            /* Tables */
            table { width: 100%; border-collapse: collapse; font-size: 8px; }
            th, td { border: 1px solid #000; padding: 3px; text-align: left; vertical-align: top; }
            th { background-color: #e0e0e0; font-weight: bold; text-align: center; }
            
            /* Parcel Section */
            .parcel-row { border: 1px solid #000; margin-bottom: 5px; }
            .parcel-grid { 
              display: grid; 
              grid-template-columns: 30px 1fr 1fr 80px 80px 80px 80px;
              border-bottom: 1px solid #000;
            }
            .parcel-detail { 
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              border-bottom: 1px solid #000;
            }
            .parcel-field { 
              padding: 3px 5px;
              border-right: 1px solid #000;
              font-size: 7px;
            }
            .parcel-field:last-child { border-right: none; }
            
            /* Signatures */
            .signature-row { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 10px; 
              padding: 15px 10px 10px;
              border-bottom: 1px solid #000;
            }
            .sig-box { text-align: center; }
            .sig-line { border-bottom: 1px solid #000; height: 25px; margin-bottom: 3px; }
            .sig-label { font-size: 7px; font-weight: bold; text-transform: uppercase; }
            
            /* Footer */
            .footer { padding: 8px; font-size: 7px; line-height: 1.3; background-color: #f5f5f5; }
            .footer p { margin: 2px 0; }
            .footer-title { font-weight: bold; text-align: center; margin-bottom: 5px; }
            
            @media print { 
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } 
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="form-container">
            ${printContent.innerHTML}
          </div>
        </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
          newWindow.close();
        }, 500);
      };
    }
  };

  if (!interviewData) return null;

  const userInfo = interviewData.user || {};
  const beneficiaryDetails = interviewData.beneficiary_detail || {};
  const farmProfile = interviewData.farm_profile || {};
  const farmParcels = farmProfile.farm_parcels || [];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '95vh', maxHeight: '95vh' } }}
    >
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }} className="no-print">
        <Typography variant="h6">RSBSA Form - Print Preview</Typography>
        <Box>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ mr: 1 }}>
            Print
          </Button>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogActions>

      <DialogContent sx={{ p: 2, overflow: 'auto', bgcolor: '#f5f5f5' }}>
        <Box 
          id="rsbsa-print-content" 
          sx={{ 
            bgcolor: 'white',
            p: 1,
            maxWidth: '8.5in',
            margin: '0 auto',
            fontSize: '9px',
            border: '2px solid #000',
            fontFamily: 'Arial, sans-serif',
            '& *': { boxSizing: 'border-box' },
            
            // Form Header
            '& .form-header': { 
              borderBottom: '2px solid #000', 
              p: 1,
              display: 'grid',
              gridTemplateColumns: '80px 1fr 120px',
              gap: '10px',
              alignItems: 'center'
            },
            '& .logo-img': { width: '70px', height: '70px', objectFit: 'contain' },
            '& .header-center': { textAlign: 'center' },
            '& .header-center h1': { fontSize: '14px', fontWeight: 'bold', m: 0, mb: '2px', letterSpacing: '2px' },
            '& .header-center h2': { fontSize: '11px', fontWeight: 'bold', m: 0, mb: '1px' },
            '& .header-center h3': { fontSize: '9px', m: 0, fontWeight: 'normal' },
            '& .photo-box': { 
              width: '100px', 
              height: '100px', 
              border: '2px solid #000', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: '8px',
              fontWeight: 'bold',
              ml: 'auto'
            },
            '& .photo-box-label': { fontSize: '10px', mb: '3px' },
            
            // Reference Section
            '& .reference-row': { 
              display: 'grid', 
              gridTemplateColumns: '1fr 280px', 
              borderBottom: '1px solid #000',
              fontSize: '8px'
            },
            '& .ref-left, & .ref-right': { p: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' },
            '& .ref-right': { borderLeft: '1px solid #000' },
            '& .ref-label': { fontWeight: 'bold', whiteSpace: 'nowrap' },
            '& .ref-boxes': { display: 'flex', gap: '2px' },
            '& .ref-box': { 
              width: '16px', 
              height: '18px', 
              border: '1px solid #000', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold'
            },
            
            // Section Headers
            '& .section-header': { 
              bgcolor: '#000', 
              color: 'white', 
              p: '4px 8px', 
              fontWeight: 'bold', 
              fontSize: '9px',
              textAlign: 'center',
              letterSpacing: '0.5px'
            },
            
            // Form Fields
            '& .form-grid': { 
              display: 'grid', 
              gridTemplateColumns: 'repeat(12, 1fr)', 
              borderBottom: '1px solid #000'
            },
            '& .field': { 
              p: '3px 5px', 
              borderRight: '1px solid #000', 
              display: 'flex',
              flexDirection: 'column',
              gap: '1px'
            },
            '& .field:last-child': { borderRight: 'none' },
            '& .field-label': { 
              fontSize: '7px', 
              fontWeight: 'bold', 
              textTransform: 'uppercase',
              lineHeight: 1.1
            },
            '& .field-value': { 
              fontSize: '9px', 
              borderBottom: '1px solid #000', 
              minHeight: '14px',
              p: '1px 2px'
            },
            '& .field-inline': { display: 'flex', alignItems: 'center', gap: '3px' },
            
            // Checkboxes
            '& .checkbox': { 
              width: '10px', 
              height: '10px', 
              border: '1px solid #000', 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: 'bold',
              flexShrink: 0
            },
            '& .checkbox-group': { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
            '& .checkbox-item': { display: 'flex', alignItems: 'center', gap: '2px', fontSize: '8px' },
            
            // Tables
            '& table': { width: '100%', borderCollapse: 'collapse', fontSize: '8px' },
            '& th, & td': { border: '1px solid #000', p: '3px', textAlign: 'left', verticalAlign: 'top' },
            '& th': { bgcolor: '#e0e0e0', fontWeight: 'bold', textAlign: 'center' },
            
            // Signatures
            '& .signature-row': { 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '10px', 
              p: '15px 10px 10px',
              borderBottom: '1px solid #000'
            },
            '& .sig-box': { textAlign: 'center' },
            '& .sig-line': { borderBottom: '1px solid #000', height: '25px', mb: '3px' },
            '& .sig-label': { fontSize: '7px', fontWeight: 'bold', textTransform: 'uppercase' },
            
            // Footer
            '& .footer': { p: 1, fontSize: '7px', lineHeight: 1.3, bgcolor: '#f5f5f5' },
            '& .footer p': { m: '2px 0' },
            '& .footer-title': { fontWeight: 'bold', textAlign: 'center', mb: '5px' }
          }}
        >
          {/* PAGE 1 */}
          <div className="page">
          {/* HEADER */}
          <div className="form-header">
            <img src={daLogo} alt="DA Logo" className="logo-img" />
            <div className="header-center">
              <h1>ANI AT KITA<br/>RSBSA ENROLLMENT FORM</h1>
              <h2>REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA)</h2>
              <h3>ENROLLMENT CLIENT'S COPY</h3>
            </div>
            <div className="photo-box">
              <div className="photo-box-label">2x2<br/>PICTURE</div>
              <div style={{ fontSize: '7px', marginTop: '5px' }}>PHOTO TAKEN<br/>WITHIN 6 MONTHS</div>
            </div>
          </div>

          {/* REFERENCE SECTION */}
          <div className="reference-row">
            <div className="ref-left">
              <span className="ref-label">ENROLLMENT TYPE & DATE ADMINISTERED:</span>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.enrollment_type === 'New' ? '✓' : ''}</span>
                  <span>New</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.enrollment_type === 'Updating' ? '✓' : ''}</span>
                  <span>Updating</span>
                </div>
              </div>
            </div>
            <div className="ref-right">
              <span className="ref-label">REFERENCE NUMBER:</span>
              <div className="ref-boxes">
                {(beneficiaryDetails.system_generated_rsbsa_number || '05        ').split('').slice(0, 10).map((char, i) => (
                  <div key={i} className="ref-box">{char.trim()}</div>
                ))}
              </div>
            </div>
          </div>

          {/* PART I - PERSONAL INFORMATION */}
          <div className="section-header">PART I - PERSONAL INFORMATION</div>
          
          {/* Name Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">Surname</span>
              <div className="field-value">{userInfo.lname || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">First Name</span>
              <div className="field-value">{userInfo.fname || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">Middle Name</span>
              <div className="field-value">{userInfo.mname || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">Extension Name</span>
              <div className="field-value">{userInfo.extension_name || ''}</div>
            </div>
          </div>

          {/* Sex Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <span className="field-label">Sex</span>
              <div className="field-inline">
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <span className="checkbox">{beneficiaryDetails.sex === 'male' ? '✓' : ''}</span>
                    <span>Male</span>
                  </div>
                  <div className="checkbox-item">
                    <span className="checkbox">{beneficiaryDetails.sex === 'female' ? '✓' : ''}</span>
                    <span>Female</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="field" style={{ gridColumn: 'span 10' }}></div>
          </div>

          {/* Address Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <span className="field-label">House/Lot/Bldg No./Purok</span>
              <div className="field-value">{beneficiaryDetails.house_no || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">Street/Sitio/Subdiv</span>
              <div className="field-value">{beneficiaryDetails.street || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">Barangay</span>
              <div className="field-value">{beneficiaryDetails.barangay || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <span className="field-label">Municipality/City</span>
              <div className="field-value">{beneficiaryDetails.municipality || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <span className="field-label">Province</span>
              <div className="field-value">{beneficiaryDetails.province || ''}</div>
            </div>
          </div>

          {/* Contact Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Mobile Number</span>
              <div className="field-value">{userInfo.phone_number || beneficiaryDetails.contact_number || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Landline Number</span>
              <div className="field-value">{beneficiaryDetails.landline_number || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Region</span>
              <div className="field-value">{beneficiaryDetails.region || ''}</div>
            </div>
          </div>

          {/* Birth Info Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">Date of Birth</span>
              <div className="field-value">{formatDate(beneficiaryDetails.birth_date)}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 5' }}>
              <span className="field-label">Place of Birth</span>
              <div className="field-value">{beneficiaryDetails.place_of_birth || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Religion</span>
              <div className="field-inline">
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <span className="checkbox">{beneficiaryDetails.religion === 'Christianity' ? '✓' : ''}</span>
                    <span>Christian</span>
                  </div>
                  <div className="checkbox-item">
                    <span className="checkbox">{beneficiaryDetails.religion === 'Islam' ? '✓' : ''}</span>
                    <span>Islam</span>
                  </div>
                  <div className="checkbox-item">
                    <span className="checkbox">{beneficiaryDetails.religion === 'Others' ? '✓' : ''}</span>
                    <span>Others</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education & PWD Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 6' }}>
              <span className="field-label">Highest Formal Education</span>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.highest_education === 'Pre-school' ? '✓' : ''}</span>
                  <span>Pre-school</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.highest_education === 'Elementary' ? '✓' : ''}</span>
                  <span>Elementary</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.highest_education === 'Junior High School (7-10)' ? '✓' : ''}</span>
                  <span>Jr HS</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.highest_education === 'Senior High School (11-12)' ? '✓' : ''}</span>
                  <span>Sr HS</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.highest_education === 'Vocational' ? '✓' : ''}</span>
                  <span>Vocational</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.highest_education === 'College' ? '✓' : ''}</span>
                  <span>College</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.highest_education === 'Post Graduate' ? '✓' : ''}</span>
                  <span>Post Grad</span>
                </div>
              </div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">Person with Disability (PWD)</span>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.is_pwd ? '✓' : ''}</span>
                  <span>Yes</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{!beneficiaryDetails.is_pwd ? '✓' : ''}</span>
                  <span>No</span>
                </div>
              </div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">4Ps Beneficiary?</span>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.is_4ps ? '✓' : ''}</span>
                  <span>Yes</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{!beneficiaryDetails.is_4ps ? '✓' : ''}</span>
                  <span>No</span>
                </div>
              </div>
            </div>
          </div>

          {/* Civil Status Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Civil Status</span>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.civil_status === 'Single' ? '✓' : ''}</span>
                  <span>Single</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.civil_status === 'Married' ? '✓' : ''}</span>
                  <span>Married</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.civil_status === 'Widowed' ? '✓' : ''}</span>
                  <span>Widowed</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.civil_status === 'Separated' ? '✓' : ''}</span>
                  <span>Separated</span>
                </div>
              </div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Name of Spouse</span>
              <div className="field-value">{beneficiaryDetails.name_of_spouse || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Mother's Maiden Name</span>
              <div className="field-value">{beneficiaryDetails.mothers_maiden_name || ''}</div>
            </div>
          </div>

          {/* Household Info Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">Household Head?</span>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.is_household_head ? '✓' : ''}</span>
                  <span>Yes</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{!beneficiaryDetails.is_household_head ? '✓' : ''}</span>
                  <span>No</span>
                </div>
              </div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">If No, Relationship</span>
              <div className="field-value">{beneficiaryDetails.relationship || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">No. of Male</span>
              <div className="field-value">{beneficiaryDetails.male_household_members || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">No. of Female</span>
              <div className="field-value">{beneficiaryDetails.female_household_members || ''}</div>
            </div>
          </div>

          {/* Indigenous & Association Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Member of Indigenous Group?</span>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.is_indigenous ? '✓' : ''}</span>
                  <span>Yes</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{!beneficiaryDetails.is_indigenous ? '✓' : ''}</span>
                  <span>No</span>
                </div>
              </div>
              <div className="field-value" style={{ marginTop: '2px' }}>{beneficiaryDetails.indigenous_group || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">With Government ID?</span>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.has_government_id ? '✓' : ''}</span>
                  <span>Yes</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{!beneficiaryDetails.has_government_id ? '✓' : ''}</span>
                  <span>No</span>
                </div>
              </div>
              <div className="field-value" style={{ marginTop: '2px' }}>{beneficiaryDetails.government_id_type || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Member of Farmers Assoc/Coop?</span>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.is_association_member === 'yes' ? '✓' : ''}</span>
                  <span>Yes</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{beneficiaryDetails.is_association_member === 'no' ? '✓' : ''}</span>
                  <span>No</span>
                </div>
              </div>
              <div className="field-value" style={{ marginTop: '2px' }}>{beneficiaryDetails.association_name || ''}</div>
            </div>
          </div>

          {/* Emergency Contact Row */}
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 8' }}>
              <span className="field-label">Person to Notify in Case of Emergency</span>
              <div className="field-value">{beneficiaryDetails.emergency_contact_name || ''}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Contact Number</span>
              <div className="field-value">{beneficiaryDetails.emergency_contact_number || ''}</div>
            </div>
          </div>

          {/* PART II - LIVELIHOOD */}
          <div className="section-header">PART II - LIVELIHOOD PROFILE</div>
          
          <div className="form-grid">
            <div className="field" style={{ gridColumn: 'span 3' }}>
              <span className="field-label">Main Livelihood</span>
              <div style={{ marginTop: '3px' }}>
                <div className="checkbox-item" style={{ marginBottom: '2px' }}>
                  <span className="checkbox">{farmProfile.livelihood_category_id === 1 ? '✓' : ''}</span>
                  <span>Farmer</span>
                </div>
                <div className="checkbox-item" style={{ marginBottom: '2px' }}>
                  <span className="checkbox">{farmProfile.livelihood_category_id === 2 ? '✓' : ''}</span>
                  <span>Farmworker/Laborer</span>
                </div>
                <div className="checkbox-item" style={{ marginBottom: '2px' }}>
                  <span className="checkbox">{farmProfile.livelihood_category_id === 3 ? '✓' : ''}</span>
                  <span>Fisherfolk</span>
                </div>
                <div className="checkbox-item">
                  <span className="checkbox">{farmProfile.livelihood_category_id === 4 ? '✓' : ''}</span>
                  <span>Agri-Youth</span>
                </div>
              </div>
            </div>
            
            <div className="field" style={{ gridColumn: 'span 5' }}>
              <span className="field-label">Type of Farming Activity / Kind of Work</span>
              <div style={{ marginTop: '3px' }}>
                <div className="checkbox-item" style={{ marginBottom: '2px' }}>
                  <span className="checkbox">{farmProfile.farming_activity === 'Rice' ? '✓' : ''}</span>
                  <span>Rice</span>
                </div>
                <div className="checkbox-item" style={{ marginBottom: '2px' }}>
                  <span className="checkbox">{farmProfile.farming_activity === 'Corn' ? '✓' : ''}</span>
                  <span>Corn</span>
                </div>
                <div className="checkbox-item" style={{ marginBottom: '2px' }}>
                  <span className="checkbox">{farmProfile.farming_activity === 'Other crops' ? '✓' : ''}</span>
                  <span>Other crops</span>
                </div>
                <div className="checkbox-item" style={{ marginBottom: '2px' }}>
                  <span className="checkbox">{farmProfile.farming_activity === 'Livestock' ? '✓' : ''}</span>
                  <span>Livestock</span>
                </div>
              </div>
            </div>
            
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="field-label">Gross Annual Income Last Year</span>
              <div style={{ marginTop: '3px' }}>
                <div style={{ fontSize: '7px', marginBottom: '2px' }}>Farming:</div>
                <div className="field-value">{farmProfile.gross_income_farming || ''}</div>
                <div style={{ fontSize: '7px', marginTop: '3px', marginBottom: '2px' }}>Non-farming:</div>
                <div className="field-value">{farmProfile.gross_income_non_farming || ''}</div>
              </div>
            </div>
          </div>
          </div>
          {/* END PAGE 1 */}

          {/* PAGE 2 */}
          <div className="page">
            {/* PAGE 2 HEADER */}
            <div className="form-header">
              <img src={daLogo} alt="DA Logo" className="logo-img" />
              <div className="header-center">
                <h1>ANI AT KITA<br/>RSBSA ENROLLMENT FORM</h1>
                <h2>REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA)</h2>
                <h3>ENROLLMENT CLIENT'S COPY</h3>
              </div>
              <div className="photo-box">
                <img src={anikitaLogo} alt="ANI AT KITA Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Reference Section Page 2 */}
            <div className="reference-row">
              <div className="ref-left">
                <span className="ref-label">REFERENCE NUMBER:</span>
                <div className="ref-boxes">
                  {(beneficiaryDetails.system_generated_rsbsa_number || '05        ').split('').slice(0, 10).map((char, i) => (
                    <div key={i} className="ref-box">{char.trim()}</div>
                  ))}
                </div>
              </div>
              <div className="ref-right">
                <span className="ref-label">SURNAME:</span>
                <span style={{ marginLeft: '5px' }}>{userInfo.lname || ''}</span>
              </div>
            </div>

            {/* Middle Name, First Name, Extension Row */}
            <div className="form-grid">
              <div className="field" style={{ gridColumn: 'span 4' }}>
                <span className="field-label">Middle Name</span>
                <div className="field-value">{userInfo.mname || ''}</div>
              </div>
              <div className="field" style={{ gridColumn: 'span 4' }}>
                <span className="field-label">First Name</span>
                <div className="field-value">{userInfo.fname || ''}</div>
              </div>
              <div className="field" style={{ gridColumn: 'span 4' }}>
                <span className="field-label">Extension Name</span>
                <div className="field-value">{userInfo.extension_name || ''}</div>
              </div>
            </div>

            {/* Section: THIS FORM IS NOT FOR SALE */}
            <div style={{ 
              padding: '4px 8px', 
              textAlign: 'center', 
              fontWeight: 'bold',
              fontSize: '8px',
              borderBottom: '1px solid #000'
            }}>
              THIS FORM IS NOT FOR SALE
            </div>

          {/* PART III - FARM PARCELS */}
          <div className="section-header">PART III - FARM LAND DESCRIPTION</div>
          
          {farmParcels.length > 0 ? (
            farmParcels.map((parcel, index) => (
              <div key={parcel.id || index} style={{ pageBreakInside: 'avoid' }}>
                <div style={{ 
                  padding: '4px 8px', 
                  backgroundColor: '#f0f0f0', 
                  borderBottom: '1px solid #000',
                  fontWeight: 'bold',
                  fontSize: '8px'
                }}>
                  No. of Farm Parcel: {index + 1}
                </div>
                
                {/* Parcel Header Row */}
                <table style={{ marginBottom: '0' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Name of Farmer(s) in Rotation (if any)</th>
                      <th style={{ width: '15%' }}>(P1)</th>
                      <th style={{ width: '15%' }}>(P2)</th>
                      <th style={{ width: '15%' }}>(P3)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontSize: '8px' }}>{parcel.farmer_in_rotation || ''}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Farm Land Description */}
                <table style={{ marginTop: '0', marginBottom: '0' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>FARM PARCEL NO.</th>
                      <th style={{ width: '22%' }}>FARM LAND DESCRIPTION</th>
                      <th style={{ width: '20%' }}>CROP/COMMODITY<br/>(Livestock & Poultry included)</th>
                      <th style={{ width: '10%' }}>SIZE (HA)<br/>(in hectares)</th>
                      <th style={{ width: '12%' }}>NO. OF HEAD<br/>(Livestock/Poultry)</th>
                      <th style={{ width: '14%' }}>FARM TYPE</th>
                      <th style={{ width: '14%' }}>ORGANIC PRACTITIONER<br/>(Y/N)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                      <td>
                        <div style={{ fontSize: '7px', marginBottom: '2px' }}>Farm Location:</div>
                        <div style={{ fontSize: '8px', borderBottom: '1px solid #000', minHeight: '12px', padding: '1px' }}>
                          {parcel.farm_location || ''}
                        </div>
                        <div style={{ fontSize: '7px', marginTop: '2px' }}>
                          Barangay: {parcel.barangay || '____'} / 
                          City/Municipality: {parcel.municipality || '____'}
                        </div>
                      </td>
                      <td>
                        {parcel.parcel_commodities?.map((pc, i) => (
                          <div key={i} style={{ fontSize: '8px', borderBottom: i < parcel.parcel_commodities.length - 1 ? '1px dotted #ccc' : 'none', padding: '2px 0' }}>
                            {pc.commodity?.commodity_name || ''}
                          </div>
                        )) || <div style={{ fontSize: '8px' }}>-</div>}
                      </td>
                      <td style={{ textAlign: 'center' }}>{parcel.total_farm_area || ''}</td>
                      <td style={{ textAlign: 'center' }}>{parcel.livestock_poultry || ''}</td>
                      <td style={{ fontSize: '7px' }}>
                        <div className="checkbox-item" style={{ marginBottom: '2px' }}>
                          <span className="checkbox">{parcel.farm_type === 'Irrigated' ? '✓' : ''}</span>
                          <span>Irrigated</span>
                        </div>
                        <div className="checkbox-item" style={{ marginBottom: '2px' }}>
                          <span className="checkbox">{parcel.farm_type === 'Rainfed Upland' ? '✓' : ''}</span>
                          <span>Rainfed Upland</span>
                        </div>
                        <div className="checkbox-item">
                          <span className="checkbox">{parcel.farm_type === 'Rainfed Lowland' ? '✓' : ''}</span>
                          <span>Rainfed Lowland</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '9px' }}>
                        {parcel.is_organic ? 'YES' : 'NO'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Parcel Details */}
                <table style={{ marginTop: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '33%', fontSize: '7px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Total Farm Area (in hectares):</div>
                        <div style={{ borderBottom: '1px solid #000', minHeight: '14px', padding: '2px', fontSize: '8px' }}>
                          {parcel.total_farm_area || ''} ha
                        </div>
                      </td>
                      <td style={{ width: '33%', fontSize: '7px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Within Ancestral Domain:</div>
                        <div style={{ display: 'flex', gap: '8px', padding: '2px' }}>
                          <div className="checkbox-item">
                            <span className="checkbox">{parcel.within_ancestral_domain ? '✓' : ''}</span>
                            <span>Yes</span>
                          </div>
                          <div className="checkbox-item">
                            <span className="checkbox">{!parcel.within_ancestral_domain ? '✓' : ''}</span>
                            <span>No</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '7px', marginTop: '3px' }}>If yes, specify:</div>
                        <div style={{ borderBottom: '1px solid #000', minHeight: '12px', padding: '1px', fontSize: '8px' }}>
                          {parcel.ancestral_domain_name || ''}
                        </div>
                      </td>
                      <td style={{ width: '34%', fontSize: '7px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Agrarian Reform Beneficiary:</div>
                        <div style={{ display: 'flex', gap: '8px', padding: '2px' }}>
                          <div className="checkbox-item">
                            <span className="checkbox">{parcel.is_arb ? '✓' : ''}</span>
                            <span>Yes</span>
                          </div>
                          <div className="checkbox-item">
                            <span className="checkbox">{!parcel.is_arb ? '✓' : ''}</span>
                            <span>No</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: '7px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Ownership Document No.:</div>
                        <div style={{ borderBottom: '1px solid #000', minHeight: '14px', padding: '2px', fontSize: '8px' }}>
                          {parcel.ownership_document_number || ''}
                        </div>
                      </td>
                      <td colSpan="2" style={{ fontSize: '7px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Ownership Type:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <div className="checkbox-item">
                            <span className="checkbox">{parcel.tenure_type === 'Registered Owner' ? '✓' : ''}</span>
                            <span>Registered Owner</span>
                          </div>
                          <div className="checkbox-item">
                            <span className="checkbox">{parcel.tenure_type === 'Tenant' ? '✓' : ''}</span>
                            <span>Tenant</span>
                          </div>
                          <div className="checkbox-item">
                            <span className="checkbox">{parcel.tenure_type === 'Lease' ? '✓' : ''}</span>
                            <span>Lease</span>
                          </div>
                          <div className="checkbox-item">
                            <span className="checkbox">{parcel.tenure_type === 'Others' ? '✓' : ''}</span>
                            <span>Others</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" style={{ fontSize: '7px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                          Name of Land Owner (if tenant/lessee/use):
                        </div>
                        <div style={{ borderBottom: '1px solid #000', minHeight: '14px', padding: '2px', fontSize: '8px' }}>
                          {parcel.landowner_name || ''}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Ownership Document Types */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '10px', 
                  padding: '5px 8px',
                  fontSize: '7px',
                  borderBottom: '1px solid #000',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>OWNERSHIP DOCUMENT *</div>
                    <div style={{ lineHeight: '1.4' }}>
                      1. Certificate of Land Transfer<br/>
                      2. Emancipation Patent/Title<br/>
                      3. Individual Certificate of Land Ownership<br/>
                      4. Collective CLOA<br/>
                      5. Co-ownership CLOA
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>FARM TYPE **</div>
                    <div style={{ lineHeight: '1.4' }}>
                      1. Irrigated<br/>
                      2. Rainfed Upland<br/>
                      3. Rainfed Lowland<br/>
                      <em>(NOTE: not applicable to agri-fishery)</em>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              fontStyle: 'italic',
              border: '1px solid #ccc',
              backgroundColor: '#f9f9f9'
            }}>
              No farm parcels registered
            </div>
          )}

          {/* Declaration */}
          <div style={{ 
            padding: '8px', 
            fontSize: '7px', 
            borderBottom: '1px solid #000',
            lineHeight: '1.4'
          }}>
            I hereby declare that all information indicated above are true and correct, and that they may be used by Department of Agriculture for the purposes of 
            registration to the Registry System for Basic Sectors in Agriculture (RSBSA) and other legitimate interests of the Department of Agriculture as mandates.
          </div>

          {/* Signatures */}
          <div className="signature-row">
            <div className="sig-box">
              <div className="sig-line"></div>
              <div className="sig-label">Date</div>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
              <div className="sig-label">Printed Name of Applicant</div>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
              <div className="sig-label">Signature of Applicant</div>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
              <div className="sig-label">Thumbmark</div>
            </div>
          </div>

          {/* Verification Row */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px',
            padding: '15px 10px',
            borderBottom: '2px solid #000'
          }}>
            <div className="sig-box">
              <div className="sig-line"></div>
              <div className="sig-label" style={{ fontSize: '6px' }}>
                VERIFIED TRUE AND CORRECT BY:<br/>
                <span style={{ fontWeight: 'normal' }}>BARANGAY CHAIRMAN/ CITY/ MUNICIPAL AGRICULTURIST/ 
                MUNICIPAL AGRICULTURE FOCAL PERSON/ BARANGAY AGRICULTURE FOCAL PERSON/ 
                MUNICIPAL ENVIRONMENT & NATURAL RESOURCES/ 
                LGU FOCAL PERSON FOR AGROFORESTRY/ FISHERFOLK LEADER/ CAPYARIN/ FARC</span>
              </div>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
              <div className="sig-label" style={{ fontSize: '6px' }}>
                CONFORME OF APPLICANT/ REGISTRANT (NAME, SIGNATURE AND DATE)<br/>
                <span style={{ fontWeight: 'normal' }}>CITY/MUNICIPAL AGRICULTURE OFFICE</span>
              </div>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
              <div className="sig-label" style={{ fontSize: '6px' }}>
                CONFORME OF APPLICANT/ REGISTRANT (NAME, SIGNATURE AND DATE)<br/>
                <span style={{ fontWeight: 'normal' }}>CAFC/MAFC CHAIRMAN</span>
              </div>
            </div>
          </div>

          {/* Footer - Data Privacy */}
          <div className="footer">
            <div className="footer-title">DATA PRIVACY POLICY</div>
            <p>
              The collection of personal information is for documentation, planning, reporting and processing purposes in availing agricultural related interventions. 
              Processed data shall only be shared to partner agencies for planning, reporting and other use in accordance to the mandate of the agency. This is in 
              compliance with the Data Sharing Policy of the department.
            </p>
            <p>
              You have the right to ask for a copy of your personal data that we hold about you as well as ask for it to be corrected if you think it is wrong. To 
              do so, please contact - (Contact Person and Contact Details).
            </p>
            <div style={{ 
              textAlign: 'center', 
              fontWeight: 'bold', 
              marginTop: '8px',
              fontSize: '9px'
            }}>
              THIS FORM IS NOT FOR SALE
            </div>
          </div>

          {/* Second Copy Indicator */}
          <div style={{
            marginTop: '15px',
            padding: '8px',
            backgroundColor: '#f0f0f0',
            border: '2px solid #000',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '10px'
          }}>
            VERIFIED TRUE AND CORRECT BY:
          </div>
          </div>
          {/* END PAGE 2 */}

        </Box>
      </DialogContent>
    </Dialog>
  );
};

PrintableRSBSAForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  interviewData: PropTypes.object
};

PrintableRSBSAForm.defaultProps = {
  interviewData: null
};

export default PrintableRSBSAForm;