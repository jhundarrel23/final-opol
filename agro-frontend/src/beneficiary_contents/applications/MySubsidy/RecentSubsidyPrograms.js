// RecentSubsidyPrograms.js
import { Card, CircularProgress, Alert, Box, Button, Typography } from '@mui/material';
import SubsidyTable from './SubsidyTable';
import useSubsidy from './usehookSubsidy';

function RecentSubsidyPrograms() {
  const { subsidyPrograms, loading, error, refetch, notRegistered } = useSubsidy();

  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Box sx={{ mt: 2 }}>Loading your subsidy programs...</Box>
      </Card>
    );
  }

  // Handle case where user is not registered as beneficiary
  if (notRegistered) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are not registered as a beneficiary.
        </Alert>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          To access subsidy programs, you need to be registered as a beneficiary in the system.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => refetch()}>
          Check Again
        </Button>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Error loading subsidy programs: {error}
        </Alert>
      </Card>
    );
  }

  // Handle empty programs case
  if (!subsidyPrograms || subsidyPrograms.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          No Subsidy Programs Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You don't have any subsidy programs yet.
        </Typography>
        <Button variant="outlined" onClick={() => refetch()}>
          Refresh
        </Button>
      </Card>
    );
  }

  // Transform the subsidy data to match the table format
  const transformedPrograms = subsidyPrograms.map(program => ({
    id: program.id,
    programTitle: program.title,
    programDate: new Date(program.created_at).getTime(),
    status: determineStatus(program),
    programID: `SP-${program.id}`,
    creatorName: program.creator?.name || 'Unknown',
    creatorRole: program.creator?.role || 'Unknown',
    totalItems: program.items_summary?.total_items || 0,
    totalValue: program.items_summary?.total_value || 0,
    sector: program.creator?.sector || 'N/A',
    currency: '₱',
    startDate: program.start_date,
    endDate: program.end_date,
    approver: program.approver?.name || null,
    items: program.my_items || [],
    title: program.title,
    description: program.description,
    start_date: program.start_date,
    end_date: program.end_date
  }));

  // Helper function to determine status based on dates and current status
  function determineStatus(program) {
    const now = new Date();
    const startDate = new Date(program.start_date);
    const endDate = new Date(program.end_date);

    if (program.status === 'completed') return 'completed';
    if (program.status === 'cancelled') return 'cancelled';
    if (program.status === 'pending') return 'pending';
        
    // For ongoing programs, check dates
    if (program.status === 'ongoing') {
      if (now < startDate) return 'pending';
      if (now > endDate) return 'completed';
      return 'ongoing';
    }

    return program.status || 'pending';
  }

  return (
    <Card>
      <SubsidyTable subsidyPrograms={transformedPrograms} />
    </Card>
  );
}

export default RecentSubsidyPrograms;