import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Skeleton,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Add as AddIcon,
    PlayArrow as PlayIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    TrendingUp as TrendingIcon,
    Schedule as ScheduleIcon,
    School as SchoolIcon,
    PlayCircleOutline as DemoIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import quizService from '../services/quizService';
import { QuizSortOptions } from '../types/quiz.types';

/**
 * QuizDashboard - Main component for the quiz module
 * Inherits the parent project's Material-UI design system
 */
const QuizDashboard = () => {
    const { userRole } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        subject_area: '',
        difficulty_level: '',
        tags: [],
        is_public: null
    });
    const [sortBy, setSortBy] = useState(QuizSortOptions.CREATED_DESC);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const loadQuizzes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let result;
            if (searchTerm.trim()) {
                result = await quizService.searchQuizzes(searchTerm, filters);
            } else {
                result = await quizService.getQuizzes(filters, sortBy, page, 12);
            }

            if (result.error) {
                throw result.error;
            }

            setQuizzes(result.data || []);

            // Get total count for pagination
            if (!searchTerm.trim()) {
                const countResult = await quizService.getQuizCount(filters);
                if (countResult.data) {
                    setTotalPages(Math.ceil(countResult.data / 12));
                }
            }
        } catch (err) {
            console.error('Failed to load quizzes:', err);
            setError('Failed to load quizzes. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters, sortBy, page, searchTerm]);

    // Load quizzes on component mount and when filters change
    useEffect(() => {
        loadQuizzes();
    }, [loadQuizzes]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1); // Reset to first page when filters change
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
        setPage(1);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setFilters({
            subject_area: '',
            difficulty_level: '',
            tags: [],
            is_public: null
        });
        setSearchTerm('');
        setSortBy(QuizSortOptions.CREATED_DESC);
        setPage(1);
    };

    const formatTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };


    if (loading && quizzes.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Quiz Dashboard
                </Typography>
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={32} />
                                    <Skeleton variant="text" width="40%" height={24} />
                                    <Skeleton variant="text" width="80%" height={20} />
                                    <Box sx={{ mt: 2 }}>
                                        <Skeleton variant="rectangular" width="100%" height={20} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Quiz Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Discover and take quizzes on various subjects, or create your own to share with others.
                        </Typography>
                    </Box>

                    {/* Demo Link - Admin Only */}
                    {userRole === 'admin' && (
                        <Button
                            variant="outlined"
                            startIcon={<DemoIcon />}
                            href="/question-demo"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ ml: 2 }}
                        >
                            View Demo
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Search and Filters Bar */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Search */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search quizzes..."
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Sort */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Sort by</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sort by"
                                onChange={handleSortChange}
                            >
                                <MenuItem value={QuizSortOptions.CREATED_DESC}>Newest First</MenuItem>
                                <MenuItem value={QuizSortOptions.CREATED_ASC}>Oldest First</MenuItem>
                                <MenuItem value={QuizSortOptions.TITLE_ASC}>Title A-Z</MenuItem>
                                <MenuItem value={QuizSortOptions.TITLE_DESC}>Title Z-A</MenuItem>
                                <MenuItem value={QuizSortOptions.POPULARITY}>Most Popular</MenuItem>
                                <MenuItem value={QuizSortOptions.PASS_RATE}>Highest Pass Rate</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Filter Toggle */}
                    <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant={showFilters ? "contained" : "outlined"}
                                startIcon={<FilterIcon />}
                                onClick={() => setShowFilters(!showFilters)}
                                fullWidth
                            >
                                Filters
                            </Button>
                            {userRole === 'admin' && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    color="primary"
                                    fullWidth
                                >
                                    Create Quiz
                                </Button>
                            )}
                        </Box>
                    </Grid>
                </Grid>

                {/* Advanced Filters */}
                {showFilters && (
                    <Box sx={{ mt: 3, p: 3, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Subject Area</InputLabel>
                                    <Select
                                        value={filters.subject_area}
                                        label="Subject Area"
                                        onChange={(e) => handleFilterChange('subject_area', e.target.value)}
                                    >
                                        <MenuItem value="">All Subjects</MenuItem>
                                        <MenuItem value="mathematics">Mathematics</MenuItem>
                                        <MenuItem value="physics">Physics</MenuItem>
                                        <MenuItem value="chemistry">Chemistry</MenuItem>
                                        <MenuItem value="biology">Biology</MenuItem>
                                        <MenuItem value="computer_science">Computer Science</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Difficulty</InputLabel>
                                    <Select
                                        value={filters.difficulty_level}
                                        label="Difficulty"
                                        onChange={(e) => handleFilterChange('difficulty_level', e.target.value)}
                                    >
                                        <MenuItem value="">All Levels</MenuItem>
                                        <MenuItem value={1}>Beginner</MenuItem>
                                        <MenuItem value={2}>Easy</MenuItem>
                                        <MenuItem value={3}>Medium</MenuItem>
                                        <MenuItem value={4}>Hard</MenuItem>
                                        <MenuItem value={5}>Expert</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Visibility</InputLabel>
                                    <Select
                                        value={filters.is_public}
                                        label="Visibility"
                                        onChange={(e) => handleFilterChange('is_public', e.target.value)}
                                    >
                                        <MenuItem value={null}>All</MenuItem>
                                        <MenuItem value={true}>Public</MenuItem>
                                        <MenuItem value={false}>Private</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="outlined"
                                    onClick={clearFilters}
                                    fullWidth
                                >
                                    Clear Filters
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Quizzes Grid */}
            {quizzes.length === 0 && !loading ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No quizzes found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your search terms or filters.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {quizzes.map((quiz) => (
                        <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* Quiz Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6" component="h2" gutterBottom>
                                            {quiz.title}
                                        </Typography>
                                        {quiz.is_public ? (
                                            <Chip label="Public" size="small" color="success" />
                                        ) : (
                                            <Chip label="Private" size="small" color="default" />
                                        )}
                                    </Box>

                                    {/* Quiz Description */}
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {quiz.description || 'No description available'}
                                    </Typography>

                                    {/* Quiz Stats */}
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                        <Chip
                                            icon={<SchoolIcon />}
                                            label={`${quiz.questions?.length || 0} questions`}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={<ScheduleIcon />}
                                            label={formatTime(quiz.time_limit_minutes)}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={<TrendingIcon />}
                                            label={`${quiz.attempt_count || 0} attempts`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>

                                    {/* Tags */}
                                    {quiz.tags && quiz.tags.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            {quiz.tags.slice(0, 3).map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tag}
                                                    size="small"
                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                />
                                            ))}
                                            {quiz.tags.length > 3 && (
                                                <Chip
                                                    label={`+${quiz.tags.length - 3}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    )}

                                    {/* Pass Rate */}
                                    {quiz.attempt_count > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Pass Rate:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold" color="primary">
                                                {quiz.pass_rate?.toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>

                                {/* Card Actions */}
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<PlayIcon />}
                                            fullWidth
                                            size="small"
                                        >
                                            Take Quiz
                                        </Button>

                                        {userRole === 'admin' && (
                                            <>
                                                <Tooltip title="Edit Quiz">
                                                    <IconButton size="small" color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Quiz">
                                                    <IconButton size="small" color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}

                                        <Tooltip title="View Details">
                                            <IconButton size="small">
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Container>
    );
};

export default QuizDashboard;
