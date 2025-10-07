/* eslint-disable consistent-return */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-alert */
import { format, isValid, parseISO } from 'date-fns';

/* ----------------- Utility Functions ------------------ */
const formatDate = (dateValue, formatString = 'MMM dd, yyyy') => {
  if (!dateValue) return 'N/A';
  let date;
  if (typeof dateValue === 'string') {
    date = parseISO(dateValue);
    if (!isValid(date)) date = new Date(dateValue);
  } else if (dateValue instanceof Date) date = dateValue;
  else return 'N/A';
  return isValid(date) ? format(date, formatString) : 'Invalid Date';
};

const formatFullName = (b) => {
  const parts = [b.lastName, b.firstName, b.middleName, b.suffixExtension].filter(Boolean);
  return parts.join(', ') || b.name || 'N/A';
};

const formatFullAddress = (b) => {
  const parts = [b.streetPurokBarangay, b.municipality, b.province].filter(Boolean);
  return parts.join(', ') || 'N/A';
};

const formatCommodities = (commodities) => {
  if (!commodities || !Array.isArray(commodities)) return 'N/A';
  return commodities
    .map(c => {
      let area = parseFloat(c.size_hectares ?? c.parcelArea ?? 0);
      if (isNaN(area)) area = 0;
      return `${c.name} – ${area.toFixed(2)} ha`;
    })
    .join(', ');
};

const formatFarmTypes = (farmTypes) => {
  if (!farmTypes || !Array.isArray(farmTypes)) return 'N/A';
  return farmTypes.map(ft => {
    if (!ft) return 'Unknown';
    const normalized = ft.toString().toLowerCase().trim();
    if (normalized.includes('irrigated')) return 'Irrigated';
    if (normalized.includes('upland')) return 'Rainfed Upland';
    if (normalized.includes('lowland')) return 'Rainfed Lowland';
    if (normalized.includes('rainfed')) return 'Rainfed';
    return ft.charAt(0).toUpperCase() + ft.slice(1).toLowerCase();
  }).join(', ');
};

/* ----------------- Statistics Calculation ------------------ */
const calculateFarmTypeStats = (beneficiaries) => {
  const farmTypeData = {
    'Irrigated': { count: 0, area: 0 },
    'Rainfed Upland': { count: 0, area: 0 },
    'Rainfed Lowland': { count: 0, area: 0 },
  };

  beneficiaries.forEach(b => {
    const area = parseFloat(b.totalParcelArea) || 0;
    if (b.farmTypes && Array.isArray(b.farmTypes)) {
      const processed = new Set();
      b.farmTypes.forEach(ft => {
        const type = ft?.toString().toLowerCase().trim();
        if (!type) return;
        if (type.includes('irrigated') && !processed.has('irrigated')) {
          farmTypeData['Irrigated'].count++;
          farmTypeData['Irrigated'].area += area;
          processed.add('irrigated');
        } else if (type.includes('upland') && !processed.has('upland')) {
          farmTypeData['Rainfed Upland'].count++;
          farmTypeData['Rainfed Upland'].area += area;
          processed.add('upland');
        } else if (type.includes('lowland') && !processed.has('lowland')) {
          farmTypeData['Rainfed Lowland'].count++;
          farmTypeData['Rainfed Lowland'].area += area;
          processed.add('lowland');
        } else if (type.includes('rainfed') && !processed.has('rainfed')) {
          farmTypeData['Rainfed Upland'].count++;
          farmTypeData['Rainfed Upland'].area += area;
          processed.add('rainfed');
        }
      });
    }
  });

  return farmTypeData;
};

