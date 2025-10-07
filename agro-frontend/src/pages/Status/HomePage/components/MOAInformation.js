import React, { useState } from 'react';
import { Box, Typography, Container,  Button, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import { ExpandMore, Download, Article, DateRange } from '@mui/icons-material';

const MOAInformation = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const moaDocuments = [
    {
      title: 'Agricultural Development Program 2024-2026',
      date: '2024-01-15',
      status: 'Active',
      description: 'Comprehensive agricultural support program focusing on crop diversification and sustainable farming practices.',
      downloadUrl: '#'
    },
    {
      title: 'Rice Production Enhancement Initiative',
      date: '2024-03-10',
      status: 'Active',
      description: 'Special program to boost rice production through modern farming techniques and quality seeds distribution.',
      downloadUrl: '#'
    },
    {
      title: 'Livestock Development Partnership',
      date: '2024-02-20',
      status: 'Active',
      description: 'Support for livestock farmers including veterinary services and breeding program assistance.',
      downloadUrl: '#'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" gutterBottom fontWeight={600}>
          Memorandum of Agreement
        </Typography>
        
        <Typography 
          variant="body1" 
          textAlign="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
        >
          Official documents and agreements governing our agricultural support programs and partnerships.
        </Typography>

        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          {moaDocuments.map((doc, index) => (
            <Accordion 
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{ mb: 2, boxShadow: 2 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ py: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  <Article color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {doc.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <DateRange fontSize="small" sx={{ mr: 0.5 }} />
                        {new Date(doc.date).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={doc.status} 
                        color="success" 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Typography paragraph color="text.secondary">
                  {doc.description}
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => {/* Handle download */}}
                  sx={{ mt: 2 }}
                >
                  Download Document
                </Button>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default MOAInformation;
