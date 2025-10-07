import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Grid,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3),
  boxShadow: theme.shadows[10],
}));

const MaterialCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

// Mock data for training materials
const mockTrainingMaterials = [
  {
    id: 'TM-001',
    title: 'Modern Rice Farming Techniques',
    description: 'Comprehensive guide to modern rice farming methods, including seed selection, planting techniques, and harvest optimization.',
    category: 'Crop Production',
    type: 'PDF Guide',
    duration: '45 min read',
    level: 'Beginner',
    instructor: 'Dr. Maria Santos',
    thumbnail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
    downloadCount: 1250,
    rating: 4.8,
    tags: ['rice', 'planting', 'modern techniques'],
    dateAdded: '2024-01-15',
    fileSize: '2.5 MB',
    language: 'English/Filipino'
  },
  {
    id: 'TM-002',
    title: 'Organic Pest Control Methods',
    description: 'Learn natural and organic methods to control pests without harmful chemicals. Protect your crops and the environment.',
    category: 'Pest Management',
    type: 'Video Tutorial',
    duration: '25 minutes',
    level: 'Intermediate',
    instructor: 'John Cruz',
    thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
    downloadCount: 890,
    rating: 4.6,
    tags: ['organic', 'pest control', 'natural methods'],
    dateAdded: '2024-01-20',
    fileSize: 'Streaming',
    language: 'Filipino'
  },
  {
    id: 'TM-003',
    title: 'Soil Health and Fertility Management',
    description: 'Understanding soil composition, pH levels, nutrient management, and improving soil fertility for better crop yields.',
    category: 'Soil Management',
    type: 'Interactive Course',
    duration: '2 hours',
    level: 'Advanced',
    instructor: 'Prof. Ana Reyes',
    thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
    downloadCount: 567,
    rating: 4.9,
    tags: ['soil health', 'fertility', 'nutrients'],
    dateAdded: '2024-02-01',
    fileSize: 'Online Course',
    language: 'English'
  },
  {
    id: 'TM-004',
    title: 'Water-Efficient Irrigation Systems',
    description: 'Modern irrigation techniques to maximize water efficiency and reduce costs while maintaining optimal crop growth.',
    category: 'Water Management',
    type: 'PDF Guide',
    duration: '30 min read',
    level: 'Intermediate',
    instructor: 'Eng. Pedro Garcia',
    thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=200&fit=crop',
    downloadCount: 723,
    rating: 4.7,
    tags: ['irrigation', 'water management', 'efficiency'],
    dateAdded: '2024-02-10',
    fileSize: '1.8 MB',
    language: 'English/Filipino'
  },
  {
    id: 'TM-005',
    title: 'Post-Harvest Handling and Storage',
    description: 'Best practices for handling crops after harvest, proper storage techniques, and preventing post-harvest losses.',
    category: 'Post-Harvest',
    type: 'Video Tutorial',
    duration: '40 minutes',
    level: 'Beginner',
    instructor: 'Rosa Martinez',
    thumbnail: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&h=200&fit=crop',
    downloadCount: 945,
    rating: 4.5,
    tags: ['post-harvest', 'storage', 'handling'],
    dateAdded: '2024-02-15',
    fileSize: 'Streaming',
    language: 'Filipino'
  },
  {
    id: 'TM-006',
    title: 'Farm Business Management',
    description: 'Financial planning, record keeping, marketing strategies, and business development for small-scale farmers.',
    category: 'Farm Management',
    type: 'Interactive Course',
    duration: '3 hours',
    level: 'Advanced',
    instructor: 'CPA Jose Dela Cruz',
    thumbnail: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=300&h=200&fit=crop',
    downloadCount: 412,
    rating: 4.8,
    tags: ['business', 'management', 'financial planning'],
    dateAdded: '2024-02-20',
    fileSize: 'Online Course',
    language: 'English/Filipino'
  }
];

