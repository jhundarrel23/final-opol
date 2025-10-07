/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
// utils/pdfExportUtils.js
import { printHtmlDocument } from '../../../utils/printUtils';

// Helper function to format currency for display
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return `₱${parseFloat(amount).toLocaleString('en-PH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to get movement type text
const getMovementTypeText = (movementType) => {
  const movementMap = {
    stock_in: 'Stock In',
    stock_out: 'Stock Out',
    adjustment: 'Adjustment',
    transfer: 'Transfer',
    distribution: 'Distribution'
  };
  return movementMap[movementType] || 'Unknown';
};

// Helper function to get transaction type text
const getTransactionTypeText = (transactionType) => {
  const typeMap = {
    purchase: 'Purchase',
    grant: 'Grant',
    return: 'Return',
    distribution: 'Distribution',
    damage: 'Damaged/Lost',
    expired: 'Expired Items',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    adjustment: 'Stock Adjustment',
    initial_stock: 'Initial Stock'
  };
  return typeMap[transactionType] || transactionType;
};

// Generate filters information HTML
const generateFiltersInfo = (filters) => {
  if (!Object.values(filters).some(filter => filter && filter !== false)) {
    return '';
  }

  return `
    <div class="filters-section">
      <h3>Applied Filters</h3>
      <div class="filters-grid">
        ${filters.dateFrom || filters.dateTo ? 
          `<div class="filter-item">
            <span class="filter-label">Date Range:</span>
            <span class="filter-value">${filters.dateFrom || 'Start'} to ${filters.dateTo || 'End'}</span>
          </div>` : ''}
        ${filters.movementType ? 
          `<div class="filter-item">
            <span class="filter-label">Movement:</span>
            <span class="filter-value">${getMovementTypeText(filters.movementType)}</span>
          </div>` : ''}
        ${filters.transactionType ? 
          `<div class="filter-item">
            <span class="filter-label">Transaction:</span>
            <span class="filter-value">${getTransactionTypeText(filters.transactionType)}</span>
          </div>` : ''}
        ${filters.itemSearch ? 
          `<div class="filter-item">
            <span class="filter-label">Search:</span>
            <span class="filter-value">${filters.itemSearch}</span>
          </div>` : ''}
      </div>
    </div>
  `;
};

// Generate table rows HTML
const generateTableRows = (stocks) => {
  return stocks.map((stock, index) => {
    const isStockOut = stock.movement_type === 'stock_out';
    const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
    
    return `
      <tr class="${rowClass}">
        <td class="date-cell">${formatDate(stock.transaction_date)}</td>
        <td class="item-cell">
          <div class="item-name">${stock.inventory?.item_name || 'Unknown Item'}</div>
          <div class="item-details">${stock.inventory?.item_type || ''} • ${stock.inventory?.unit || ''}</div>
        </td>
        <td class="center-cell">
          <span class="badge ${isStockOut ? 'badge-danger' : 'badge-success'}">
            ${getMovementTypeText(stock.movement_type)}
          </span>
        </td>
        <td class="center-cell">
          <span class="badge badge-neutral">
            ${getTransactionTypeText(stock.transaction_type)}
          </span>
        </td>
        <td class="number-cell ${isStockOut ? 'text-danger' : 'text-success'}">
          <strong>${isStockOut ? '-' : '+'}${stock.quantity ?? 0}</strong>
        </td>
        <td class="currency-cell">${formatCurrency(stock.total_value)}</td>
        <td class="number-cell">${stock.running_balance ?? '—'}</td>
        <td class="reference-cell">${stock.reference || '—'}</td>
      </tr>
    `;
  }).join('');
};

// Generate PDF CSS styles
const generatePDFStyles = () => {
  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.4;
        color: #333;
        background: white;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 3px solid #2196F3;
        padding-bottom: 20px;
      }
      
      .header h1 {
        color: #1976D2;
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .header .subtitle {
        color: #666;
        font-size: 14px;
        font-weight: 400;
      }
      
      .summary-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 25px;
      }
      
      .summary-card {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 8px;
        padding: 16px;
        border-left: 4px solid #2196F3;
      }
      
      .summary-card h4 {
        color: #1976D2;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }
      
      .summary-card .value {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
      
      .filters-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
        border: 1px solid #dee2e6;
      }
      
      .filters-section h3 {
        color: #495057;
        font-size: 16px;
        margin-bottom: 15px;
        font-weight: 600;
      }
      
      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }
      
      .filter-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .filter-label {
        font-size: 11px;
        text-transform: uppercase;
        color: #6c757d;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      
      .filter-value {
        font-size: 13px;
        color: #495057;
        font-weight: 500;
      }
      
      .table-container {
        margin-top: 25px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }
      
      th {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 8px;
        text-align: left;
        font-weight: 600;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: none;
      }
      
      td {
        padding: 10px 8px;
        border-bottom: 1px solid #e9ecef;
        vertical-align: top;
      }
      
      .even-row {
        background-color: #f8f9fa;
      }
      
      .odd-row {
        background-color: white;
      }
      
      .date-cell {
        width: 15%;
        font-size: 10px;
        color: #495057;
      }
      
      .item-cell {
        width: 25%;
      }
      
      .item-name {
        font-weight: 600;
        color: #212529;
        font-size: 11px;
        margin-bottom: 2px;
      }
      
      .item-details {
        font-size: 9px;
        color: #6c757d;
        font-style: italic;
      }
      
      .center-cell {
        text-align: center;
        width: 12%;
      }
      
      .number-cell {
        text-align: right;
        width: 8%;
        font-family: 'Courier New', monospace;
      }
      
      .currency-cell {
        text-align: right;
        width: 12%;
        font-weight: 600;
        font-family: 'Courier New', monospace;
      }
      
      .reference-cell {
        width: 10%;
        font-size: 10px;
        color: #6c757d;
      }
      
      .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 9px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      
      .badge-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      
      .badge-danger {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f1b0b7;
      }
      
      .badge-neutral {
        background-color: #e2e3e5;
        color: #383d41;
        border: 1px solid #d6d8db;
      }
      
      .text-success {
        color: #28a745 !important;
      }
      
      .text-danger {
        color: #dc3545 !important;
      }
      
      @media print {
        body { 
          margin: 0; 
          font-size: 10px;
        }
        .container {
          padding: 10px;
        }
        .header {
          margin-bottom: 20px;
          padding-bottom: 10px;
        }
        .summary-section, .filters-section {
          margin-bottom: 15px;
        }
        table {
          font-size: 9px;
        }
        th {
          font-size: 8px;
        }
        .item-name {
          font-size: 9px;
        }
        .item-details {
          font-size: 8px;
        }
      }
    </style>
  `;
};

