// HelpSupport.js
import { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3),
  boxShadow: theme.shadows[6],
}));

const SupportCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

// Mock FAQ data
const faqs = [
  { question: 'How to register as a beneficiary?', answer: 'Click the register button and fill out the form.' },
  { question: 'How to reset my password?', answer: 'Click "Forgot Password" and follow the instructions.' },
  { question: 'How to download training materials?', answer: 'Go to Training Materials, select the file, and click Download.' },
];

export default function HelpSupport() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleSendMessage = () => {
    alert(`Message sent: ${message}`);
    setMessage('');
    handleCloseDialog();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledCard>
        <CardHeader
          avatar={<HelpOutlineIcon />}
          title="Support & FAQ"
          subheader="Get help, ask questions, or contact support"
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* FAQ Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Frequently Asked Questions</Typography>
              {faqs.map((faq, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>

            {/* Contact Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Contact Support</Typography>
              <SupportCard>
                <List>
                  <ListItem>
                    <ListItemIcon><PhoneIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="+63 912 345 6789" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><EmailIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="support@farmportal.com" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationOnIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="123 Agriculture St., Manila, Philippines" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AccessTimeIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Mon-Fri 8:00am - 5:00pm" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><WhatsAppIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Chat with us on WhatsApp" />
                  </ListItem>
                </List>
                <Button variant="contained" startIcon={<SendIcon />} fullWidth sx={{ mt: 2 }} onClick={handleOpenDialog}>
                  Send Message
                </Button>
              </SupportCard>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>

      {/* Send Message Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send a Message to Support</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained" endIcon={<SendIcon />}>Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
