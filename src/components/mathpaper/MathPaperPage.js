import React, { useState, useEffect } from 'react';
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
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import QuestionDisplay from './QuestionDisplay';

const MathPaperPage = () => {
    const navigate = useNavigate();
    const questionDetailsRef = React.useRef(null);



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

    // Fetch available tags from Supabase
    useEffect(() => {
        const fetchAvailableTags = async () => {
            try {
                const { data, error } = await supabase
                    .rpc('get_all_tags');

                if (error) {
                    console.error('Error fetching tags:', error);
                    setError('Failed to load available tags');
                } else {
                    setAvailableTags(data || []);
                }
            } catch (err) {
                console.error('Error fetching tags:', err);
                setError('Failed to load available tags');
            }
        };

        fetchAvailableTags();
    }, []);

    // Handle filter search
    const handleFilterSearch = async () => {
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase
                .rpc('filter_math_papers_by_year_paper', {
                    filter_year: selectedYear || null,
                    filter_paper: selectedPaper || null
                });

            if (error) {
                console.error('Error fetching questions:', error);
                setError('Failed to fetch questions');
            } else {
                // Filter by question number if selected
                let filteredData = data || [];
                if (selectedQuestionNo) {
                    filteredData = filteredData.filter(q => q.question_no === parseInt(selectedQuestionNo));
                }

                setQuestions(filteredData);
                console.log('Filtered questions:', filteredData);

                // If exactly one result and all three filters are specified, show details directly
                if (filteredData.length === 1 && selectedYear && selectedPaper && selectedQuestionNo) {
                    setSelectedQuestion(filteredData[0]);
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
            }
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError('Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    // Handle tag search
    const handleTagSearch = async () => {
        if (searchTags.length === 0) return;

        setLoading(true);
        setError('');

        try {
            // Search for each tag and combine results
            const allResults = [];

            for (const tag of searchTags) {
                const { data, error } = await supabase
                    .rpc('search_math_papers_by_keyword', {
                        search_term: tag
                    });

                if (error) {
                    console.error(`Error searching for tag "${tag}":`, error);
                } else {
                    allResults.push(...(data || []));
                }
            }

            // Remove duplicates based on id
            const uniqueResults = allResults.filter((question, index, self) =>
                index === self.findIndex(q => q.id === question.id)
            );

            setQuestions(uniqueResults);
            console.log('Tag search results:', uniqueResults);
        } catch (err) {
            console.error('Error searching by tags:', err);
            setError('Failed to search by tags');
        } finally {
            setLoading(false);
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
        setError('');
    };

    return (
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
                </Box>

                {/* Filter Section */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <FilterList sx={{ mr: 1 }} />
                        Filter Questions
                    </Typography>

                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Year</InputLabel>
                                <Select
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

                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Paper</InputLabel>
                                <Select
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

                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Question Number</InputLabel>
                                <Select
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

                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                multiple
                                options={availableTags}
                                value={searchTags}
                                onChange={(event, newValue) => setSearchTags(newValue)}
                                inputValue={searchInput}
                                onInputChange={(event, newInputValue) => setSearchInput(newInputValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search by tags"
                                        placeholder="Type to search tags..."
                                        helperText=""
                                        sx={{ minWidth: '200px' }}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option}
                                            {...getTagProps({ index })}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    ))
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

                        <Grid item xs={12} sm={6} md={1}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleFilterSearch}
                                disabled={loading}
                                sx={{ height: 56 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Search'}
                            </Button>
                        </Grid>

                        <Grid item xs={12} sm={6} md={1}>
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

                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleTagSearch}
                            disabled={loading || searchTags.length === 0}
                            startIcon={<Search />}
                        >
                            Search Tags
                        </Button>
                    </Box>
                </Paper>

                {/* Error Display */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Results Section */}
                {questions.length > 0 && !selectedQuestion && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Results ({questions.length} questions found)
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {questions.map((question, index) => (
                                <Box
                                    key={question.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            borderColor: 'primary.main'
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                    onClick={() => setSelectedQuestion(question)}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                                            #{index + 1}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                label={`Year ${question.year}`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#87ceeb',
                                                    color: '#ffffff',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <Chip
                                                label={`Paper ${question.paper}`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#ffa500',
                                                    color: '#ffffff',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <Chip
                                                label={`Q${question.question_no}`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#6c757d',
                                                    color: '#ffffff',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Visibility />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedQuestion(question);
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
                        <QuestionDisplay question={selectedQuestion} />
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
    );
};

export default MathPaperPage;