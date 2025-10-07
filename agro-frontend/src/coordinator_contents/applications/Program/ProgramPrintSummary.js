/* eslint-disable camelcase */
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
    // Try nested beneficiary.beneficiary.user first
    if (beneficiary.beneficiary?.user) {
      const { fname, mname, lname, extension_name } = beneficiary.beneficiary.user;
      if (fname || lname) {
        return `${fname || ''} ${mname ? mname + ' ' : ''}${lname || ''} ${extension_name || ''}`.trim();
      }
    }

    // Try direct user access
    if (beneficiary.user) {
      const { fname, mname, lname, extension_name } = beneficiary.user;
      if (fname || lname) {
        return `${fname || ''} ${mname ? mname + ' ' : ''}${lname || ''} ${extension_name || ''}`.trim();
      }
    }

    // Try direct name fields
    if (beneficiary.full_name) return beneficiary.full_name;
    if (beneficiary.name) return beneficiary.name;
    if (beneficiary.beneficiary_name) return beneficiary.beneficiary_name;
    
    // Try firstName/lastName format with all possible field names
    const firstName = beneficiary.firstName || beneficiary.fname;
    const middleName = beneficiary.middleName || beneficiary.mname;
    const lastName = beneficiary.lastName || beneficiary.lname;
    const extensionName = beneficiary.extension_name;
    
    if (firstName || middleName || lastName) {
      return [firstName, middleName, lastName, extensionName].filter(Boolean).join(' ');
    }

    return 'Unknown Beneficiary';
  };

  // IMPROVED: Enhanced RSBSA number extraction with comprehensive fallbacks
  const getRSBSANumber = (beneficiary) => {
    // Try all possible RSBSA number locations with priority order
    const rsbsaNumber = beneficiary.beneficiary?.system_generated_rsbsa_number ||
                       beneficiary.beneficiary?.manual_rsbsa_number ||
                       beneficiary.beneficiary?.rsbsa_number ||
                       beneficiary.rsbsa_number ||
                       beneficiary.rsbsaNumber ||
                       beneficiary.systemGeneratedRsbaNumber ||
                       beneficiary.systemGeneratedRsbsaNumber ||
                       beneficiary.manual_rsbsa_number ||
                       beneficiary.system_generated_rsbsa_number;
    
    return rsbsaNumber || 'Not Available';
  };

  const getBeneficiaryAddress = (beneficiary) => {
    // Try nested beneficiary address first
    if (beneficiary.beneficiary?.barangay) {
      return beneficiary.beneficiary.barangay;
    }
    
    // Try various address field combinations
    return beneficiary.address || 
           beneficiary.streetPurokBarangay ||
           beneficiary.barangay ||
           beneficiary.municipality ||
           'N/A';
  };

  const calculateDuration = () => {
    try {
      const start = new Date(summaryData.startDate);
      const end = new Date(summaryData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateUnclaimedRate = () => {
    if (summaryData.totalItems > 0) {
      return ((summaryData.pendingItems / summaryData.totalItems) * 100).toFixed(1);
    }
    return '0';
  };

  const calculateAvgItemsPerBeneficiary = () => {
    if (summaryData.totalBeneficiaries > 0) {
      return (summaryData.totalItems / summaryData.totalBeneficiaries).toFixed(1);
    }
    return '0';
  };

  // Enhanced status determination
  const getItemStatus = (item) => {
    if (item.status === 'distributed') return 'distributed';
    if (item.status === 'unclaimed') return 'unclaimed';
    if (item.status === 'pending') return 'pending';
    // Fallback logic
    return 'pending';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'distributed': return 'Distributed';
      case 'unclaimed': return 'Unclaimed';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
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
              <span className="print-stat-number">{calculateDuration()}</span>
              <span className="print-stat-label">Duration</span>
            </div>
            <div className="print-stat-card">
              <span className="print-stat-number" style={{ color: '#2d5016', fontWeight: 'bold' }}>COMPLETED</span>
              <span className="print-stat-label">Status</span>
            </div>
          </div>

          {summaryData.description && (
            <div className="mb-15">
              <h3>Program Description</h3>
              <div style={{ 
                padding: '12pt', 
                backgroundColor: '#f8fdf9', 
                border: '2pt solid #2d5016',
                borderRadius: '6pt',
                marginTop: '10pt',
                lineHeight: '1.4'
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
            <div className="print-stat-card" style={{ borderLeft: '4pt solid #2d5016' }}>
              <span className="print-stat-number">
                {summaryData.distributedItems}/{summaryData.totalItems}
              </span>
              <span className="print-stat-label">Items Distributed</span>
              <div style={{ 
                marginTop: '6pt', 
                fontSize: '11pt', 
                color: '#2d5016', 
                fontWeight: 'bold' 
              }}>
                {summaryData.distributionRate}% Success Rate
              </div>
            </div>
            <div className="print-stat-card" style={{ borderLeft: '4pt solid #5b9aa0' }}>
              <span className="print-stat-number">
                {summaryData.servedBeneficiaries}/{summaryData.totalBeneficiaries}
              </span>
              <span className="print-stat-label">Beneficiaries Served</span>
              <div style={{ 
                marginTop: '6pt', 
                fontSize: '11pt', 
                color: '#5b9aa0', 
                fontWeight: 'bold' 
              }}>
                {summaryData.beneficiaryRate}% Coverage
              </div>
            </div>
            <div className="print-stat-card" style={{ borderLeft: '4pt solid #ff9800' }}>
              <span className="print-stat-number">{summaryData.pendingItems}</span>
              <span className="print-stat-label">Undistributed Items</span>
              <div style={{ 
                marginTop: '6pt', 
                fontSize: '11pt', 
                color: '#ff9800', 
                fontWeight: 'bold' 
              }}>
                {calculateUnclaimedRate()}% Unclaimed
              </div>
            </div>
            <div className="print-stat-card" style={{ borderLeft: '4pt solid #4a7c59' }}>
              <span className="print-stat-number currency">
                {formatCurrency(summaryData.totalValue)}
              </span>
              <span className="print-stat-label">Total Program Value</span>
              <div style={{ 
                marginTop: '6pt', 
                fontSize: '10pt', 
                color: '#666', 
                fontWeight: 'normal' 
              }}>
                Avg: {formatCurrency(summaryData.totalValue / Math.max(summaryData.totalBeneficiaries, 1))} per beneficiary
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Beneficiary List */}
        {beneficiaries.length > 0 && (
          <div className="print-section">
            <h2>Complete Beneficiary Distribution List</h2>
            <div style={{
              padding: '10pt',
              backgroundColor: '#f0f8ff',
              border: '1pt solid #5b9aa0',
              borderRadius: '4pt',
              marginBottom: '15pt'
            }}>
              <strong style={{ color: '#2d5016' }}>
                Comprehensive list of all beneficiaries and their item distribution status
              </strong>
            </div>
            
            <table className="print-table">
              <thead>
                <tr>
                  <th style={{ width: '3%' }}>#</th>
                  <th style={{ width: '22%' }}>Beneficiary Name</th>
                  <th style={{ width: '15%' }}>RSBSA Number</th>
                  <th style={{ width: '12%' }}>Barangay</th>
                  <th style={{ width: '18%' }}>Item Name</th>
                  <th className="text-center" style={{ width: '8%' }}>Qty</th>
                  <th className="text-right" style={{ width: '10%' }}>Unit Value</th>
                  <th className="text-right" style={{ width: '10%' }}>Total Value</th>
                  <th className="text-center" style={{ width: '8%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {beneficiaries.map((beneficiary, beneficiaryIndex) => {
                  const items = beneficiary.items || [];
                  
                  // Skip beneficiaries with no items
                  if (items.length === 0) return null;
                  
                  return items.map((item, itemIndex) => (
                    <tr key={`${beneficiaryIndex}-${itemIndex}`} style={{
                      backgroundColor: itemIndex === 0 ? '#f8fdf9' : 'transparent'
                    }}>
                      <td className="text-center" style={{ 
                        fontWeight: itemIndex === 0 ? 'bold' : 'normal',
                        color: itemIndex === 0 ? '#2d5016' : '#666'
                      }}>
                        {itemIndex === 0 ? beneficiaryIndex + 1 : ''}
                      </td>
                      <td style={{ 
                        fontWeight: itemIndex === 0 ? 'bold' : 'normal',
                        color: itemIndex === 0 ? '#2d5016' : 'inherit'
                      }}>
                        {itemIndex === 0 ? getBeneficiaryName(beneficiary) : ''}
                      </td>
                      <td style={{ 
                        color: itemIndex === 0 ? '#2d5016' : 'transparent',
                        fontFamily: 'monospace',
                        fontSize: '9pt',
                        fontWeight: itemIndex === 0 ? 'bold' : 'normal'
                      }}>
                        {itemIndex === 0 ? getRSBSANumber(beneficiary) : ''}
                      </td>
                      <td style={{ 
                        color: itemIndex === 0 ? '#666' : 'transparent',
                        fontSize: '9pt'
                      }}>
                        {itemIndex === 0 ? getBeneficiaryAddress(beneficiary) : ''}
                      </td>
                      <td style={{ fontSize: '9pt' }}>{item.item_name || 'N/A'}</td>
                      <td className="text-center" style={{ fontWeight: 'bold', fontSize: '9pt' }}>
                        {item.quantity || 0} {item.unit || ''}
                      </td>
                      <td className="text-right currency" style={{ fontSize: '9pt' }}>
                        {formatCurrency(item.unit_value || 0)}
                      </td>
                      <td className="text-right currency" style={{ fontWeight: 'bold', fontSize: '9pt' }}>
                        {formatCurrency(item.total_value || 0)}
                      </td>
                      <td className="text-center">
                        <span className={`print-status ${getItemStatus(item)}`}>
                          {getStatusLabel(getItemStatus(item))}
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
          <h2>Distribution Summary Analysis</h2>
          
          <div className="print-grid print-grid-2">
            <div style={{ 
              padding: '15pt', 
              border: '2pt solid #2d5016', 
              backgroundColor: '#f8fdf9',
              borderRadius: '6pt'
            }}>
              <h3 style={{ color: '#2d5016', marginBottom: '12pt', marginTop: 0 }}>
                📊 Distribution Breakdown
              </h3>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10pt',
                padding: '8pt 0',
                borderBottom: '1pt solid #e0e0e0'
              }}>
                <span style={{ fontWeight: '500' }}>Items Successfully Distributed:</span>
                <span style={{ fontWeight: 'bold', color: '#2d5016', fontSize: '11pt' }}>
                  {summaryData.distributedItems} ({summaryData.distributionRate}%)
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10pt',
                padding: '8pt 0',
                borderBottom: '1pt solid #e0e0e0'
              }}>
                <span style={{ fontWeight: '500' }}>Items Remaining Unclaimed:</span>
                <span style={{ fontWeight: 'bold', color: '#ff9800', fontSize: '11pt' }}>
                  {summaryData.pendingItems} ({calculateUnclaimedRate()}%)
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8pt 0',
                backgroundColor: '#e8f5e9',
                marginLeft: '-15pt',
                marginRight: '-15pt',
                paddingLeft: '15pt',
                paddingRight: '15pt',
                borderRadius: '4pt'
              }}>
                <span style={{ fontWeight: 'bold' }}>Total Program Items:</span>
                <span style={{ fontWeight: 'bold', fontSize: '12pt' }}>{summaryData.totalItems}</span>
              </div>
            </div>
            
            <div style={{ 
              padding: '15pt', 
              border: '2pt solid #5b9aa0', 
              backgroundColor: '#f0f8ff',
              borderRadius: '6pt'
            }}>
              <h3 style={{ color: '#5b9aa0', marginBottom: '12pt', marginTop: 0 }}>
                👥 Beneficiary Statistics
              </h3>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10pt',
                padding: '8pt 0',
                borderBottom: '1pt solid #e0e0e0'
              }}>
                <span style={{ fontWeight: '500' }}>Beneficiaries Successfully Served:</span>
                <span style={{ fontWeight: 'bold', color: '#5b9aa0', fontSize: '11pt' }}>
                  {summaryData.servedBeneficiaries} ({summaryData.beneficiaryRate}%)
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10pt',
                padding: '8pt 0',
                borderBottom: '1pt solid #e0e0e0'
              }}>
                <span style={{ fontWeight: '500' }}>Total Registered Beneficiaries:</span>
                <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{summaryData.totalBeneficiaries}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8pt 0',
                backgroundColor: '#e6f3ff',
                marginLeft: '-15pt',
                marginRight: '-15pt',
                paddingLeft: '15pt',
                paddingRight: '15pt',
                borderRadius: '4pt'
              }}>
                <span style={{ fontWeight: 'bold' }}>Average Items per Beneficiary:</span>
                <span style={{ fontWeight: 'bold', fontSize: '12pt' }}>
                  {calculateAvgItemsPerBeneficiary()} items
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficiaries with Distributed Items */}
        {(() => {
          const distributedBeneficiaries = beneficiaries.filter(b => 
            (b.items || []).some(item => getItemStatus(item) === 'distributed')
          );
          
          if (distributedBeneficiaries.length > 0) {
            return (
              <div className="print-section">
                <h2>✅ Beneficiaries Who Successfully Received Items ({distributedBeneficiaries.length})</h2>
                <div style={{
                  padding: '12pt',
                  backgroundColor: '#e8f5e9',
                  border: '2pt solid #4a7c59',
                  borderRadius: '6pt',
                  marginBottom: '15pt'
                }}>
                  <strong style={{ color: '#2d5016', fontSize: '11pt' }}>
                    The following beneficiaries successfully received their allocated agricultural subsidies:
                  </strong>
                </div>
                
                <table className="print-table">
                  <thead>
                    <tr style={{ backgroundColor: '#e8f5e9' }}>
                      <th style={{ width: '5%' }}>#</th>
                      <th style={{ width: '25%' }}>Beneficiary Name</th>
                      <th style={{ width: '18%' }}>RSBSA Number</th>
                      <th style={{ width: '12%' }}>Barangay</th>
                      <th style={{ width: '25%' }}>Items Received</th>
                      <th className="text-right" style={{ width: '15%' }}>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributedBeneficiaries.map((beneficiary, index) => {
                      const distributedItems = (beneficiary.items || []).filter(
                        item => getItemStatus(item) === 'distributed'
                      );
                      const totalValue = distributedItems.reduce(
                        (sum, item) => sum + (parseFloat(item.total_value) || 0), 0
                      );
                      
                      return (
                        <tr key={index} style={{
                          backgroundColor: index % 2 === 0 ? '#f8fdf9' : 'white'
                        }}>
                          <td className="text-center" style={{ fontWeight: 'bold', color: '#2d5016' }}>
                            {index + 1}
                          </td>
                          <td style={{ fontWeight: 'bold', color: '#2d5016' }}>
                            {getBeneficiaryName(beneficiary)}
                          </td>
                          <td style={{ 
                            color: '#2d5016', 
                            fontFamily: 'monospace', 
                            fontSize: '9pt',
                            fontWeight: 'bold'
                          }}>
                            {getRSBSANumber(beneficiary)}
                          </td>
                          <td style={{ color: '#666', fontSize: '9pt' }}>
                            {getBeneficiaryAddress(beneficiary)}
                          </td>
                          <td>
                            <div style={{ fontSize: '9pt', lineHeight: '1.3' }}>
                              {distributedItems.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: '3pt' }}>
                                  <strong>•</strong> {item.item_name} 
                                  <span style={{ color: '#666' }}>
                                    ({item.quantity} {item.unit})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="text-right currency" style={{ 
                            fontWeight: 'bold', 
                            color: '#2d5016',
                            fontSize: '10pt'
                          }}>
                            {formatCurrency(totalValue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#2d5016', color: 'white', fontWeight: 'bold' }}>
                      <td colSpan="5" className="text-right" style={{ padding: '12pt' }}>
                        <strong>Total Successfully Distributed Value:</strong>
                      </td>
                      <td className="text-right currency" style={{ 
                        color: 'white', 
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        padding: '12pt'
                      }}>
                        {formatCurrency(
                          distributedBeneficiaries.reduce((sum, b) => {
                            const items = (b.items || []).filter(item => getItemStatus(item) === 'distributed');
                            return sum + items.reduce((s, i) => s + (parseFloat(i.total_value) || 0), 0);
                          }, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          }
          return null;
        })()}

        {/* Beneficiaries with Unclaimed Items */}
        {(() => {
          const unclaimedBeneficiaries = beneficiaries.filter(b => 
            (b.items || []).some(item => ['pending', 'unclaimed'].includes(getItemStatus(item)))
          );
          
          if (unclaimedBeneficiaries.length > 0) {
            return (
              <div className="print-section">
                <h2>⚠️ Beneficiaries with Unclaimed Items ({unclaimedBeneficiaries.length})</h2>
                <div style={{
                  padding: '12pt',
                  backgroundColor: '#fff3e0',
                  border: '2pt solid #ff9800',
                  borderRadius: '6pt',
                  marginBottom: '15pt'
                }}>
                  <strong style={{ color: '#f57c00', fontSize: '11pt' }}>
                    The following beneficiaries have items that were not distributed and may require follow-up:
                  </strong>
                </div>
                
                <table className="print-table">
                  <thead>
                    <tr style={{ backgroundColor: '#fff3e0' }}>
                      <th style={{ width: '5%' }}>#</th>
                      <th style={{ width: '25%' }}>Beneficiary Name</th>
                      <th style={{ width: '18%' }}>RSBSA Number</th>
                      <th style={{ width: '12%' }}>Barangay</th>
                      <th style={{ width: '25%' }}>Unclaimed Items</th>
                      <th className="text-right" style={{ width: '15%' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unclaimedBeneficiaries.map((beneficiary, index) => {
                      const unclaimedItems = (beneficiary.items || []).filter(
                        item => ['pending', 'unclaimed'].includes(getItemStatus(item))
                      );
                      const totalValue = unclaimedItems.reduce(
                        (sum, item) => sum + (parseFloat(item.total_value) || 0), 0
                      );
                      
                      return (
                        <tr key={index} style={{
                          backgroundColor: index % 2 === 0 ? '#fffbf0' : 'white'
                        }}>
                          <td className="text-center" style={{ fontWeight: 'bold', color: '#ff9800' }}>
                            {index + 1}
                          </td>
                          <td style={{ fontWeight: 'bold', color: '#f57c00' }}>
                            {getBeneficiaryName(beneficiary)}
                          </td>
                          <td style={{ 
                            color: '#f57c00', 
                            fontFamily: 'monospace', 
                            fontSize: '9pt',
                            fontWeight: 'bold'
                          }}>
                            {getRSBSANumber(beneficiary)}
                          </td>
                          <td style={{ color: '#666', fontSize: '9pt' }}>
                            {getBeneficiaryAddress(beneficiary)}
                          </td>
                          <td>
                            <div style={{ fontSize: '9pt', lineHeight: '1.3' }}>
                              {unclaimedItems.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: '3pt' }}>
                                  <strong>•</strong> {item.item_name} 
                                  <span style={{ color: '#666' }}>
                                    ({item.quantity} {item.unit})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="text-right currency" style={{ 
                            fontWeight: 'bold', 
                            color: '#ff9800',
                            fontSize: '10pt'
                          }}>
                            {formatCurrency(totalValue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#ff9800', color: 'white', fontWeight: 'bold' }}>
                      <td colSpan="5" className="text-right" style={{ padding: '12pt' }}>
                        <strong>Total Unclaimed Value:</strong>
                      </td>
                      <td className="text-right currency" style={{ 
                        color: 'white', 
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        padding: '12pt'
                      }}>
                        {formatCurrency(
                          unclaimedBeneficiaries.reduce((sum, b) => {
                            const items = (b.items || []).filter(
                              item => ['pending', 'unclaimed'].includes(getItemStatus(item))
                            );
                            return sum + items.reduce((s, i) => s + (parseFloat(i.total_value) || 0), 0);
                          }, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          }
          return null;
        })()}

        {/* Program Completion Notes */}
        <div className="print-section">
          <h2>Program Completion Summary</h2>
          <div style={{
            padding: '20pt',
            backgroundColor: '#e8f5e9',
            border: '3pt solid #4a7c59',
            borderRadius: '8pt'
          }}>
            <div style={{ marginBottom: '15pt', textAlign: 'center' }}>
              <div style={{ 
                fontSize: '16pt', 
                fontWeight: 'bold', 
                color: '#2d5016',
                marginBottom: '10pt'
              }}>
                ✅ PROGRAM SUCCESSFULLY COMPLETED
              </div>
            </div>
            
            <div style={{ marginBottom: '12pt', borderBottom: '1pt solid #4a7c59', paddingBottom: '8pt' }}>
              <strong style={{ color: '#2d5016' }}>Completion Date:</strong>
              <span style={{ marginLeft: '15pt', fontSize: '11pt' }}>
                {formatDate(summaryData.completedDate)}
              </span>
            </div>
            
            <div style={{ marginBottom: '12pt', borderBottom: '1pt solid #4a7c59', paddingBottom: '8pt' }}>
              <strong style={{ color: '#2d5016' }}>Overall Achievement:</strong>
              <span style={{ marginLeft: '15pt', fontSize: '11pt' }}>
                {summaryData.distributionRate}% distribution success rate with {summaryData.beneficiaryRate}% beneficiary coverage
              </span>
            </div>
            
            <div style={{ marginBottom: '12pt', borderBottom: '1pt solid #4a7c59', paddingBottom: '8pt' }}>
              <strong style={{ color: '#2d5016' }}>Total Impact:</strong>
              <span style={{ marginLeft: '15pt', fontSize: '11pt' }}>
                {formatCurrency(summaryData.totalValue)} in agricultural subsidies distributed to {summaryData.totalBeneficiaries} registered beneficiaries
              </span>
            </div>
            
            <div>
              <strong style={{ color: '#2d5016' }}>Program Efficiency:</strong>
              <span style={{ marginLeft: '15pt', fontSize: '11pt' }}>
                {summaryData.distributedItems} out of {summaryData.totalItems} items successfully distributed 
                {summaryData.pendingItems > 0 && (
                  <span style={{ color: '#ff9800', fontWeight: 'bold' }}>
                    {' '}({summaryData.pendingItems} items remain unclaimed)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations (if there are unclaimed items) */}
        {summaryData.pendingItems > 0 && (
          <div className="print-section">
            <h2>Recommendations for Follow-up</h2>
            <div style={{
              padding: '15pt',
              backgroundColor: '#fff3e0',
              border: '2pt solid #ff9800',
              borderRadius: '6pt'
            }}>
              <h3 style={{ color: '#f57c00', marginTop: 0, marginBottom: '12pt' }}>
                Action Items for Unclaimed Subsidies
              </h3>
              <ul style={{ marginLeft: '20pt', lineHeight: '1.6' }}>
                <li style={{ marginBottom: '8pt' }}>
                  <strong>Contact beneficiaries</strong> with unclaimed items to arrange alternative distribution dates
                </li>
                <li style={{ marginBottom: '8pt' }}>
                  <strong>Verify contact information</strong> and addresses for beneficiaries who did not claim their items
                </li>
                <li style={{ marginBottom: '8pt' }}>
                  <strong>Consider redistribution</strong> of unclaimed items to other eligible beneficiaries if original recipients cannot be reached
                </li>
                <li style={{ marginBottom: '8pt' }}>
                  <strong>Document reasons</strong> for non-distribution for future program improvements
                </li>
                <li>
                  <strong>Update beneficiary database</strong> with current contact information and status
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="print-footer">
          <div style={{ marginBottom: '15pt', fontWeight: 'bold', fontSize: '12pt', textAlign: 'center' }}>
            Agricultural Subsidy Program Completion Report
          </div>
          <div style={{ marginBottom: '10pt', lineHeight: '1.6', textAlign: 'center' }}>
            This comprehensive report documents the successful completion of the agricultural subsidy program.<br/>
            All distribution records have been permanently saved and are available for audit and future reference.
          </div>
          <div style={{ 
            marginTop: '20pt',
            paddingTop: '15pt',
            borderTop: '2pt solid #2d5016',
            fontSize: '9pt', 
            color: '#666',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '5pt' }}>
              <strong>Generated by Agricultural Subsidy Management System</strong>
            </div>
            <div style={{ marginBottom: '5pt' }}>
              Municipal Agriculture Office - Opol, Misamis Oriental, Philippines
            </div>
            <div style={{ marginBottom: '5pt' }}>
              Report generated on {formatDate(new Date().toISOString())}
            </div>
            <div>
              Document ID: {program.id || 'N/A'} | Program: {summaryData.programTitle}
            </div>
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