// moved import to top

// Main PDF export function
export const exportTransactionHistoryToPDF = (stocks, filters = {}) => {
  const reportDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const filtersInfo = generateFiltersInfo(filters);
  const tableRows = generateTableRows(stocks);

  // Calculate summary statistics
  const totalValue = stocks.reduce((sum, stock) => sum + (parseFloat(stock.total_value) || 0), 0);
  const stockInCount = stocks.filter(s => s.movement_type === 'stock_in').length;
  const stockOutCount = stocks.filter(s => s.movement_type === 'stock_out').length;

  const bodyHtml = `
    ${generatePDFStyles()}
    <div class="container">
      <div class="header">
        <h1>Transaction History Report</h1>
        <p class="subtitle">Generated on ${reportDate}</p>
      </div>
      
      <div class="summary-section">
        <div class="summary-card">
          <h4>Total Records</h4>
          <div class="value">${stocks.length.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <h4>Total Value</h4>
          <div class="value">${formatCurrency(totalValue)}</div>
        </div>
        <div class="summary-card">
          <h4>Stock In Transactions</h4>
          <div class="value">${stockInCount.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <h4>Stock Out Transactions</h4>
          <div class="value">${stockOutCount.toLocaleString()}</div>
        </div>
      </div>
      
      ${filtersInfo}
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Item Details</th>
              <th>Movement</th>
              <th>Transaction</th>
              <th>Quantity</th>
              <th>Total Value</th>
              <th>Balance</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>
  `;

  printHtmlDocument('Transaction History Report', bodyHtml, { width: 1200, height: 800, printDelayMs: 150 });
};

// Optional: Export as downloadable PDF using a library (if you add html2pdf.js or similar)
export const exportTransactionHistoryToPDFFile = async (stocks, filters = {}) => {
  // This would require adding html2pdf.js or jsPDF library
  // For now, we'll just use the print method above
  console.warn('Direct PDF file export not implemented. Using print preview instead.');
  exportTransactionHistoryToPDF(stocks, filters);
};