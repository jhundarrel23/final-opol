import React from 'react';
import PropTypes from 'prop-types';

const PrintHeader = ({ 
  title, 
  subtitle, 
  documentType = "Report",
  generatedDate = new Date(),
  programTitle = "",
  coordinatorName = "",
  department = "Municipal Agriculture Office - Opol"
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="print-header">
      <div className="logo-section">
        <img 
          src="/static/images/logo/logo.png" 
          alt="MAO Logo" 
          className="logo"
          style={{ height: '60pt', maxWidth: '120pt' }}
        />
        <div className="title-section">
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
          <p className="subtitle">{department}</p>
        </div>
        <img 
          src="/static/images/logo/opol_logo.png" 
          alt="Opol Logo" 
          className="logo"
          style={{ height: '60pt', maxWidth: '120pt' }}
        />
      </div>
      
      <div className="document-info">
        <div>
          <strong>Document Type:</strong> {documentType}
        </div>
        <div>
          <strong>Generated:</strong> {formatDate(generatedDate)}
        </div>
        {programTitle && (
          <div>
            <strong>Program:</strong> {programTitle}
          </div>
        )}
        {coordinatorName && (
          <div>
            <strong>Coordinator:</strong> {coordinatorName}
          </div>
        )}
      </div>
    </div>
  );
};

PrintHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  documentType: PropTypes.string,
  generatedDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  programTitle: PropTypes.string,
  coordinatorName: PropTypes.string,
  department: PropTypes.string
};

export default PrintHeader;
