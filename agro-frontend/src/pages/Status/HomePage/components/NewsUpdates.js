import React from 'react';
import { Box, Typography, Container, Card, CardContent, CardMedia, Grid, Chip, Button } from '@mui/material';
import { CalendarToday, ArrowForward } from '@mui/icons-material';

const NewsUpdates = () => {
  const news = [
    {
      id: 1,
      title: 'New Agricultural Subsidies Program Launched',
      excerpt: 'Government announces expanded support for small-scale farmers with increased subsidies for seeds and fertilizers.',
      date: '2024-03-15',
      category: 'Program Launch',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop',
      featured: true
    },
    {
      id: 2,
      title: 'Training Workshop on Sustainable Farming',
      excerpt: 'Upcoming workshop series focusing on eco-friendly farming practices and organic agriculture methods.',
      date: '2024-03-18',
      category: 'Training',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop',
      featured: false
    },
    {
      id: 3,
      title: 'Rice Harvest Festival 2024',
      excerpt: 'Annual celebration of successful rice harvest with community activities and farmer recognition awards.',
      date: '2024-03-20',
      category: 'Event',
      image: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=400&h=250&fit=crop',
      featured: false
    },
    {
      id: 4,
      title: 'Livestock Vaccination Drive',
      excerpt: 'Free vaccination program for livestock to prevent disease outbreaks and improve animal health.',
      date: '2024-03-22',
      category: 'Health Program',
      image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=250&fit=crop',
      featured: false
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Program Launch': 'primary',
      'Training': 'secondary',
      'Event': 'success',
      'Health Program': 'warning'
    };
    return colors[category] || 'default';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" gutterBottom fontWeight={600}>
          Latest News & Updates
        </Typography>
        
        <Typography 
          variant="body1" 
          textAlign="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
        >
          Stay informed about the latest developments, programs, and opportunities in our agricultural community.
        </Typography>

        <Grid container spacing={4}>
          {news.map((article) => (
            <Grid item xs={12} md={article.featured ? 12 : 6} lg={article.featured ? 8 : 4} key={article.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: article.featured ? { md: 'row' } : 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: article.featured ? { md: 400 } : '100%',
                    height: article.featured ? { md: 280 } : 200,
                    objectFit: 'cover'
                  }}
                  image={article.image}
                  alt={article.title}
                />
                
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={article.category}
                      color={getCategoryColor(article.category)}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption">
                        {new Date(article.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography 
                    variant={article.featured ? "h4" : "h6"} 
                    gutterBottom 
                    fontWeight={600}
                    sx={{ 
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {article.title}
                  </Typography>
                  
                  <Typography 
                    color="text.secondary" 
                    paragraph
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {article.excerpt}
                  </Typography>
                  
                  <Button 
                    endIcon={<ArrowForward />}
                    sx={{ mt: 'auto' }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" sx={{ mt: 6 }}>
          <Button variant="outlined" size="large">
            View All News
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NewsUpdates;