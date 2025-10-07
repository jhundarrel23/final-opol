/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Stack,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer
} from '@mui/material';
import {
  Calendar,
  User,
  MapPin,
  FileText,
  CheckCircle,
  BarChart3,
  Users,
  DollarSign,
  AlertCircle,
  Award
} from 'lucide-react';
import PrintHeader from './PrintHeader';
import './professional-print-styles.css';

const ProgramSummaryReport = ({ program, summaryData, formatCurrency, formatDate, beneficiaries = [] }) => {
  // Nature Theme Colors
  const forestGreen = '#2d5016';
  const leafGreen = '#4a7c59';
  const skyBlue = '#5b9aa0';
  const mintGreen = '#a8d5ba';

  if (!program || !summaryData) return null;

  // Helper functions for beneficiary data
  const getBeneficiaryName = (beneficiary) => {
    if (beneficiary.beneficiary?.user) {
      const { fname, lname } = beneficiary.beneficiary.user;
      if (fname || lname) {
        return `${fname || ''} ${lname || ''}`.trim();
      }
    }
    if (beneficiary.full_name) return beneficiary.full_name;
    if (beneficiary.name) return beneficiary.name;
    
    const firstName = beneficiary.firstName || beneficiary.fname;
    const middleName = beneficiary.middleName || beneficiary.mname;
    const lastName = beneficiary.lastName || beneficiary.lname;
    
    if (firstName || middleName || lastName) {
      return [firstName, middleName, lastName].filter(Boolean).join(' ');
    }
    return 'Unknown Beneficiary';
  };

  const getRSBSANumber = (beneficiary) => {
    return beneficiary.rsbsaNumber || 
           beneficiary.beneficiary?.system_generated_rsbsa_number || 
           beneficiary.beneficiary?.manual_rsbsa_number ||
           beneficiary.rsbsa_number || 
           beneficiary.systemGeneratedRsbaNumber || 
           'Not Available';
  };

  const getBeneficiaryAddress = (beneficiary) => {
    if (beneficiary.beneficiary?.barangay) {
      return beneficiary.beneficiary.barangay;
    }
    return beneficiary.address || 
           beneficiary.streetPurokBarangay ||
           beneficiary.barangay ||
           '';
  };

  return (
    <div className="print-content">
      <PrintHeader 
        title="PROGRAM COMPLETION SUMMARY REPORT"
        subtitle="Agricultural Subsidy Management System"
        documentType="Program Completion Report"
        generatedDate={summaryData.completedDate}
        programTitle={summaryData.programTitle}
        department="Municipal Agriculture Office - Opol"
      />

      <div className="print-content">
        {/* Program Overview Section */}
        <div className="print-section">
          <h2>Program Overview</h2>
          
          <div className="print-grid print-grid-4">
            <div className="print-stat-card">
              <span className="print-stat-number">{formatDate(summaryData.startDate)}</span>
              <span className="print-stat-label">Start Date</span>
            </div>
            <div className="print-stat-card">
              <span className="print-stat-number">{formatDate(summaryData.endDate)}</span>
              <span className="print-stat-label">End Date</span>
            </div>
            <div className="print-stat-card">
              <span className="print-stat-number">
                {(() => {
                  const start = new Date(summaryData.startDate);
                  const end = new Date(summaryData.endDate);
                  const diffTime = Math.abs(end - start);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return `${diffDays} days`;
                })()}
              </span>
              <span className="print-stat-label">Duration</span>
            </div>
            <div className="print-stat-card">
              <span className="print-stat-number">COMPLETED</span>
              <span className="print-stat-label">Status</span>
            </div>
          </div>

          {summaryData.description && (
            <div className="mb-15">
              <h3>Program Description</h3>
              <div style={{ 
                padding: '10pt', 
                backgroundColor: '#f8f9fa', 
                border: '1pt solid #2d5016',
                borderRadius: '4pt'
              }}>
                {summaryData.description}
              </div>
            </div>
          )}
        </div>

        {/* Key Performance Indicators */}
        <div className="print-section">
          <h2>Key Performance Indicators</h2>
          
          <div className="print-grid print-grid-4">
            <div className="print-stat-card">
              <span className="print-stat-number">{summaryData.distributedItems}/{summaryData.totalItems}</span>
              <span className="print-stat-label">Items Distributed</span>
              <div style={{ marginTop: '4pt', fontSize: '10pt', color: '#2d5016', fontWeight: 'bold' }}>
                {summaryData.distributionRate}%
              </div>
            </div>
            <div className="print-stat-card">
              <span className="print-stat-number">{summaryData.servedBeneficiaries}/{summaryData.totalBeneficiaries}</span>
              <span className="print-stat-label">Beneficiaries Served</span>
              <div style={{ marginTop: '4pt', fontSize: '10pt', color: '#2d5016', fontWeight: 'bold' }}>
                {summaryData.beneficiaryRate}%
              </div>
            </div>
            <div className="print-stat-card">
              <span className="print-stat-number">{summaryData.pendingItems}</span>
              <span className="print-stat-label">Undistributed Items</span>
              <div style={{ marginTop: '4pt', fontSize: '10pt', color: '#ff9800', fontWeight: 'bold' }}>
                {summaryData.totalItems > 0 ? 
                  `${((summaryData.pendingItems / summaryData.totalItems) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </div>
            </div>
            <div className="print-stat-card">
              <span className="print-stat-number currency">{formatCurrency(summaryData.totalValue)}</span>
              <span className="print-stat-label">Total Program Value</span>
            </div>
          </div>
        </div>

        {/* Detailed Beneficiary List */}
        {beneficiaries.length > 0 && (
          <div className="print-section">
            <h2>Complete Beneficiary Distribution List</h2>
            
            <table className="print-table">
              <thead>
                <tr>
                  <th>Beneficiary Name</th>
                  <th>RSBSA Number</th>
                  <th>Barangay</th>
                  <th>Item Name</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-right">Unit Value</th>
                  <th className="text-right">Total Value</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {beneficiaries.map((beneficiary, beneficiaryIndex) => {
                  const items = beneficiary.items || [];
                  return items.map((item, itemIndex) => (
                    <tr key={`${beneficiaryIndex}-${itemIndex}`}>
                      <td style={{ fontWeight: itemIndex === 0 ? 'bold' : 'normal' }}>
                        {itemIndex === 0 ? getBeneficiaryName(beneficiary) : ''}
                      </td>
                      <td style={{ color: '#666' }}>
                        {itemIndex === 0 ? getRSBSANumber(beneficiary) : ''}
                      </td>
                      <td style={{ color: '#666' }}>
                        {itemIndex === 0 ? getBeneficiaryAddress(beneficiary) : ''}
                      </td>
                      <td>{item.item_name}</td>
                      <td className="text-center" style={{ fontWeight: 'bold' }}>
                        {item.quantity} {item.unit}
                      </td>
                      <td className="text-right currency">
                        {formatCurrency(item.unit_value || 0)}
                      </td>
                      <td className="text-right currency" style={{ fontWeight: 'bold' }}>
                        {formatCurrency(item.total_value || 0)}
                      </td>
                      <td className="text-center">
                        <span className={`print-status ${item.status === 'distributed' ? 'distributed' : 
                          item.status === 'unclaimed' ? 'unclaimed' : 'pending'}`}>
                          {item.status === 'distributed' ? 'Distributed' : 
                           item.status === 'unclaimed' ? 'Unclaimed' : 
                           'Pending'}
                        </span>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Distribution Summary */}
        <div className="print-section">
          <h2>Distribution Summary</h2>
          
          <div className="print-grid print-grid-2">
            <div style={{ 
              padding: '15pt', 
              border: '2pt solid #2d5016', 
              backgroundColor: '#f8f9fa',
              borderRadius: '4pt'
            }}>
              <h3 style={{ color: '#2d5016', marginBottom: '10pt' }}>Distribution Breakdown</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8pt' }}>
                <span>Items Distributed:</span>
                <span style={{ fontWeight: 'bold', color: '#2d5016' }}>
                  {summaryData.distributedItems} ({summaryData.distributionRate}%)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8pt' }}>
                <span>Items Unclaimed:</span>
                <span style={{ fontWeight: 'bold', color: '#ff9800' }}>
                  {summaryData.pendingItems} ({summaryData.totalItems > 0 ? 
                    `${((summaryData.pendingItems / summaryData.totalItems) * 100).toFixed(1)}%` : 
                    '0%'
                  })
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Items:</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.totalItems}</span>
              </div>
            </div>
            
            <div style={{ 
              padding: '15pt', 
              border: '2pt solid #5b9aa0', 
              backgroundColor: '#f0f8ff',
              borderRadius: '4pt'
            }}>
              <h3 style={{ color: '#5b9aa0', marginBottom: '10pt' }}>Beneficiary Statistics</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8pt' }}>
                <span>Beneficiaries Served:</span>
                <span style={{ fontWeight: 'bold', color: '#5b9aa0' }}>
                  {summaryData.servedBeneficiaries} ({summaryData.beneficiaryRate}%)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8pt' }}>
                <span>Total Beneficiaries:</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.totalBeneficiaries}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Average Items per Beneficiary:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {summaryData.totalBeneficiaries > 0 ? 
                    (summaryData.totalItems / summaryData.totalBeneficiaries).toFixed(1) : 
                    '0'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="print-footer">
          <div style={{ marginBottom: '10pt' }}>
            <strong>Program Completion Report</strong>
          </div>
          <div style={{ marginBottom: '5pt' }}>
            This report documents the successful completion of the agricultural subsidy program.
          </div>
          <div style={{ marginBottom: '10pt' }}>
            All distribution records have been saved and are available for future reference.
          </div>
          <div style={{ fontSize: '8pt', color: '#999' }}>
            Generated by Agricultural Subsidy Management System - Municipal Agriculture Office, Opol<br/>
            Report generated on {formatDate(new Date().toISOString())}
          </div>
        </div>
      </div>
    </div>
  );
};

ProgramSummaryReport.propTypes = {
  program: PropTypes.object.isRequired,
  summaryData: PropTypes.shape({
    programTitle: PropTypes.string,
    completedDate: PropTypes.string,
    totalBeneficiaries: PropTypes.number,
    servedBeneficiaries: PropTypes.number,
    totalItems: PropTypes.number,
    distributedItems: PropTypes.number,
    pendingItems: PropTypes.number,
    totalValue: PropTypes.number,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    description: PropTypes.string,
    distributionRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    beneficiaryRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  formatCurrency: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  beneficiaries: PropTypes.array
};

export default ProgramSummaryReport;