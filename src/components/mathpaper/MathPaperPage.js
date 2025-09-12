import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Paper,
    Grid,
    Autocomplete,
    Chip,
    CircularProgress,
    Alert,
    AppBar,
    Toolbar,
    IconButton,
    Breadcrumbs,
    Link
} from '@mui/material';
import 'katex/dist/katex.min.css';
import {
    Search,
    FilterList,
    School,
    Home,
    ArrowBack,
    Visibility
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import QuestionDisplay from './QuestionDisplay';
import { DiscussionSection } from '../discussion';
import SEOHead from '../common/SEOHead';
import { createCourseStructuredData, createBreadcrumbStructuredData } from '../../utils/structuredData';
import { trackMathPaperEvent, trackSearch } from '../../utils/analytics';

const MathPaperPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const questionDetailsRef = React.useRef(null);

    // Add component mount tracking to prevent infinite loops
    const [componentMounted, setComponentMounted] = useState(false);
    const tagsLoadedRef = useRef(false);

    useEffect(() => {
        setComponentMounted(true);
        return () => {
            setComponentMounted(false);
        };
    }, []);

    // Convert question tags array to the format expected by the UI
    const getQuestionTagsFromData = (question) => {
        if (!question || !question.tags || !Array.isArray(question.tags)) {
            return [];
        }

        // Convert array of tag strings to objects with topic and tag properties
        return question.tags.map(tag => ({
            topic: 'General', // Default topic since we don't have topic info in the tags array
            tag: tag
        }));
    };

    // Extract unique tags from all questions for autocomplete
    const extractTagsFromQuestions = useCallback((questionsList) => {
        const allTags = new Set();
        questionsList.forEach(question => {
            if (question.tags && Array.isArray(question.tags)) {
                question.tags.forEach(tag => allTags.add(tag));
            }
        });
        return Array.from(allTags);
    }, []);

    // Load tags for all questions in the current results
    const loadTagsForQuestions = useCallback(async (questionsList) => {
        const tagsMap = {};
        for (const question of questionsList) {
            const tags = getQuestionTagsFromData(question);
            tagsMap[question.id] = tags;
        }
        setQuestionTags(tagsMap);
    }, []);

    // Handle tag search from URL parameters (simplified like your reference code)
    const handleTagSearchFromURL = useCallback(async (tags) => {
        if (tags.length === 0) return;

        setIsTagSearchActive(true);
        setLoading(true);
        setError('');

        try {
            console.log('Searching for tags from URL:', tags);

            // Use direct query with contains operator (like your reference code)
            let query = supabase
                .from('Math_Past_Paper')
                .select('*')
                .order('year', { ascending: false })
                .order('question_no', { ascending: true });

            // Add tag filtering (like your reference code)
            if (tags.length > 0) {
                query = query.contains('tags', tags);
            }

            // Add timeout (like your reference code)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const { data, error } = await Promise.race([query, timeoutPromise]);

            if (error) {
                console.error('Error in URL tag search:', error);
                setError(`Failed to search by tags: ${error.message}`);
                return;
            }

            const matchingQuestions = data || [];
            setQuestions(matchingQuestions);

            // Load tags for the matching questions
            if (matchingQuestions.length > 0) {
                loadTagsForQuestions(matchingQuestions);
                // Update available tags from the loaded questions
                const questionTags = extractTagsFromQuestions(matchingQuestions);
                if (questionTags.length > 0) {
                    setAvailableTags(prev => [...new Set([...prev, ...questionTags])]);
                }
            }

            if (matchingQuestions.length === 0) {
                setError(`No questions found with tags: ${tags.join(', ')}`);
            }

        } catch (err) {
            console.error('Error searching by tags from URL:', err);
            setError(`Failed to search by tags: ${err.message}`);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setIsTagSearchActive(false);
            }, 1000);
        }
    }, [loadTagsForQuestions, extractTagsFromQuestions]);

    // Initialize state from URL parameters
    useEffect(() => {
        const urlTags = searchParams.get('tags');
        if (urlTags) {
            const tagsArray = urlTags.split(',').filter(tag => tag.trim());
            setSearchTags(tagsArray);
            // Automatically trigger tag search if tags are in URL
            if (tagsArray.length > 0) {
                handleTagSearchFromURL(tagsArray);
            }
        } else {
            // Clear tags if no URL parameters
            setSearchTags([]);
            setQuestions([]);
            setSelectedQuestion(null);
            setError('');
        }
    }, [searchParams, handleTagSearchFromURL]);



    // Filter states
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedPaper, setSelectedPaper] = useState('');
    const [selectedQuestionNo, setSelectedQuestionNo] = useState('');

    // Search states
    const [searchTags, setSearchTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [searchInput, setSearchInput] = useState('');

    // Data states
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [questionTags, setQuestionTags] = useState({}); // Store tags for each question
    const [popularTags, setPopularTags] = useState([]);
    const [isTagSearchActive, setIsTagSearchActive] = useState(false); // Track if tag search is active

    // Generate year options (2012-2025)
    const yearOptions = Array.from({ length: 14 }, (_, i) => 2012 + i);

    // Paper options
    const paperOptions = ['I', 'II'];

    // Question number options based on paper type
    const getQuestionNumberOptions = (paper) => {
        if (paper === 'I') {
            return Array.from({ length: 20 }, (_, i) => i + 1);
        } else if (paper === 'II') {
            return Array.from({ length: 45 }, (_, i) => i + 1);
        }
        return [];
    };

    // Sample available tags for testing
    const getSampleAvailableTags = useCallback(() => {
        return [
            'factor_method', 'roots', 'quadratic_formula', 'domain', 'range',
            'sine', 'cosine', 'tangent', 'conditional_probability', 'arithmetic_sequence',
            'geometric_sequence', 'quadratic_inequalities', 'chords', 'standard_deviation',
            'permutation_notation', 'combination_notation', 'direct_variation', 'inverse_variation'
        ];
    }, []);

    // Load available tags from actual questions in the database
    const loadAvailableTags = useCallback(async () => {
        try {
            // Get all questions to extract their tags
            const { data: allQuestions, error } = await supabase
                .from('Math_Past_Paper')
                .select('tags')
                .not('tags', 'is', null);

            if (error) {
                console.error('Error loading questions for tags:', error);
                // Fallback to sample tags
                setAvailableTags(getSampleAvailableTags());
                return;
            }

            // Extract all unique tags from questions
            const allTags = new Set();
            allQuestions.forEach(question => {
                if (question.tags && Array.isArray(question.tags)) {
                    question.tags.forEach(tag => allTags.add(tag));
                }
            });

            const uniqueTags = Array.from(allTags).sort();

            if (uniqueTags.length === 0) {
                // If no tags found, use sample tags for testing
                setAvailableTags(getSampleAvailableTags());
            } else {
                setAvailableTags(uniqueTags);
            }
        } catch (err) {
            console.error('Error loading tags:', err);
            // For testing, use sample tags
            setAvailableTags(getSampleAvailableTags());
        }
    }, [getSampleAvailableTags]);


    // Sample popular tags for testing
    const getSamplePopularTags = useCallback(() => {
        return [
            { topic: 'Quadratic Equations', tag: 'factor_method', count: 25 },
            { topic: 'Functions and Graphs', tag: 'domain', count: 20 },
            { topic: 'Trigonometry', tag: 'sine', count: 18 },
            { topic: 'Probability', tag: 'conditional_probability', count: 15 },
            { topic: 'Sequences and Series', tag: 'arithmetic_sequence', count: 12 },
            { topic: 'Inequalities and Linear Programming', tag: 'quadratic_inequalities', count: 10 },
            { topic: 'Properties of Circles', tag: 'chords', count: 8 },
            { topic: 'Measures of Dispersion', tag: 'standard_deviation', count: 6 }
        ];
    }, []);

    // Load popular tags using direct query (like your reference code)
    const loadPopularTags = useCallback(async () => {
        try {
            console.log('Fetching popular tags...');

            // Get tags from questions directly (like your reference code)
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('tags')
                .not('tags', 'is', null)
                .limit(100);

            if (error) {
                console.error('Error fetching tags:', error);
                setPopularTags(getSamplePopularTags());
                return;
            }

            // Process tags based on how they're stored (like your reference code)
            const allTags = data.flatMap(item =>
                Array.isArray(item.tags) ? item.tags :
                    typeof item.tags === 'string' ? item.tags.split(',') :
                        []
            );

            // Get top 15 popular tags (like your reference code)
            const tagCounts = {};
            allTags.forEach(tag => {
                if (tag && tag.trim()) {
                    tagCounts[tag.trim()] = (tagCounts[tag.trim()] || 0) + 1;
                }
            });

            const popularTagsArray = Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 15)
                .map(([tag, count]) => ({
                    topic: 'General',
                    tag: tag,
                    count: count
                }));

            console.log('Popular tags fetched:', popularTagsArray.length, 'tags');

            if (popularTagsArray.length === 0) {
                setPopularTags(getSamplePopularTags());
            } else {
                setPopularTags(popularTagsArray);
            }

        } catch (err) {
            console.error('Error fetching popular tags:', err);
            setPopularTags(getSamplePopularTags());
        }
    }, [getSamplePopularTags]);

    // Load available tags from database
    useEffect(() => {
        if (!tagsLoadedRef.current) {
            tagsLoadedRef.current = true;
            loadAvailableTags();
            loadPopularTags();
        }
    }, [loadAvailableTags, loadPopularTags]);

    // Debug: Monitor questions state changes
    // useEffect(() => {
    //     console.log('Questions state changed to:', questions.length, 'questions');
    //     if (questions.length > 0) {
    //         console.log('First question:', questions[0]);
    //     }
    // }, [questions]);




    // Handle filter search (simplified like your reference code)
    const handleFilterSearch = async () => {
        // Don't run filter search if we're doing a tag search
        if (isTagSearchActive) {
            console.log('Skipping handleFilterSearch because tag search is active');
            return;
        }

        setLoading(true);
        setError('');
        setIsTagSearchActive(false);

        try {
            console.log('Fetching questions with filters:', { selectedYear, selectedPaper, selectedQuestionNo });

            // Use direct query instead of database function (like your reference code)
            let query = supabase
                .from('Math_Past_Paper')
                .select('*')
                .order('year', { ascending: false })
                .order('question_no', { ascending: true });

            // Add filters if selected
            if (selectedYear) {
                query = query.eq('year', selectedYear);
            }
            if (selectedPaper) {
                query = query.eq('paper', selectedPaper);
            }

            // Add timeout (like your reference code)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const { data, error } = await Promise.race([query, timeoutPromise]);

            if (error) {
                console.error('Error fetching questions:', error);
                setError(`Failed to fetch questions: ${error.message}`);
                return;
            }

            // Filter by question number if selected
            let filteredData = data || [];
            if (selectedQuestionNo) {
                filteredData = filteredData.filter(q => q.question_no === parseInt(selectedQuestionNo));
            }

            setQuestions(filteredData);

            // Load tags for the questions
            if (filteredData.length > 0) {
                loadTagsForQuestions(filteredData);
                // Update available tags from the loaded questions
                const questionTags = extractTagsFromQuestions(filteredData);
                if (questionTags.length > 0) {
                    setAvailableTags(prev => [...new Set([...prev, ...questionTags])]);
                }
            }

            // Track search analytics
            const searchTerm = `${selectedYear || 'All'} ${selectedPaper || 'All'} ${selectedQuestionNo || 'All'}`;
            trackSearch(searchTerm, filteredData.length);

            // If exactly one result and all three filters are specified, show details directly
            if (filteredData.length === 1 && selectedYear && selectedPaper && selectedQuestionNo) {
                setSelectedQuestion(filteredData[0]);
                // Load tags for the selected question if not already loaded
                if (!questionTags[filteredData[0].id]) {
                    const tags = getQuestionTagsFromData(filteredData[0]);
                    setQuestionTags(prev => ({
                        ...prev,
                        [filteredData[0].id]: tags
                    }));
                }
                trackMathPaperEvent('question_viewed', selectedYear, selectedPaper, selectedQuestionNo);
                // Scroll to question details after a short delay to ensure component is rendered
                setTimeout(() => {
                    questionDetailsRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            } else {
                setSelectedQuestion(null);
            }

        } catch (err) {
            console.error('Error fetching questions:', err);
            setError(`Failed to fetch questions: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle tag search (simplified like your reference code)
    const handleTagSearch = async (tagsToSearch = null) => {
        const tags = tagsToSearch || searchTags;
        if (tags.length === 0) return;

        setIsTagSearchActive(true);
        setLoading(true);
        setError('');

        try {
            console.log('Searching for tags:', tags);

            // Use direct query with contains operator (like your reference code)
            let query = supabase
                .from('Math_Past_Paper')
                .select('*')
                .order('year', { ascending: false })
                .order('question_no', { ascending: true });

            // Add tag filtering (like your reference code)
            if (tags.length > 0) {
                query = query.contains('tags', tags);
            }

            // Add timeout (like your reference code)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const { data, error } = await Promise.race([query, timeoutPromise]);

            if (error) {
                console.error('Error in tag search:', error);
                setError(`Failed to search by tags: ${error.message}`);
                return;
            }

            const matchingQuestions = data || [];
            setQuestions(matchingQuestions);

            // Load tags for the matching questions
            if (matchingQuestions.length > 0) {
                loadTagsForQuestions(matchingQuestions);
                // Update available tags from the loaded questions
                const questionTags = extractTagsFromQuestions(matchingQuestions);
                if (questionTags.length > 0) {
                    setAvailableTags(prev => [...new Set([...prev, ...questionTags])]);
                }
            }

            if (matchingQuestions.length === 0) {
                setError(`No questions found with tags: ${tags.join(', ')}`);
            }

        } catch (err) {
            console.error('Error searching by tags:', err);
            setError(`Failed to search by tags: ${err.message}`);
        } finally {
            setLoading(false);
            // Reset tag search flag after a longer delay to prevent conflicts
            setTimeout(() => {
                setIsTagSearchActive(false);
            }, 1000);
        }
    };



    // Handle popular tag click - set the tag and update URL
    const handlePopularTagClick = (tag) => {
        const newTags = [tag];
        setSearchTags(newTags);
        setSearchInput('');

        // Update URL with the new tag
        setSearchParams({ tags: newTags.join(',') });

        // Clear any previous results
        setQuestions([]);
        setSelectedQuestion(null);
        setError('');

        // Trigger search with the new tag
        handleTagSearch(newTags);
    };

    // Handle tag selection from autocomplete
    const handleTagSelection = (newTags) => {
        setSearchTags(newTags);

        // Update URL with the new tags
        if (newTags.length > 0) {
            setSearchParams({ tags: newTags.join(',') });
        } else {
            setSearchParams({});
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSelectedYear('');
        setSelectedPaper('');
        setSelectedQuestionNo('');
        setSearchTags([]);
        setSearchInput('');
        setQuestions([]);
        setSelectedQuestion(null);
        setQuestionTags({});
        setError('');
        setIsTagSearchActive(false);

        // Clear URL parameters
        setSearchParams({});
    };

    const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Math Papers', url: '/mathpaper' }
    ];

    const courseData = {
        name: 'DSE Math Past Papers',
        description: 'Comprehensive collection of DSE Mathematics past papers with detailed solutions and explanations for Hong Kong students'
    };

    // Safety check - don't render if component isn't mounted
    if (!componentMounted) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <SEOHead
                title="DSE Math Past Papers - Practice Questions & Solutions | TutorNote"
                description="Access comprehensive DSE Math past papers with detailed solutions. Practice with real exam questions, track your progress, and improve your mathematics skills for the Hong Kong DSE exam."
                keywords="DSE Math, Past Papers, Mathematics, Hong Kong, Exam Practice, Solutions, HKDSE, Secondary School, Math Questions"
                url="/mathpaper"
                structuredData={[
                    createCourseStructuredData(courseData),
                    createBreadcrumbStructuredData(breadcrumbs)
                ]}
            />
            <Box sx={{
                minHeight: '100vh',
                backgroundColor: '#ffffff',
                // Prevent vibration effects
                '& .MuiSelect-select': {
                    transition: 'none !important'
                },
                '& .MuiFormControl-root': {
                    transition: 'none !important'
                },
                '& .MuiInputBase-root': {
                    transition: 'none !important'
                },
                '& .MuiAutocomplete-root': {
                    transition: 'none !important'
                }
            }}>
                <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid', borderColor: '#dee2e6' }}>
                    <Toolbar>
                        <IconButton edge="start" color="primary" onClick={() => navigate('/')} sx={{ mr: 2 }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Math Past Papers
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {/* Breadcrumb */}
                    <Box sx={{ mb: 3 }}>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Home sx={{ mr: 0.5 }} fontSize="small" /> Home
                            </Link>
                            <Typography color="text.primary">Math Past Papers</Typography>
                        </Breadcrumbs>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <School sx={{ mr: 1 }} color="primary" />
                            Math Past Papers
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Filter and search through past mathematics examination papers
                        </Typography>
                        {/* Debug info for URL-based tag filtering */}
                        {searchTags.length > 0 && (
                            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Active Tags:</strong> {searchTags.join(', ')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>URL:</strong> {window.location.href}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Filter Section */}
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <FilterList sx={{ mr: 1 }} />
                            Filter Questions
                        </Typography>

                        <Grid container spacing={3} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="year-select-label">Year</InputLabel>
                                    <Select
                                        labelId="year-select-label"
                                        id="year-select"
                                        value={selectedYear}
                                        label="Year"
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 300
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="">All Years</MenuItem>
                                        {yearOptions.map((year) => (
                                            <MenuItem key={year} value={year}>{year}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="paper-select-label">Paper</InputLabel>
                                    <Select
                                        labelId="paper-select-label"
                                        id="paper-select"
                                        value={selectedPaper}
                                        label="Paper"
                                        onChange={(e) => {
                                            setSelectedPaper(e.target.value);
                                            setSelectedQuestionNo(''); // Reset question number when paper changes
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="">All Papers</MenuItem>
                                        {paperOptions.map((paper) => (
                                            <MenuItem key={paper} value={paper}>Paper {paper}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="question-select-label">Question Number</InputLabel>
                                    <Select
                                        labelId="question-select-label"
                                        id="question-select"
                                        value={selectedQuestionNo}
                                        label="Question Number"
                                        onChange={(e) => setSelectedQuestionNo(e.target.value)}
                                        disabled={!selectedPaper}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 300
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="">All Questions</MenuItem>
                                        {getQuestionNumberOptions(selectedPaper).map((num) => (
                                            <MenuItem key={num} value={num}>{num}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Autocomplete
                                    multiple
                                    options={availableTags}
                                    value={searchTags}
                                    onChange={(event, newValue) => handleTagSelection(newValue)}
                                    inputValue={searchInput}
                                    onInputChange={(event, newInputValue) => setSearchInput(newInputValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            id="tags-autocomplete"
                                            label="Search by tags"
                                            placeholder="Type to search tags..."
                                            helperText=""
                                            sx={{ minWidth: '200px' }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const { key, ...tagProps } = getTagProps({ index });
                                            return (
                                                <Chip
                                                    key={key}
                                                    label={option}
                                                    {...tagProps}
                                                    color="primary"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            );
                                        })
                                    }
                                    freeSolo
                                    filterOptions={(options, params) => {
                                        const filtered = options.filter(option =>
                                            option.toLowerCase().includes(params.inputValue.toLowerCase())
                                        );
                                        return filtered;
                                    }}
                                    ListboxProps={{
                                        style: {
                                            maxHeight: 200
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => {
                                        // If tags are selected, do tag search; otherwise do filter search
                                        if (searchTags.length > 0) {
                                            // Update URL with current tags
                                            setSearchParams({ tags: searchTags.join(',') });
                                            handleTagSearch();
                                        } else {
                                            // Clear URL parameters for regular filter search
                                            setSearchParams({});
                                            handleFilterSearch();
                                        }
                                    }}
                                    disabled={loading}
                                    sx={{ height: 56 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Search'}
                                </Button>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleClearFilters}
                                    disabled={loading}
                                    sx={{ height: 56 }}
                                >
                                    Clear
                                </Button>
                            </Grid>
                        </Grid>

                    </Paper>

                    {/* Popular Tags Section */}
                    {console.log('Rendering popular tags section, popularTags.length:', popularTags.length, 'popularTags:', popularTags)}
                    {popularTags.length > 0 && (
                        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
                            <Typography variant="h6" gutterBottom sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}>
                                <Search sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                                Popular Tags
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{
                                mb: 2,
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}>
                                Click on a tag to search for related questions
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: { xs: 0.5, sm: 1 }
                            }}>
                                {popularTags.map((tagData, index) => (
                                    <Chip
                                        key={index}
                                        label={`${tagData.tag} (${tagData.count})`}
                                        onClick={() => handlePopularTagClick(tagData.tag)}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            cursor: 'pointer',
                                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                            height: { xs: '24px', sm: '32px' },
                                            '& .MuiChip-label': {
                                                px: { xs: 1, sm: 1.5 }
                                            },
                                            '&:hover': {
                                                backgroundColor: 'primary.main',
                                                color: 'white'
                                            },
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    />
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Results Section */}
                    {questions.length > 0 && !selectedQuestion && (
                        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" gutterBottom sx={{
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}>
                                Results ({questions.length} questions found)
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {questions.map((question, index) => (
                                    <Box
                                        key={question.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: { xs: 'flex-start', sm: 'center' },
                                            p: { xs: 1.5, sm: 2 },
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: { xs: 1, sm: 0 },
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                                borderColor: 'primary.main'
                                            },
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                        onClick={() => {
                                            setSelectedQuestion(question);
                                            // Load tags for the selected question if not already loaded
                                            if (!questionTags[question.id]) {
                                                const tags = getQuestionTagsFromData(question);
                                                setQuestionTags(prev => ({
                                                    ...prev,
                                                    [question.id]: tags
                                                }));
                                            }
                                            trackMathPaperEvent('question_clicked', question.year, question.paper, question.question_no);
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: { xs: 'flex-start', sm: 'center' },
                                                gap: { xs: 1, sm: 2 },
                                                flexDirection: { xs: 'column', sm: 'row' }
                                            }}>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 'bold',
                                                    minWidth: { xs: 'auto', sm: 60 },
                                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                                }}>
                                                    #{index + 1}
                                                </Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: { xs: 0.5, sm: 1 },
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <Chip
                                                        label={`Year ${question.year}`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#87ceeb',
                                                            color: '#ffffff',
                                                            fontWeight: 'bold',
                                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                            height: { xs: '20px', sm: '24px' }
                                                        }}
                                                    />
                                                    <Chip
                                                        label={`Paper ${question.paper}`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#ffa500',
                                                            color: '#ffffff',
                                                            fontWeight: 'bold',
                                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                            height: { xs: '20px', sm: '24px' }
                                                        }}
                                                    />
                                                    <Chip
                                                        label={`Q${question.question_no}`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#6c757d',
                                                            color: '#ffffff',
                                                            fontWeight: 'bold',
                                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                            height: { xs: '20px', sm: '24px' }
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            {/* Display tags for this question */}
                                            {questionTags[question.id] && questionTags[question.id].length > 0 && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: { xs: 0.3, sm: 0.5 },
                                                    ml: { xs: 0, sm: 7 },
                                                    mt: { xs: 1, sm: 0 }
                                                }}>
                                                    {questionTags[question.id].map((tagData, tagIndex) => (
                                                        <Chip
                                                            key={tagIndex}
                                                            label={tagData.tag}
                                                            size="small"
                                                            variant="outlined"
                                                            color="secondary"
                                                            sx={{
                                                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                                                height: { xs: '18px', sm: '20px' },
                                                                '& .MuiChip-label': {
                                                                    px: { xs: 0.5, sm: 1 }
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedQuestion(question);
                                                // Load tags for the selected question if not already loaded
                                                if (!questionTags[question.id]) {
                                                    const tags = getQuestionTagsFromData(question);
                                                    setQuestionTags(prev => ({
                                                        ...prev,
                                                        [question.id]: tags
                                                    }));
                                                }
                                            }}
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                minWidth: { xs: '60px', sm: 'auto' },
                                                alignSelf: { xs: 'flex-end', sm: 'auto' }
                                            }}
                                        >
                                            View
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* Question Display Section */}
                    {selectedQuestion && (
                        <Box ref={questionDetailsRef} sx={{ mt: 4 }}>
                            {questions.length > 1 && (
                                <Box sx={{ mb: 3 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBack />}
                                        onClick={() => setSelectedQuestion(null)}
                                    >
                                        Back to Results ({questions.length} questions)
                                    </Button>
                                </Box>
                            )}
                            <QuestionDisplay
                                question={selectedQuestion}
                                questionTags={questionTags[selectedQuestion.id] || []}
                                onTagClick={handlePopularTagClick}
                            />

                            {/* Discussion Section */}
                            <Box sx={{ mt: 4 }}>
                                <DiscussionSection questionId={selectedQuestion.id} />
                            </Box>
                        </Box>
                    )}

                    {/* No Results Message */}
                    {!loading && questions.length === 0 && !selectedQuestion && (selectedYear || selectedPaper || selectedQuestionNo || searchTags.length > 0) && (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No questions found matching your criteria
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Try adjusting your filters or search terms
                            </Typography>
                        </Paper>
                    )}
                </Container>
            </Box>
        </>
    );
};

export default MathPaperPage;