const categories = ['All Categories', 'Crop Production', 'Pest Management', 'Soil Management', 'Water Management', 'Post-Harvest', 'Farm Management'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const types = ['All Types', 'PDF Guide', 'Video Tutorial', 'Interactive Course'];

function TrainingMaterials() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedType, setSelectedType] = useState('All Types');

  useEffect(() => {
    // Simulate API call
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMaterials(mockTrainingMaterials);
        setFilteredMaterials(mockTrainingMaterials);
      } catch (error) {
        console.error('Error fetching training materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    let filtered = materials;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel && selectedLevel !== 'All Levels') {
      filtered = filtered.filter(material => material.level === selectedLevel);
    }

    // Filter by type
    if (selectedType && selectedType !== 'All Types') {
      filtered = filtered.filter(material => material.type === selectedType);
    }

    setFilteredMaterials(filtered);
  }, [materials, searchTerm, selectedCategory, selectedLevel, selectedType]);

  const handleViewDetails = (material) => {
    setSelectedMaterial(material);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMaterial(null);
  };

  const handleDownload = (materialId) => {
    // Simulate download
    alert(`Downloading material: ${materialId}`);
  };

  const handleBookmark = (materialId) => {
    // Simulate bookmark
    alert(`Bookmarked material: ${materialId}`);
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'success',
      'Intermediate': 'warning',
      'Advanced': 'error'
    };
    return colors[level] || 'default';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'PDF Guide': <PictureAsPdfIcon />,
      'Video Tutorial': <PlayCircleOutlineIcon />,
      'Interactive Course': <SchoolIcon />
    };
    return icons[type] || <SchoolIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <StyledCard>
          <CardContent>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading training materials...</Typography>
          </CardContent>
        </StyledCard>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledCard>
        <CardHeader
          avatar={<SchoolIcon />}
          title="Training Materials"
          subheader="Access educational resources to improve your farming knowledge and skills"
        />
        <CardContent>
          {/* Search and Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search training materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={selectedLevel}
                  label="Level"
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  {levels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedType}
                  label="Type"
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {types.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Quick Access - Frequently Used */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Quick Access - Popular Materials</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {materials.slice(0, 3).map((material) => (
                  <Grid item xs={12} md={4} key={material.id}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>{material.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {material.instructor}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="caption">{material.duration}</Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => handleViewDetails(material)}
                      >
                        Access
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Training Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <Alert severity="info">
              {searchTerm || selectedCategory !== 'All Categories' || selectedLevel !== 'All Levels' || selectedType !== 'All Types'
                ? 'No training materials match your search criteria. Try adjusting your filters.'
                : 'No training materials are currently available. Please check back later.'
              }
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredMaterials.map((material) => (
                <Grid item xs={12} md={6} lg={4} key={material.id}>
                  <MaterialCard>
                    <CardMedia
                      component="img"
                      height="140"
                      image={material.thumbnail}
                      alt={material.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1 }}>
                          {material.title}
                        </Typography>
                        <Chip
                          label={material.level}
                          size="small"
                          color={getLevelColor(material.level)}
                        />
                      </Box>
                      
                      <CategoryChip 
                        label={material.category} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mb: 1 }}
                      />
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {material.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getTypeIcon(material.type)}
                        <Typography variant="body2" sx={{ ml: 1, mr: 2 }}>
                          {material.type}
                        </Typography>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {material.duration}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon fontSize="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {material.instructor}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        Downloaded {material.downloadCount} times
                      </Typography>
                      
                      {/* Rating */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="primary">
                          ⭐ {material.rating}/5.0
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        onClick={() => handleViewDetails(material)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleDownload(material.id)}
                        startIcon={<DownloadIcon />}
                        sx={{ ml: 'auto' }}
                      >
                        Access
                      </Button>
                    </CardActions>
                  </MaterialCard>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </StyledCard>

      {/* Material Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMaterial?.title}
        </DialogTitle>
        <DialogContent>
          {selectedMaterial && (
            <Box>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedMaterial.description}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>What You'll Learn</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Modern farming techniques and best practices" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Practical implementation strategies" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Real-world case studies and examples" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Step-by-step guidance and troubleshooting" />
                    </ListItem>
                  </List>
                  
                  <Typography variant="h6" gutterBottom>Tags</Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedMaterial.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="h6" gutterBottom>Material Information</Typography>
                    <Typography variant="body2"><strong>Category:</strong> {selectedMaterial.category}</Typography>
                    <Typography variant="body2"><strong>Type:</strong> {selectedMaterial.type}</Typography>
                    <Typography variant="body2"><strong>Duration:</strong> {selectedMaterial.duration}</Typography>
                    <Typography variant="body2"><strong>Level:</strong></Typography>
                    <Chip
                      label={selectedMaterial.level}
                      size="small"
                      color={getLevelColor(selectedMaterial.level)}
                      sx={{ mt: 1, mb: 2 }}
                    />
                    <Typography variant="body2"><strong>Instructor:</strong> {selectedMaterial.instructor}</Typography>
                    <Typography variant="body2"><strong>File Size:</strong> {selectedMaterial.fileSize}</Typography>
                    <Typography variant="body2"><strong>Language:</strong> {selectedMaterial.language}</Typography>
                    <Typography variant="body2"><strong>Added:</strong> {new Date(selectedMaterial.dateAdded).toLocaleDateString()}</Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2"><strong>Rating:</strong> ⭐ {selectedMaterial.rating}/5.0</Typography>
                      <Typography variant="body2"><strong>Downloads:</strong> {selectedMaterial.downloadCount}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button
            onClick={() => handleBookmark(selectedMaterial?.id)}
            startIcon={<BookmarkIcon />}
          >
            Bookmark
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleDownload(selectedMaterial?.id)}
            startIcon={<DownloadIcon />}
          >
            Access Material
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TrainingMaterials;