/* ----------------- Report Generation ------------------ */
const generateCoordinatorReportHTML = (beneficiaries, options = {}) => {
  const { title = 'RSBSA BENEFICIARIES COORDINATOR REPORT', includeStats = true } = options;

  const reportDate = new Date();
  const reportId = `COORD-RPT-${format(reportDate, 'yyyyMMdd-HHmmss')}`;

  const totalBeneficiaries = beneficiaries.length;
  const totalFarmArea = beneficiaries.reduce((sum, b) => sum + (parseFloat(b.totalParcelArea) || 0), 0);
  const farmTypeStats = calculateFarmTypeStats(beneficiaries);

  const tableRows = beneficiaries.map((b, idx) => `
    <tr>
      <td class="center row-number">${idx + 1}</td>
      <td class="center code-cell">${b.systemGeneratedRsbaNumber || 'N/A'}</td>
      <td class="center code-cell">${b.rsbaNumber || b.manual_rsbsa_number || b.systemGeneratedRsbaNumber || 'Pending'}</td>
      <td class="name-cell">${formatFullName(b)}</td>
      <td class="address-cell">${formatFullAddress(b)}</td>
      <td class="center">${b.sex || 'N/A'}</td>
      <td class="center">${b.contactNo || 'N/A'}</td>
      <td class="commodity-cell">${formatCommodities(b.commodities)}</td>
      <td class="center">${formatFarmTypes(b.farmTypes)}</td>
      <td class="center">${formatDate(b.createdAt)}</td>
    </tr>
  `).join('');

  const farmTypeTableRows = Object.entries(farmTypeStats).map(([type, data]) => `
    <tr>
      <td class="farm-type-name">${type}</td>
      <td class="center">${data.count}</td>
      <td class="right">${data.area.toFixed(2)}</td>
    </tr>
  `).join('');

  const totalFarmTypeCount = Object.values(farmTypeStats).reduce((sum, d) => sum + d.count, 0);
  const totalFarmTypeArea = Object.values(farmTypeStats).reduce((sum, d) => sum + d.area, 0);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 4px; }
          th { background: #1565c0; color: #fff; text-align: center; font-size: 9px; }
          tr:nth-child(even) { background: #f8f9fa; }
          .center { text-align: center; } .right { text-align: right; } .row-number { font-weight: bold; }
          .code-cell { font-family: monospace; color: #1565c0; } .name-cell { font-weight: 600; }
          .address-cell, .commodity-cell { font-size: 8px; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <p><strong>Report Date:</strong> ${formatDate(reportDate, 'MMMM dd, yyyy')} | <strong>Document ID:</strong> ${reportId}</p>
        <p><strong>Total Beneficiaries:</strong> ${totalBeneficiaries} | <strong>Total Farm Area:</strong> ${totalFarmArea.toFixed(2)} ha</p>
        <table>
          <thead>
            <tr>
              <th>NO.</th>
              <th>SYS GEN RSBSA NO.</th>
              <th>RSBSA NO.</th>
              <th>NAME</th>
              <th>ADDRESS</th>
              <th>SEX</th>
              <th>CONTACT</th>
              <th>COMMODITY / AREA</th>
              <th>FARM TYPE</th>
              <th>DATE CREATED</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        ${includeStats ? `
          <h3>Farm Type Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Farm Type</th>
                <th>No. of Beneficiaries</th>
                <th>Total Farm Area (ha)</th>
              </tr>
            </thead>
            <tbody>
              ${farmTypeTableRows}
              <tr style="font-weight:bold; background:#4caf50; color:#fff;">
                <td>Overall Total</td>
                <td class="center">${totalFarmTypeCount}</td>
                <td class="right">${totalFarmTypeArea.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        ` : ''}
      </body>
    </html>
  `;
};

/* ----------------- Export Functions ------------------ */
export const printDetailedReport = (beneficiaries, options = {}) => {
  if (!beneficiaries || !beneficiaries.length) return alert('No data available for printing');
  const htmlContent = generateCoordinatorReportHTML(beneficiaries, { ...options, includeStats: true });
  const win = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  if (!win) return alert('Please allow popups for this site to print reports');
  win.document.write(htmlContent);
  win.document.close();
  win.onload = () => { setTimeout(() => { win.focus(); win.print(); }, 500); };
};

export const exportDetailedToPDF = (beneficiaries, options = {}) => {
  if (!beneficiaries || !beneficiaries.length) return alert('No data available for export');
  const htmlContent = generateCoordinatorReportHTML(beneficiaries, { ...options, includeStats: true });
  const win = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  if (!win) return alert('Please allow popups for this site to export reports');
  win.document.write(htmlContent);
  win.document.close();
  win.onload = () => { setTimeout(() => { win.focus(); alert('Press Ctrl+P to save as PDF'); }, 500); };
};

export default {
  printDetailedReport,
  exportDetailedToPDF,
  generateCoordinatorReportHTML
};
