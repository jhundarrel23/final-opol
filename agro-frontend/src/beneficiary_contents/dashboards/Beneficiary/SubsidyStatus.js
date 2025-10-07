/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import { 
  Calendar, 
  Package, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Gift,
  Target,
  ArrowRight,
  X,
  Info,
  MapPin
} from 'lucide-react';
import useSubsidy from './useSubsidy';

function SubsidyPrograms() {
  const {
    subsidyPrograms,
    stats,
    upcoming,
    totalPrograms,
    hasPrograms,
    loading,
    refreshing,
    error,
    notRegistered,
    lastUpdated,
    completedCount,
    cancelledCount,
    activeOrPendingCount,
    refresh,
    clearError,
    fetchProgramDetails
  } = useSubsidy();

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleProgramClick = async (program) => {
    setLoadingDetails(true);
    setShowDetails(true);
    try {
      const details = await fetchProgramDetails(program.id);
      setSelectedProgram(details || program);
    } catch (err) {
      console.error('Failed to load program details:', err);
      setSelectedProgram(program);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedProgram(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Approved' },
      'pending': { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Pending' },
      'ongoing': { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', label: 'Ongoing' },
      'under_review': { color: '#7C3AED', bg: '#F3E8FF', border: '#C4B5FD', label: 'Under Review' },
      'completed': { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Completed' },
      'cancelled': { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Cancelled' },
      'rejected': { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Rejected' },
      'declined': { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Declined' },
      'distributed': { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Released' }
    };
    const style = statusMap[status] || statusMap['pending'];
    return {
      color: style.color,
      backgroundColor: style.bg,
      borderColor: style.border,
      label: style.label
    };
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'pending': 'Your items are waiting to be prepared for distribution',
      'ongoing': 'Program is currently active and items are being processed',
      'approved': 'Your application has been approved',
      'under_review': 'Your application is being reviewed by the coordinator',
      'completed': 'All items have been distributed',
      'distributed': 'This item has been released and is ready for pickup',
      'cancelled': 'This program has been cancelled',
      'rejected': 'Your application was not approved'
    };
    return descriptions[status] || 'Status information not available';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'To be announced';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const emptyAll = !loading && !error && !notRegistered && totalPrograms === 0;

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #EBF8FF 0%, #FFFFFF 50%, #F0FDF4 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const maxWidthStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #F3F4F6',
    marginBottom: '24px',
    padding: '24px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px'
  };

  const subtitleStyle = {
    color: '#6B7280',
    fontSize: '16px',
    lineHeight: '1.5'
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  const refreshButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#F3F4F6',
    color: '#374151'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  };

  const statCardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #F3F4F6',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden'
  };

  const iconContainerStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  };

  const statNumberStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '4px'
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '500'
  };

  const upcomingGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px'
  };

  const programCardStyle = {
    background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
    border: '2px solid #E5E7EB',
    borderRadius: '16px',
    padding: '24px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const skeletonStyle = {
    backgroundColor: '#E5E7EB',
    borderRadius: '4px',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  };

  const errorStyle = {
    marginTop: '16px',
    padding: '20px',
    backgroundColor: '#FEF2F2',
    border: '2px solid #FECACA',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  };

  const notRegisteredStyle = {
    marginTop: '16px',
    padding: '20px',
    backgroundColor: '#FFFBEB',
    border: '2px solid #FDE68A',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '64px 24px'
  };

  const infoBoxStyle = {
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    gap: '12px'
  };

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        
        {/* Header Section */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <div>
              <h1 style={titleStyle}>My Benefits & Assistance Programs</h1>
              <p style={subtitleStyle}>
                Track your government assistance, view upcoming distributions, and monitor the status of your benefits.
                {lastUpdated && (
                  <span style={{ display: 'block', fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>
                    Last updated: {lastUpdated.toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                )}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={refresh}
                disabled={refreshing || loading}
                style={{
                  ...refreshButtonStyle,
                  opacity: (refreshing || loading) ? 0.5 : 1,
                  cursor: (refreshing || loading) ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (!refreshing && !loading) e.target.style.backgroundColor = '#E5E7EB';
                }}
                onMouseOut={(e) => {
                  if (!refreshing && !loading) e.target.style.backgroundColor = '#F3F4F6';
                }}
              >
                <RefreshCw size={18} style={{ animation: (refreshing || loading) ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Updating...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {error && (
            <div style={errorStyle}>
              <AlertCircle size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: '#DC2626', margin: '0 0 8px 0', fontWeight: '600', fontSize: '16px' }}>Unable to Load Your Programs</p>
                <p style={{ color: '#B91C1C', margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5' }}>
                  {error}. Please check your internet connection and try again.
                </p>
                <button
                  onClick={clearError}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline',
                    fontWeight: '500',
                    padding: 0
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {notRegistered && (
            <div style={notRegisteredStyle}>
              <AlertCircle size={24} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: '#92400E', margin: '0 0 8px 0', fontWeight: '600', fontSize: '16px' }}>Beneficiary Registration Required</p>
                <p style={{ color: '#A16207', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  You need to complete your beneficiary registration to access government assistance programs. 
                  Please visit your local agricultural office or contact your coordinator for assistance with registration.
                </p>
              </div>
            </div>
          )}
        </div>

        {!notRegistered && !error && (
          <>
            {/* Info Box */}
            <div style={infoBoxStyle}>
              <Info size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#1E40AF', lineHeight: '1.5' }}>
                  <strong>What you can do here:</strong> View your approved programs, check when you can collect your benefits, 
                  and see detailed information about each item you'll receive. Click on any program card to see complete details.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={statsGridStyle}>
              {/* Total Programs */}
              <div style={statCardStyle}>
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  width: '80px', 
                  height: '80px', 
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)', 
                  borderRadius: '0 16px 0 100%' 
                }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ ...iconContainerStyle, backgroundColor: '#DBEAFE' }}>
                      <Package size={26} color="#2563EB" />
                    </div>
                    <TrendingUp size={22} color="#059669" />
                  </div>
                  {loading ? (
                    <div>
                      <div style={{ ...skeletonStyle, height: '36px', width: '80px', marginBottom: '8px' }} />
                      <div style={{ ...skeletonStyle, height: '18px', width: '120px' }} />
                    </div>
                  ) : (
                    <>
                      <p style={statNumberStyle}>{totalPrograms}</p>
                      <p style={statLabelStyle}>Active Programs</p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
                        Programs you're enrolled in
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Distributions */}
            <div style={cardStyle}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ ...iconContainerStyle, backgroundColor: '#DBEAFE', width: '44px', height: '44px', marginBottom: 0 }}>
                    <Calendar size={22} color="#2563EB" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      Scheduled Distributions
                    </h2>
                    <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
                      {upcoming.length > 0 
                        ? 'Click on any program to see what items you will receive and when to collect them' 
                        : 'No upcoming distributions scheduled at this time'}
                    </p>
                  </div>
                  <div style={{ 
                    backgroundColor: '#EFF6FF', 
                    padding: '8px 16px', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock size={18} color="#2563EB" />
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#1E40AF' }}>
                      {upcoming.length} scheduled
                    </span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div style={upcomingGridStyle}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ ...skeletonStyle, height: '180px', borderRadius: '16px' }} />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <div style={emptyStateStyle}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <Calendar size={40} color="#9CA3AF" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    No Upcoming Distributions
                  </h3>
                  <p style={{ color: '#6B7280', margin: 0, fontSize: '15px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>
                    There are no scheduled distributions at the moment. New programs and distributions will appear here 
                    once they are approved and scheduled by your coordinator. Check back regularly for updates.
                  </p>
                </div>
              ) : (
                <div style={upcomingGridStyle}>
                  {upcoming.slice(0, 6).map((program) => {
                    const dateText = program.expectedRelease ?? program.release_date ?? program.distribution_date;
                    const statusBadge = getStatusBadge(program.status);
                    return (
                      <div
                        key={program.id}
                        onClick={() => handleProgramClick(program)}
                        style={programCardStyle}
                        onMouseOver={(e) => {
                          e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0, 0, 0, 0.12)';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.borderColor = '#2563EB';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = '#E5E7EB';
                        }}
                      >
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                            <h3 style={{ 
                              fontWeight: '600', 
                              color: '#111827', 
                              marginBottom: 0,
                              fontSize: '18px',
                              flex: 1,
                              lineHeight: '1.4'
                            }}>
                              {program.name || program.title || 'Untitled Program'}
                            </h3>
                            <ArrowRight size={22} color="#2563EB" style={{ marginLeft: '12px', flexShrink: 0 }} />
                          </div>
                          <p style={{ 
                            fontSize: '14px', 
                            color: '#6B7280', 
                            margin: '0 0 16px 0',
                            lineHeight: '1.5',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {program.description || 'Agricultural assistance program'}
                          </p>
                        </div>
                        
                        <div style={{ 
                          padding: '16px',
                          backgroundColor: '#F9FAFB',
                          borderRadius: '12px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <Calendar size={18} color="#2563EB" />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 2px 0', fontWeight: '500' }}>
                                Distribution Date
                              </p>
                              <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
                                {formatDate(dateText)}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              ...statusBadge,
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '600',
                              border: '1px solid'
                            }}>
                              {statusBadge.label}
                            </span>
                          </div>
                        </div>

                        {/* Items Summary */}
                        <div style={{ 
                          paddingTop: '16px',
                          borderTop: '1px solid #E5E7EB',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '14px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#374151' }}>
                            <Package size={16} color="#6B7280" />
                            <span style={{ fontWeight: '500' }}>{program.items_summary?.total_items || 0} items to receive</span>
                          </div>
                          <div style={{ 
                            fontSize: '15px', 
                            fontWeight: '600', 
                            color: '#111827',
                            backgroundColor: '#F3F4F6',
                            padding: '4px 12px',
                            borderRadius: '8px'
                          }}>
                            {formatCurrency(program.items_summary?.total_value || 0)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Program Details Modal */}
        {showDetails && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }} onClick={closeDetails}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                borderBottom: '2px solid #E5E7EB',
                padding: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                borderRadius: '20px 20px 0 0'
              }}>
                <div>
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#111827', margin: '0 0 6px 0' }}>
                    Program Details
                  </h2>
                  <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
                    Review all items and information about this assistance program
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  style={{
                    background: '#F3F4F6',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#E5E7EB'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                >
                  <X size={26} color="#6B7280" />
                </button>
              </div>

              {/* Modal Content */}
              {loadingDetails ? (
                <div style={{ padding: '64px', textAlign: 'center' }}>
                  <RefreshCw size={40} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '20px', color: '#6B7280', fontSize: '16px' }}>Loading program details...</p>
                </div>
              ) : selectedProgram && (
                <div style={{ padding: '28px' }}>
                  {/* Program Info */}
                  <div style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '28px',
                    border: '2px solid #E5E7EB'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#111827', marginBottom: '10px', lineHeight: '1.3' }}>
                          {selectedProgram.title || selectedProgram.name}
                        </h3>
                        <p style={{ color: '#6B7280', fontSize: '15px', margin: 0, lineHeight: '1.6' }}>
                          {selectedProgram.description || 'Government assistance program for agricultural beneficiaries'}
                        </p>
                      </div>
                      {selectedProgram.status && (
                        <span style={{
                          ...getStatusBadge(selectedProgram.status),
                          padding: '8px 18px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          border: '2px solid',
                          marginLeft: '20px',
                          whiteSpace: 'nowrap'
                        }}>
                          {getStatusBadge(selectedProgram.status).label}
                        </span>
                      )}
                    </div>

                    {selectedProgram.status && (
                      <div style={{
                        backgroundColor: '#EFF6FF',
                        padding: '14px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '12px'
                      }}>
                        <Info size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ margin: 0, fontSize: '14px', color: '#1E40AF', lineHeight: '1.5' }}>
                          <strong>Status:</strong> {getStatusDescription(selectedProgram.status)}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      <div style={{
                        backgroundColor: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <Calendar size={18} color="#2563EB" />
                          <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                            Distribution Date
                          </p>
                        </div>
                        <p style={{ fontSize: '17px', color: '#111827', fontWeight: '600', margin: 0 }}>
                          {formatDate(selectedProgram.expectedRelease)}
                        </p>
                      </div>
                      <div style={{
                        backgroundColor: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <Package size={18} color="#2563EB" />
                          <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                            Total Items
                          </p>
                        </div>
                        <p style={{ fontSize: '17px', color: '#111827', fontWeight: '600', margin: 0 }}>
                          {selectedProgram.items_summary?.total_items || 0} items
                        </p>
                      </div>
                      <div style={{
                        backgroundColor: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <Gift size={18} color="#2563EB" />
                          <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                            Total Value
                          </p>
                        </div>
                        <p style={{ fontSize: '17px', color: '#111827', fontWeight: '600', margin: 0 }}>
                          {formatCurrency(selectedProgram.items_summary?.total_value || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                        Items You Will Receive
                      </h4>
                      <p style={{ color: '#6B7280', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                        Below is the complete list of items allocated to you under this program. 
                        Please bring a valid ID when collecting your items.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {selectedProgram.items?.map((item, index) => {
                        const itemStatus = getStatusBadge(item.status);
                        return (
                          <div
                            key={item.id}
                            style={{
                              border: '2px solid #E5E7EB',
                              borderRadius: '14px',
                              padding: '20px',
                              backgroundColor: 'white',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                  <span style={{
                                    backgroundColor: '#EFF6FF',
                                    color: '#2563EB',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    minWidth: '36px',
                                    textAlign: 'center'
                                  }}>
                                    {index + 1}
                                  </span>
                                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                                    {item.item_name}
                                  </p>
                                </div>
                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                                  gap: '16px',
                                  marginTop: '16px'
                                }}>
                                  <div>
                                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 4px 0', fontWeight: '500' }}>
                                      QUANTITY
                                    </p>
                                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                                      {item.quantity} {item.unit}
                                    </p>
                                  </div>
                                  {item.total_value > 0 && (
                                    <div>
                                      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 4px 0', fontWeight: '500' }}>
                                        ESTIMATED VALUE
                                      </p>
                                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                                        {formatCurrency(item.total_value)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                <span style={{
                                  ...itemStatus,
                                  padding: '8px 16px',
                                  borderRadius: '12px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  border: '2px solid',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {itemStatus.label}
                                </span>
                              </div>
                            </div>
                            {item.status === 'distributed' && (
                              <div style={{
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid #E5E7EB',
                                backgroundColor: '#ECFDF5',
                                padding: '12px',
                                borderRadius: '8px',
                                marginTop: '16px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <CheckCircle size={18} color="#059669" />
                                  <p style={{ margin: 0, fontSize: '14px', color: '#047857', fontWeight: '500' }}>
                                    This item has been released and distributed to you
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div style={{
                    marginTop: '28px',
                    padding: '20px',
                    backgroundColor: '#FFFBEB',
                    border: '2px solid #FDE68A',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <AlertCircle size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600', color: '#92400E' }}>
                          Important Reminders
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400E', fontSize: '14px', lineHeight: '1.6' }}>
                          <li>Please bring a valid ID when collecting your items</li>
                          <li>Items must be collected on the scheduled distribution date</li>
                          <li>If you cannot collect on the scheduled date, inform your coordinator in advance</li>
                          <li>Items are non-transferable and must be claimed by the registered beneficiary</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    marginTop: '28px',
                    paddingTop: '24px',
                    borderTop: '2px solid #E5E7EB',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={closeDetails}
                      style={{
                        padding: '12px 28px',
                        borderRadius: '12px',
                        border: '2px solid #E5E7EB',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#F9FAFB';
                        e.target.style.borderColor = '#D1D5DB';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#E5E7EB';
                      }}
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {emptyAll && (
          <div style={{ ...cardStyle, ...emptyStateStyle }}>
            <div style={{
              width: '96px',
              height: '96px',
              backgroundColor: '#F3F4F6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Package size={48} color="#9CA3AF" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              No Active Programs Yet
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '24px', maxWidth: '500px', margin: '0 auto', fontSize: '15px', lineHeight: '1.6' }}>
              You don't have any active assistance programs at the moment. When you're enrolled in a program 
              or receive benefits, they will appear here. Contact your local agricultural office or coordinator 
              for information about available programs you may qualify for.
            </p>
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default SubsidyPrograms;