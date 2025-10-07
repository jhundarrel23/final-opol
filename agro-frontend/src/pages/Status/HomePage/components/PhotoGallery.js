import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  Dialog,
  IconButton,
  Chip
} from '@mui/material';
import { Close } from '@mui/icons-material';

const PhotoGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop',
      title: 'Rice Field Harvest',
      category: 'Agriculture',
      description: 'Successful rice harvest in Barangay San Juan'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      title: 'Farming Training Session',
      category: 'Training',
      description: 'Farmers learning modern cultivation techniques'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop',
      title: 'Livestock Program',
      category: 'Livestock',
      description: 'Cattle raising program in rural communities'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=600&h=400&fit=crop',
      title: 'Organic Vegetable Farm',
      category: 'Organic',
      description: 'Sustainable organic farming practices'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop',
      title: 'Community Gathering',
      category: 'Community',
      description: 'Farmers association meeting and planning'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop',
      title: 'Agricultural Technology',
      category: 'Technology',
      description: 'Modern equipment demonstration'
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      Agriculture: 'primary',
      Training: 'secondary',
      Livestock: 'success',
      Organic: 'warning',
      Community: 'info',
      Technology: 'error'
    };
    return colors[category] || 'default';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          gutterBottom
          fontWeight={600}
        >
          Photo Gallery
        </Typography>

        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
        >
          Explore our agricultural programs through photos showcasing the hard
          work and achievements of our farming communities.
        </Typography>

        <Grid container spacing={3}>
          {galleryImages.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Card
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 8
                  }
                }}
                onClick={() => setSelectedImage(image)}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={image.src}
                  alt={image.title}
                  sx={{ objectFit: 'cover' }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog for full-size image */}
        <Dialog
          open={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          maxWidth="md"
        >
          {selectedImage && (
            <>
              <Box
                sx={{
                  position: 'relative',
                  bgcolor: 'black',
                  p: 2
                }}
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'white',
                    zIndex: 10
                  }}
                  onClick={() => setSelectedImage(null)}
                >
                  <Close />
                </IconButton>

                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '80vh',
                    objectFit: 'contain'
                  }}
                />
              </Box>

              <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    {selectedImage.title}
                  </Typography>
                  <Chip
                    label={selectedImage.category}
                    color={getCategoryColor(selectedImage.category)}
                    size="small"
                  />
                </Box>
                <Typography color="text.secondary">
                  {selectedImage.description}
                </Typography>
              </Box>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default PhotoGallery;