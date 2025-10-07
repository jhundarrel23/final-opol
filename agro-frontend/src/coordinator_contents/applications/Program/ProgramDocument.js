import React from 'react';
import PropTypes from 'prop-types';

const ProgramDocument = ({ 
  program, 
  beneficiaries = [], 
  formatDate,
  coordinatorName = "Program Coordinator"
}) => {
  const getBeneficiaryName = (beneficiary) => {
    if (beneficiary.beneficiary_name) return beneficiary.beneficiary_name;
    if (beneficiary.full_name) return beneficiary.full_name;
    if (beneficiary.name) return beneficiary.name;
    
    const firstName = beneficiary.firstName || beneficiary.fname || beneficiary.first_name;
    const middleName = beneficiary.middleName || beneficiary.mname || beneficiary.middle_name;
    const lastName = beneficiary.lastName || beneficiary.lname || beneficiary.last_name;
    
    if (firstName || middleName || lastName) {
      return [firstName, middleName, lastName].filter(Boolean).join(' ');
    }
    return '';
  };

  const getRSBSANumber = (beneficiary) => {
    return beneficiary.rsbsa_number || 
           beneficiary.rsbsaNumber || 
           'Not Available';
  };

  const getBeneficiaryAddress = (beneficiary) => {
    const address = beneficiary.address || 
                   beneficiary.streetPurokBarangay ||
                   beneficiary.barangay ||
                   '';
    
    if (address.toLowerCase().includes('misamis oriental')) {
      return address.replace(/misamis oriental/gi, '').trim().replace(/,$/, '');
    }
    
    if (address.toLowerCase().includes('opol')) {
      return address.replace(/opol/gi, '').trim().replace(/,$/, '');
    }
    
    return address;
  };

  return (
    <div className="document">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          line-height: 1.6;
          padding: 40px;
          background: #f5f5f5;
        }
        
        .document {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 60px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2c5f2d;
          padding-bottom: 20px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .logo {
          height: 60pt;
          max-width: 120pt;
          object-fit: contain;
        }
        
        .title-section {
          flex: 1;
          text-align: center;
          padding: 0 20px;
        }
        
        .letterhead-divider {
          height: 2px;
          background: #2c5f2d;
          margin: 10px 0;
        }
        
        .header h1 {
          font-size: 18px;
          color: #2c5f2d;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .header h2 {
          font-size: 22px;
          color: #1a1a1a;
          margin: 10px 0;
          font-weight: bold;
        }
        
        .office-address {
          font-size: 12px;
          color: #666;
          margin: 5px 0;
        }
        
        .doc-info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #666;
          margin-top: 10px;
        }
        
        .section {
          margin: 25px 0;
        }
        
        .section-title {
          background: #2c5f2d;
          color: white;
          padding: 8px 15px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .info-item {
          display: flex;
          padding: 8px 0;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 140px;
          color: #2c5f2d;
        }
        
        .info-value {
          flex: 1;
        }
        
        .description-box {
          background: #f9f9f9;
          border-left: 4px solid #2c5f2d;
          padding: 15px;
          margin: 15px 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        
        th {
          background: #2c5f2d;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          border: 1px solid #1a4620;
        }
        
        td {
          padding: 10px 8px;
          border: 1px solid #ddd;
        }
        
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .signature-section {
          margin-top: 50px;
          text-align: center;
        }
        
        .signature-block {
          text-align: center;
        }
        
        .signature-line {
          border-top: 2px solid #000;
          margin: 60px 10px 5px;
          padding-top: 5px;
        }
        
        .signature-name {
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .signature-title {
          font-size: 11px;
          color: #666;
          font-style: italic;
        }
        
        .signature-date {
          font-size: 10px;
          margin-top: 10px;
          color: #666;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #2c5f2d;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        .notes {
          background: #fff9e6;
          border: 1px solid #ffd700;
          padding: 15px;
          margin: 20px 0;
          font-size: 11px;
        }
        
        .notes-title {
          font-weight: bold;
          color: #997a00;
          margin-bottom: 8px;
        }
        
        @media print {
          body {
            padding: 0;
            background: white;
          }
          
          .document {
            box-shadow: none;
            padding: 40px;
          }
        }
      `}</style>
      
      <div className="header">
        <div className="logo-section">
          <img 
            src="/static/images/logo/logo.png" 
            alt="MAO Logo" 
            className="logo"
            style={{ height: '60pt', maxWidth: '120pt' }}
          />
          <div className="title-section">
            <h1>MUNICIPAL AGRICULTURE OFFICE</h1>
            <h2>OPOL, MISAMIS ORIENTAL</h2>
            <p className="office-address">Province of Misamis Oriental, Philippines</p>
          </div>
          <img 
            src="/static/images/logo/opol_logo.png" 
            alt="Opol Logo" 
            className="logo"
            style={{ height: '60pt', maxWidth: '120pt' }}
          />
        </div>
        <div className="letterhead-divider" />
        <h2>Agricultural Subsidy Program</h2>
        <h2>Program Implementation Document</h2>
        <div className="doc-info">
          <span>Document Type: Program Implementation</span>
          <span>Generated: {formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Program Information</div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Program Title:</span>
            <span className="info-value">{program.title}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Start Date:</span>
            <span className="info-value">{formatDate(program.start_date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">End Date:</span>
            <span className="info-value">{formatDate(program.end_date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Duration:</span>
            <span className="info-value">{(() => {
              const start = new Date(program.start_date);
              const end = new Date(program.end_date);
              const diffTime = Math.abs(end - start);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return `${diffDays} days`;
            })()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Coordinator:</span>
            <span className="info-value">
              {program.creator 
                ? `${program.creator.fname || ''} ${program.creator.lname || ''}`.trim()
                : coordinatorName
              }
            </span>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Beneficiary List with Item Allocations</div>
        
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>No.</th>
              <th>Beneficiary Name</th>
              <th>RSBSA Number</th>
              <th>Barangay</th>
              <th>Item Name</th>
              <th style={{ width: '70px' }}>Quantity</th>
              <th style={{ width: '100px' }}>Date Received</th>
              <th style={{ width: '120px' }}>Signature</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map((beneficiary, beneficiaryIndex) => {
              const items = beneficiary.items || [];
              return items.map((item, itemIndex) => (
                <tr key={`${beneficiaryIndex}-${itemIndex}`}>
                  <td>{itemIndex === 0 ? beneficiaryIndex + 1 : ''}</td>
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
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {item.quantity} {item.unit}
                  </td>
                  <td />
                  <td />
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      <div className="signature-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '700px', margin: '0 auto' }}>
          <div className="signature-block">
            <div className="signature-line">
              <div className="signature-name">
                {program.creator 
                  ? `${program.creator.fname || ''} ${program.creator.lname || ''}`.trim()
                  : coordinatorName
                }
              </div>
              <div className="signature-title">Program Coordinator</div>
            </div>
          </div>
          <div className="signature-block">
            <div className="signature-line">
              <div className="signature-name">MR. EDDIE C. MAAPE, JR.</div>
              <div className="signature-title">Municipal Agriculturist</div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <p><strong>Agricultural Subsidy Program Document</strong></p>
        <p>This document serves as official record of the agricultural subsidy program implementation.</p>
        <p>All beneficiaries listed above have been verified and approved for participation.</p>
        <p style={{ marginTop: '15px' }}>Generated by Agricultural Subsidy Management System</p>
        <p>Municipal Agriculture Office, Opol, Misamis Oriental</p>
        <p>Document generated on {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  );
};

ProgramDocument.propTypes = {
  program: PropTypes.object.isRequired,
  beneficiaries: PropTypes.array,
  formatDate: PropTypes.func.isRequired,
  coordinatorName: PropTypes.string
};

export default ProgramDocument;