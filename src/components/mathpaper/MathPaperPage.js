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
    Breadcrumbs,
    Link,
    Pagination
} from '@mui/material';
import 'katex/dist/katex.min.css';
import {
    Search,
    FilterList,
    School,
    Home,
    Visibility
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink, useSearchParams, useParams } from 'react-router-dom';
import QuestionDisplay from './QuestionDisplay';
import { DiscussionSection } from '../discussion';
import SEOHead from '../common/SEOHead';
import { createCourseStructuredData, createBreadcrumbStructuredData } from '../../utils/structuredData';
import { trackMathPaperEvent } from '../../utils/analytics';
import { UnifiedURLService, UnifiedQuestionService, UnifiedTagService } from '../../services/mathpaper';
import { supabase } from '../../services/supabase';
import { useMathPaper } from '../../store/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import {
    setSelectedYear,
    setSelectedPaper,
    setSelectedQuestionNo,
    setSearchTags,
    setSearchInput,
    setSelectedQuestion,
    setQuestions,
    setQuestionTags,
    setCameFromTagSearch,
    setOriginalSearchTags,
    setOriginalSearchPage,
    setIsTagSearchActive,
    setCurrentPage,
    setTotalPages,
    setTotalQuestions,
    // clearSearch,
    clearError,
    setLoading,
    setAvailableTags,
    // setPopularTags,
    setQuestionsCache,
    setTagsCache,
    loadPopularTags as loadPopularTagsThunk,
    loadPopularTagsChinese as loadPopularTagsChineseThunk,
    translateTags as translateTagsThunk,
    loadQuestionsByFilters
} from '../../store/slices/mathPaperSlice';

const MathPaperPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const params = useParams(); // Get URL parameters for direct question access
    const questionDetailsRef = React.useRef(null);

    // Translation hook
    const { t, isChinese } = useTranslation();

    // Redux state and dispatch
    const {
        selectedYear,
        selectedPaper,
        selectedQuestionNo,
        searchTags,
        availableTags,
        searchInput,
        questions,
        selectedQuestion,
        loading,
        error,
        questionTags,
        popularTags,
        popularTagsChinese,
        isTagSearchActive,
        cameFromTagSearch,
        originalSearchTags,
        originalSearchPage,
        currentPage,
        totalPages,
        totalQuestions,
        dispatch
    } = useMathPaper();


    // Add component mount tracking to prevent infinite loops
    const [componentMounted, setComponentMounted] = useState(false);
    const tagsLoadedRef = useRef(false);
    const previousLanguageRef = useRef(null);
    const [isFilterSearching, setIsFilterSearching] = useState(false);
    const [pageSize] = useState(10); // Fixed at 10 items per page

    useEffect(() => {
        setComponentMounted(true);
        // Scroll to top on component mount
        window.scrollTo(0, 0);
        // Reset search input on component mount to prevent autocomplete from retaining previous values
        dispatch(setSearchInput(''));
        // Initialize the previous language ref
        previousLanguageRef.current = isChinese() ? 'zh' : 'en';
        return () => {
            setComponentMounted(false);
        };
    }, [dispatch, isChinese]);


    // Convert question tags array to the format expected by the UI
    const getQuestionTagsFromData = useCallback((question) => {
        if (!question) {
            return [];
        }

        // Use Chinese tags when in Chinese mode, otherwise use English tags
        const tagsArray = isChinese() ? question.tags_ch : question.tags;

        if (!tagsArray || !Array.isArray(tagsArray)) {
            return [];
        }

        // Convert array of tag strings to objects with topic and tag properties
        return tagsArray.map(tag => ({
            topic: 'General', // Default topic since we don't have topic info in the tags array
            tag: tag
        }));
    }, [isChinese]);

    // Extract unique tags from all questions for autocomplete
    const extractTagsFromQuestions = useCallback((questionsList) => {
        const allTags = new Set();
        questionsList.forEach(question => {
            // Use Chinese tags when in Chinese mode, otherwise use English tags
            const tagsArray = isChinese() ? question.tags_ch : question.tags;
            if (tagsArray && Array.isArray(tagsArray)) {
                tagsArray.forEach(tag => allTags.add(tag));
            }
        });
        return Array.from(allTags);
    }, [isChinese]);

    // Load tags for all questions in the current results
    const loadTagsForQuestions = useCallback(async (questionsList) => {
        const tagsMap = {};
        for (const question of questionsList) {
            const tags = getQuestionTagsFromData(question);
            tagsMap[question.id] = tags;
        }
        dispatch(setQuestionTags(tagsMap));
    }, [getQuestionTagsFromData]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load a specific question by year, paper, and question number
    const loadSpecificQuestion = useCallback(async (year, paper, questionNo) => {
        dispatch(setLoading(true));
        dispatch(clearError());

        try {
            console.log(`🔍 Loading specific question: ${year} Paper ${paper} Question ${questionNo}`);

            // Check if user came from a tag search using multiple methods
            const referrer = document.referrer;
            const isFromTagSearchReferrer = referrer && referrer.includes('/DSE_Math?tags=');

            // Check URL parameters for navigation state (most reliable)
            const urlFromTagSearch = searchParams.get('fromTagSearch');
            const urlTags = searchParams.get('tags');
            const urlPage = searchParams.get('page');
            let isFromTagSearchURL = false;
            let urlTagsArray = [];
            let urlPageNum = 1;

            if (urlFromTagSearch === 'true' && urlTags) {
                isFromTagSearchURL = true;
                urlTagsArray = urlTags.split(',').filter(tag => tag.trim());
                urlPageNum = urlPage ? parseInt(urlPage, 10) : 1;
                console.log('🔍 Found navigation state in URL parameters:', { tags: urlTagsArray, page: urlPageNum });
            } else {
            }

            // Also check sessionStorage for navigation state
            const storedNavState = sessionStorage.getItem('tutornotes_navigation_state');
            let isFromTagSearchStorage = false;
            let storedTags = [];
            let storedPage = 1;

            if (storedNavState) {
                try {
                    const navState = JSON.parse(storedNavState);
                    // Check if the navigation state is recent (within last 30 seconds)
                    const isRecent = navState.timestamp && (Date.now() - navState.timestamp) < 30000;
                    if (navState.fromTagSearch && navState.tags && navState.tags.length > 0 && isRecent) {
                        isFromTagSearchStorage = true;
                        storedTags = navState.tags;
                        storedPage = navState.page || 1;
                        console.log('🔍 Found recent navigation state in sessionStorage:', navState);
                    } else if (navState.timestamp) {
                        console.log('🔍 Found old navigation state in sessionStorage (ignoring):', navState);
                    }
                } catch (err) {
                    console.warn('Could not parse navigation state from sessionStorage:', err);
                }
            }

            if (isFromTagSearchURL) {
                // Use URL parameters data (most reliable)
                dispatch(setOriginalSearchTags(urlTagsArray));
                dispatch(setOriginalSearchPage(urlPageNum));
                dispatch(setCameFromTagSearch(true));
                console.log('✅ Set navigation state from URL parameters:', { tags: urlTagsArray, page: urlPageNum });
            } else if (isFromTagSearchStorage) {
                // Use sessionStorage data (fallback)
                dispatch(setOriginalSearchTags(storedTags));
                dispatch(setOriginalSearchPage(storedPage));
                dispatch(setCameFromTagSearch(true));
                console.log('✅ Set navigation state from sessionStorage:', { tags: storedTags, page: storedPage });
            } else if (isFromTagSearchReferrer) {
                // Fallback to referrer parsing
                console.log('🔍 User came from tag search, referrer:', referrer);
                try {
                    const referrerURL = new URL(referrer);
                    const tagsParam = referrerURL.searchParams.get('tags');
                    const pageParam = referrerURL.searchParams.get('page');

                    if (tagsParam) {
                        const tagsArray = tagsParam.split(',').filter(tag => tag.trim());
                        dispatch(setOriginalSearchTags(tagsArray));
                        dispatch(setOriginalSearchPage(pageParam ? parseInt(pageParam, 10) : 1));
                        dispatch(setCameFromTagSearch(true));
                        console.log('✅ Set navigation state from referrer:', { tags: tagsArray, page: pageParam });
                    }
                } catch (err) {
                    console.warn('Could not parse referrer URL:', err);
                }
            } else {
                // Reset navigation state if not from tag search
                console.log('🔍 No tag search navigation state found. Referrer:', referrer, 'SessionStorage:', storedNavState, 'URL params:', { fromTagSearch: urlFromTagSearch, tags: urlTags, page: urlPage });
                dispatch(setCameFromTagSearch(false));
                dispatch(setOriginalSearchTags([]));
                dispatch(setOriginalSearchPage(1));
            }

            const result = await UnifiedQuestionService.loadQuestion(year, paper, questionNo);

            if (result.error) {
                console.error('Error loading specific question:', result.error);
                dispatch(clearError());
                dispatch(setSelectedQuestion(null));
                dispatch(setQuestions([]));
                return;
            }

            if (result.data) {
                dispatch(setSelectedQuestion(result.data));
                dispatch(setQuestions([result.data])); // Show single question in results

                // Load tags for the question
                const tags = getQuestionTagsFromData(result.data);
                dispatch(setQuestionTags({ [result.data.id]: tags }));

                // Track the question view
                trackMathPaperEvent('question_viewed', year, paper, questionNo);

                // Scroll to question details after a short delay
                setTimeout(() => {
                    questionDetailsRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);

                console.log(`✅ Successfully loaded question: ${result.data.id}`);
            } else {
                dispatch(clearError());
                dispatch(setSelectedQuestion(null));
                dispatch(setQuestions([]));
            }

        } catch (err) {
            console.error('Unexpected error loading specific question:', err);
            dispatch(clearError());
            dispatch(setSelectedQuestion(null));
            dispatch(setQuestions([]));
        } finally {
            dispatch(setLoading(false));
        }
    }, [getQuestionTagsFromData, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle tag search from URL parameters (simplified like your reference code)
    const handleTagSearchFromURL = useCallback(async (tags, page = 1) => {
        console.log('🔍 handleTagSearchFromURL called with tags:', tags, 'page:', page, 'isChinese:', isChinese());

        if (tags.length === 0) return;

        // Clear any existing navigation state when starting a new tag search from URL
        sessionStorage.removeItem('tutornotes_navigation_state');
        setCameFromTagSearch(false);
        setOriginalSearchTags([]);
        setOriginalSearchPage(1);

        setIsTagSearchActive(true);
        dispatch(setLoading(true));
        dispatch(clearError());

        try {
            console.log('Searching for tags from URL:', tags, 'Page:', page, 'Language:', isChinese() ? 'Chinese' : 'English');

            if (isChinese()) {
                // Use Chinese tag search with Supabase function
                console.log('🔍 Using Chinese tag search function for URL');

                const result = await UnifiedTagService.searchByChineseTagsPaginated(tags, page, pageSize);

                if (result.error) {
                    console.error('Error in Chinese tag search from URL:', result.error);
                    dispatch(clearError(`Failed to search by Chinese tags: ${result.error.message}`));
                    return;
                }

                const searchResult = result.data;
                const matchingQuestions = searchResult.questions || [];
                const totalQuestions = searchResult.total_count || 0;
                const totalPages = searchResult.total_pages || 0;

                dispatch(setQuestions(matchingQuestions));
                dispatch(setTotalQuestions(totalQuestions));
                dispatch(setTotalPages(totalPages));

                // Load tags for the matching questions
                if (matchingQuestions.length > 0) {
                    loadTagsForQuestions(matchingQuestions);
                    // Update available tags from the loaded questions
                    const questionTags = extractTagsFromQuestions(matchingQuestions);
                    if (questionTags.length > 0) {
                        const currentAvailableTags = availableTags;
                        const newAvailableTags = [...new Set([...currentAvailableTags, ...questionTags])];
                        dispatch(setAvailableTags(newAvailableTags));
                    }
                }

                if (matchingQuestions.length === 0 && totalQuestions === 0) {
                    dispatch(clearError(`No questions found with Chinese tags: ${tags.join(', ')}`));
                }

                // If exactly one result, navigate directly to the question detail page
                if (totalQuestions === 1 && matchingQuestions.length === 1) {
                    const question = matchingQuestions[0];

                    // Store navigation state for single result navigation
                    if (tags.length > 0) {
                        const navState = {
                            fromTagSearch: true,
                            tags: tags,
                            page: page,
                            timestamp: Date.now()
                        };
                        sessionStorage.setItem('tutornotes_navigation_state', JSON.stringify(navState));
                        console.log('✅ Stored navigation state for single result navigation:', navState);
                    }

                    const questionURL = UnifiedURLService.generateQuestionURL(question.year, question.paper, question.question_no);
                    navigate(questionURL);
                    return; // Exit early since we're navigating away
                }
            } else {
                // Use English tag search (existing logic)
                console.log('🔍 Using English tag search for URL');

                // Calculate offset for pagination
                const offset = (page - 1) * pageSize;

                // First, get the total count
                let countQuery = supabase
                    .from('Math_Past_Paper')
                    .select('*', { count: 'exact', head: true });

                if (tags.length > 0) {
                    countQuery = countQuery.contains('tags', tags);
                }

                const { count, error: countError } = await countQuery;

                if (countError) {
                    console.error('Error getting count:', countError);
                    dispatch(clearError(`Failed to get results count: ${countError.message}`));
                    return;
                }

                const totalQuestions = count || 0;
                dispatch(setTotalQuestions(totalQuestions));
                setTotalPages(Math.ceil(totalQuestions / pageSize));

                // Now get the paginated data
                let query = supabase
                    .from('Math_Past_Paper')
                    .select('*')
                    .order('year', { ascending: false })
                    .order('question_no', { ascending: true })
                    .range(offset, offset + pageSize - 1);

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
                    dispatch(clearError(`Failed to search by tags: ${error.message}`));
                    return;
                }

                const matchingQuestions = data || [];
                dispatch(setQuestions(matchingQuestions));

                // Load tags for the matching questions
                if (matchingQuestions.length > 0) {
                    loadTagsForQuestions(matchingQuestions);
                    // Update available tags from the loaded questions
                    const questionTags = extractTagsFromQuestions(matchingQuestions);
                    if (questionTags.length > 0) {
                        const currentAvailableTags = availableTags;
                        const newAvailableTags = [...new Set([...currentAvailableTags, ...questionTags])];
                        dispatch(setAvailableTags(newAvailableTags));
                    }
                }

                if (matchingQuestions.length === 0 && totalQuestions === 0) {
                    dispatch(clearError(`No questions found with tags: ${tags.join(', ')}`));
                }

                // If exactly one result, navigate directly to the question detail page
                if (totalQuestions === 1 && matchingQuestions.length === 1) {
                    const question = matchingQuestions[0];

                    // Store navigation state for single result navigation
                    if (tags.length > 0) {
                        const navState = {
                            fromTagSearch: true,
                            tags: tags,
                            page: page,
                            timestamp: Date.now()
                        };
                        sessionStorage.setItem('tutornotes_navigation_state', JSON.stringify(navState));
                        console.log('✅ Stored navigation state for single result navigation:', navState);
                    }

                    const questionURL = UnifiedURLService.generateQuestionURL(question.year, question.paper, question.question_no);
                    navigate(questionURL);
                    return; // Exit early since we're navigating away
                }
            }

        } catch (err) {
            console.error('Error searching by tags from URL:', err);
            dispatch(clearError(`Failed to search by tags: ${err.message}`));
        } finally {
            dispatch(setLoading(false));
            setTimeout(() => {
                setIsTagSearchActive(false);
            }, 1000);
        }
    }, [loadTagsForQuestions, extractTagsFromQuestions, pageSize, navigate, isChinese]); // eslint-disable-line react-hooks/exhaustive-deps

    // Clear URL parameters and reset to general search
    const clearURLParams = useCallback(() => {
        navigate('/DSE_Math', { replace: true });
    }, [navigate]);

    // Update URL parameters with pagination
    const updateURLWithPagination = useCallback((tags, page = 1) => {
        const params = new URLSearchParams();
        if (tags && tags.length > 0) {
            params.set('tags', tags.join(','));
        }
        if (page > 1) {
            params.set('page', page.toString());
        }

        // Use navigate to ensure we're on the correct path (/DSE_Math)
        const searchString = params.toString();
        const newURL = searchString ? `/DSE_Math?${searchString}` : '/DSE_Math';
        navigate(newURL, { replace: true });
    }, [navigate]);


    // Initialize state from URL parameters
    useEffect(() => {
        console.log('🔍 URL useEffect triggered - searchParams:', searchParams.toString(), 'params:', params, 'isFilterSearching:', isFilterSearching);

        // Skip if we're in the middle of a filter search
        if (isFilterSearching) {
            console.log('🔍 Skipping URL useEffect - filter search in progress');
            return;
        }

        // Check if this is a direct question URL
        const questionParams = UnifiedURLService.getQuestionParamsFromRouter(params);

        if (questionParams) {
            // Direct question URL - load specific question
            console.log('✅ Direct question URL detected:', questionParams);
            loadSpecificQuestion(questionParams.year, questionParams.paper, questionParams.questionNo);
        } else {
            // Regular tag-based or filter-based search
            // Clear selectedQuestion since we're not on a direct question URL
            dispatch(setSelectedQuestion(null));

            const urlTags = searchParams.get('tags');
            const urlPage = searchParams.get('page');

            // Set pagination from URL (default to page 1 if not specified)
            const pageFromURL = urlPage ? parseInt(urlPage, 10) : 1;
            dispatch(setCurrentPage(pageFromURL));

            if (urlTags) {
                const tagsArray = urlTags.split(',').filter(tag => tag.trim());
                dispatch(setSearchTags(tagsArray));
                // Clear search input when loading from URL to prevent autocomplete from showing the tag value
                dispatch(setSearchInput(''));
                // Automatically trigger tag search if tags are in URL
                if (tagsArray.length > 0) {
                    console.log('🔄 Triggering tag search from URL:', tagsArray);
                    handleTagSearchFromURL(tagsArray, pageFromURL);
                }
            } else {
                // Clear tags if no URL parameters, but only if we're not in the middle of a filter search
                const hasActiveFilters = selectedYear || selectedPaper || selectedQuestionNo;
                if (!hasActiveFilters) {
                    console.log('🧹 Clearing search state - no URL parameters and no active filters');
                    dispatch(setSearchTags([]));
                    dispatch(setSearchInput(''));
                    dispatch(setQuestions([]));
                    dispatch(setSelectedQuestion(null));
                    dispatch(clearError());
                    dispatch(setLoading(false));
                    dispatch(setTotalQuestions(0));
                    dispatch(setTotalPages(0));
                } else {
                    console.log('🔍 Skipping clear - active filter search detected');
                }
            }
        }
        // Scroll to top when URL parameters change
        window.scrollTo(0, 0);
    }, [searchParams, params, isFilterSearching, loadSpecificQuestion, handleTagSearchFromURL, dispatch, selectedYear, selectedPaper, selectedQuestionNo]); // Added all dependencies to prevent infinite loops



    // All state is now managed by Redux

    // Handle going back to tag search results
    const handleBackToTagSearch = useCallback(() => {
        console.log('🔍 handleBackToTagSearch called with state:', {
            cameFromTagSearch,
            originalSearchTags,
            originalSearchPage
        });

        if (cameFromTagSearch && originalSearchTags.length > 0) {
            // Clear the navigation state since we're going back
            sessionStorage.removeItem('tutornotes_navigation_state');

            const params = new URLSearchParams();
            params.set('tags', originalSearchTags.join(','));
            if (originalSearchPage > 1) {
                params.set('page', originalSearchPage.toString());
            }
            const backURL = `/DSE_Math?${params.toString()}`;
            console.log('🔍 Navigating back to:', backURL);
            navigate(backURL);
        } else {
            console.log('🔍 Back navigation conditions not met:', {
                cameFromTagSearch,
                originalSearchTagsLength: originalSearchTags.length
            });
        }
    }, [cameFromTagSearch, originalSearchTags, originalSearchPage, navigate]);

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
            if (isChinese()) {
                // Use Chinese autocomplete for Chinese mode
                const { data, error } = await UnifiedTagService.searchChineseTagsAutocomplete('', 100);
                if (error) {
                    console.error('Error loading Chinese tags:', error);
                    dispatch(setAvailableTags(getSampleAvailableTags()));
                    return;
                }
                // Convert to simple array format for autocomplete
                const chineseTags = (data || []).map(tagData => tagData.tag);
                dispatch(setAvailableTags(chineseTags));
            } else {
                // Get all questions to extract their tags for English mode
                const { data: allQuestions, error } = await supabase
                    .from('Math_Past_Paper')
                    .select('tags')
                    .not('tags', 'is', null);

                if (error) {
                    console.error('Error loading questions for tags:', error);
                    // Fallback to sample tags
                    dispatch(setAvailableTags(getSampleAvailableTags()));
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
                    dispatch(setAvailableTags(getSampleAvailableTags()));
                } else {
                    dispatch(setAvailableTags(uniqueTags));
                }
            }
        } catch (err) {
            console.error('Error loading tags:', err);
            // For testing, use sample tags
            dispatch(setAvailableTags(getSampleAvailableTags()));
        }
    }, [dispatch, isChinese, getSampleAvailableTags]); // eslint-disable-line react-hooks/exhaustive-deps


    // Sample popular tags for testing
    // const getSamplePopularTags = useCallback(() => {
    //     // Function removed to fix build errors
    // }, []);

    // Shuffle array function for randomizing popular tags
    // const shuffleArray = (array) => {
    //     // Function removed to fix build errors
    // };

    // Load popular tags using direct query with accurate counting
    // const loadPopularTags = useCallback(async () => {
    //     // Function removed to fix build errors
    // }, []);

    // Load available tags from database
    useEffect(() => {
        if (!tagsLoadedRef.current) {
            tagsLoadedRef.current = true;
            loadAvailableTags();
            // Dispatch the appropriate popular tags thunk based on language
            if (isChinese()) {
                dispatch(loadPopularTagsChineseThunk());
            } else {
                dispatch(loadPopularTagsThunk());
            }
        }
    }, [loadAvailableTags, dispatch, isChinese]);

    // Reload popular tags when language changes
    useEffect(() => {
        if (tagsLoadedRef.current) {
            if (isChinese()) {
                dispatch(loadPopularTagsChineseThunk());
            } else {
                dispatch(loadPopularTagsThunk());
            }
        }
    }, [isChinese, dispatch]);

    // Clear search field when language changes
    useEffect(() => {
        const currentLanguage = isChinese() ? 'zh' : 'en';
        const previousLanguage = previousLanguageRef.current;

        console.log('🔄 Language change effect triggered:', {
            currentLanguage,
            previousLanguage,
            searchTagsLength: searchTags.length
        });

        // Clear search if language actually changed and we have search tags
        if (searchTags.length > 0 && previousLanguage !== null && currentLanguage !== previousLanguage) {
            console.log('🔄 Language changed, calling handleClearFilters');
            handleClearFilters();
        }

        // Update the previous language ref
        previousLanguageRef.current = currentLanguage;
    }, [isChinese, dispatch]);

    // Debug: Monitor search tags changes
    useEffect(() => {
        console.log('🔍 Search tags changed:', searchTags);
    }, [searchTags]);

    // Debug: Monitor questions state changes
    // useEffect(() => {
    //     console.log('Questions state changed to:', questions.length, 'questions');
    //     if (questions.length > 0) {
    //         console.log('First question:', questions[0]);
    //     }
    // }, [questions]);




    // Handle filter search (simplified like your reference code)
    const handleFilterSearch = useCallback(async (page = 1) => {
        console.log('🔍 handleFilterSearch called with page:', page);

        // Don't run filter search if we're doing a tag search
        if (isTagSearchActive) {
            console.log('Skipping handleFilterSearch because tag search is active');
            return;
        }

        setIsFilterSearching(true);
        dispatch(setLoading(true));
        dispatch(clearError());
        setIsTagSearchActive(false);

        try {
            console.log('Fetching questions with filters:', { selectedYear, selectedPaper, selectedQuestionNo, page });

            // Use the Redux thunk instead of direct Supabase queries
            const result = await dispatch(loadQuestionsByFilters({
                year: selectedYear,
                paper: selectedPaper,
                questionNo: selectedQuestionNo
            })).unwrap();

            console.log('🔍 Filter search results:', result);
            console.log('🔍 Current Redux questions state:', questions);
            console.log('🔍 Current Redux totalQuestions state:', totalQuestions);

            // If exactly one result, navigate directly to the question detail page
            if (result && result.length === 1) {
                const question = result[0];
                console.log('🔍 Single result found, navigating to question:', question);
                const questionURL = UnifiedURLService.generateQuestionURL(question.year, question.paper, question.question_no);
                navigate(questionURL);
                return; // Exit early since we're navigating away
            }

        } catch (err) {
            console.error('Error fetching questions:', err);
            dispatch(clearError(`Failed to fetch questions: ${err.message}`));
        } finally {
            dispatch(setLoading(false));
            setIsFilterSearching(false);
        }
    }, [isTagSearchActive, selectedYear, selectedPaper, selectedQuestionNo, pageSize, loadTagsForQuestions, extractTagsFromQuestions, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle tag search (simplified like your reference code)
    const handleTagSearch = useCallback(async (tagsToSearch = null) => {
        const tags = tagsToSearch || searchTags;
        console.log('🔍 handleTagSearch called with tags:', tags, 'isChinese:', isChinese());

        if (tags.length === 0) return;

        // Clear any existing navigation state when starting a new tag search
        sessionStorage.removeItem('tutornotes_navigation_state');
        setCameFromTagSearch(false);
        setOriginalSearchTags([]);
        setOriginalSearchPage(1);

        // Reset to page 1 for new tag search
        dispatch(setCurrentPage(1));
        updateURLWithPagination(tags, 1);

        setIsTagSearchActive(true);
        dispatch(setLoading(true));
        dispatch(clearError());

        try {
            console.log('Searching for tags:', tags, 'Language:', isChinese() ? 'Chinese' : 'English');

            // Calculate offset for pagination (always page 1 for new search)
            const offset = 0;

            if (isChinese()) {
                // Use Chinese tag search with Supabase function
                console.log('🔍 Using Chinese tag search function');

                // Use the Chinese paginated search function
                const result = await UnifiedTagService.searchByChineseTagsPaginated(tags, 1, pageSize);

                if (result.error) {
                    console.error('Error in Chinese tag search:', result.error);
                    dispatch(clearError(`Failed to search by Chinese tags: ${result.error.message}`));
                    return;
                }

                const searchResult = result.data;
                const matchingQuestions = searchResult.questions || [];
                const totalQuestions = searchResult.total_count || 0;
                const totalPages = searchResult.total_pages || 0;

                dispatch(setQuestions(matchingQuestions));
                dispatch(setTotalQuestions(totalQuestions));
                dispatch(setTotalPages(totalPages));

                // Load tags for the matching questions
                if (matchingQuestions.length > 0) {
                    loadTagsForQuestions(matchingQuestions);
                    // Update available tags from the loaded questions
                    const questionTags = extractTagsFromQuestions(matchingQuestions);
                    if (questionTags.length > 0) {
                        const currentAvailableTags = availableTags;
                        const newAvailableTags = [...new Set([...currentAvailableTags, ...questionTags])];
                        dispatch(setAvailableTags(newAvailableTags));
                    }
                }

                if (matchingQuestions.length === 0 && totalQuestions === 0) {
                    dispatch(clearError(`No questions found with Chinese tags: ${tags.join(', ')}`));
                }

                // If exactly one result, navigate directly to the question detail page
                if (totalQuestions === 1 && matchingQuestions.length === 1) {
                    const question = matchingQuestions[0];

                    // Store navigation state for single result navigation
                    if (tags.length > 0) {
                        const navState = {
                            fromTagSearch: true,
                            tags: tags,
                            page: 1, // Tag search always starts from page 1
                            timestamp: Date.now()
                        };
                        sessionStorage.setItem('tutornotes_navigation_state', JSON.stringify(navState));
                        console.log('✅ Stored navigation state for single result navigation:', navState);
                    }

                    const questionURL = UnifiedURLService.generateQuestionURL(question.year, question.paper, question.question_no);
                    navigate(questionURL);
                    return; // Exit early since we're navigating away
                }
            } else {
                // Use English tag search (existing logic)
                console.log('🔍 Using English tag search');

                // First, get the total count
                let countQuery = supabase
                    .from('Math_Past_Paper')
                    .select('*', { count: 'exact', head: true });

                if (tags.length > 0) {
                    countQuery = countQuery.contains('tags', tags);
                }

                const { count, error: countError } = await countQuery;

                if (countError) {
                    console.error('Error getting count:', countError);
                    dispatch(clearError(`Failed to get results count: ${countError.message}`));
                    return;
                }

                const totalQuestions = count || 0;
                dispatch(setTotalQuestions(totalQuestions));
                setTotalPages(Math.ceil(totalQuestions / pageSize));

                // Now get the paginated data
                let query = supabase
                    .from('Math_Past_Paper')
                    .select('*')
                    .order('year', { ascending: false })
                    .order('question_no', { ascending: true })
                    .range(offset, offset + pageSize - 1);

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
                    dispatch(clearError(`Failed to search by tags: ${error.message}`));
                    return;
                }

                const matchingQuestions = data || [];
                dispatch(setQuestions(matchingQuestions));

                // Load tags for the matching questions
                if (matchingQuestions.length > 0) {
                    loadTagsForQuestions(matchingQuestions);
                    // Update available tags from the loaded questions
                    const questionTags = extractTagsFromQuestions(matchingQuestions);
                    if (questionTags.length > 0) {
                        const currentAvailableTags = availableTags;
                        const newAvailableTags = [...new Set([...currentAvailableTags, ...questionTags])];
                        dispatch(setAvailableTags(newAvailableTags));
                    }
                }

                if (matchingQuestions.length === 0 && totalQuestions === 0) {
                    dispatch(clearError(`No questions found with tags: ${tags.join(', ')}`));
                }

                // If exactly one result, navigate directly to the question detail page
                if (totalQuestions === 1 && matchingQuestions.length === 1) {
                    const question = matchingQuestions[0];

                    // Store navigation state for single result navigation
                    if (tags.length > 0) {
                        const navState = {
                            fromTagSearch: true,
                            tags: tags,
                            page: 1, // Tag search always starts from page 1
                            timestamp: Date.now()
                        };
                        sessionStorage.setItem('tutornotes_navigation_state', JSON.stringify(navState));
                        console.log('✅ Stored navigation state for single result navigation:', navState);
                    }

                    const questionURL = UnifiedURLService.generateQuestionURL(question.year, question.paper, question.question_no);
                    navigate(questionURL);
                    return; // Exit early since we're navigating away
                }
            }

        } catch (err) {
            console.error('Error searching by tags:', err);
            dispatch(clearError(`Failed to search by tags: ${err.message}`));
        } finally {
            dispatch(setLoading(false));
            // Reset tag search flag after a longer delay to prevent conflicts
            setTimeout(() => {
                setIsTagSearchActive(false);
            }, 1000);
        }
    }, [searchTags, updateURLWithPagination, pageSize, loadTagsForQuestions, extractTagsFromQuestions, navigate, isChinese]); // eslint-disable-line react-hooks/exhaustive-deps



    // Generate URL for a specific question
    const generateQuestionURL = useCallback((question) => {
        try {
            return UnifiedURLService.generateQuestionURL(question.year, question.paper, question.question_no);
        } catch (error) {
            console.error('Error generating question URL:', error);
            return '/DSE_Math'; // Fallback to main page
        }
    }, []);

    // Handle question click - navigate to direct question URL
    const handleQuestionClick = useCallback((question) => {
        // Store navigation state if we're currently in a tag search OR if we have search tags
        if ((isTagSearchActive || searchTags.length > 0) && searchTags.length > 0) {
            const navState = {
                fromTagSearch: true,
                tags: searchTags,
                page: currentPage,
                timestamp: Date.now()
            };
            sessionStorage.setItem('tutornotes_navigation_state', JSON.stringify(navState));
            console.log('✅ Stored navigation state for question click:', navState);

            // Set Redux state for back navigation
            dispatch(setCameFromTagSearch(true));
            dispatch(setOriginalSearchTags(searchTags));
            dispatch(setOriginalSearchPage(currentPage));
            console.log('✅ Set Redux navigation state:', { cameFromTagSearch: true, originalSearchTags: searchTags, originalSearchPage: currentPage });

            // Also store in URL parameters as a fallback
            const questionURL = generateQuestionURL(question);
            const urlWithNavState = `${questionURL}?fromTagSearch=true&tags=${searchTags.join(',')}&page=${currentPage}`;
            navigate(urlWithNavState);
            return;
        }

        const questionURL = generateQuestionURL(question);
        navigate(questionURL);
    }, [navigate, generateQuestionURL, isTagSearchActive, searchTags, currentPage, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle popular tag click - set the tag and update URL
    const handlePopularTagClick = (tag) => {
        // Clear any existing navigation state when starting a new tag search
        sessionStorage.removeItem('tutornotes_navigation_state');
        setCameFromTagSearch(false);
        setOriginalSearchTags([]);
        setOriginalSearchPage(1);

        const newTags = [tag];
        dispatch(setSearchTags(newTags));
        dispatch(setSearchInput(''));

        // Clear dropdown filters when using tags
        dispatch(setSelectedYear(''));
        dispatch(setSelectedPaper(''));
        dispatch(setSelectedQuestionNo(''));

        // Reset pagination for new tag search
        dispatch(setCurrentPage(1));

        // Clear any previous results
        dispatch(setQuestions([]));
        dispatch(setSelectedQuestion(null));
        dispatch(clearError());

        // Update URL with the new tag search (this will navigate to /DSE_Math)
        updateURLWithPagination(newTags, 1);

        // Trigger search with the new tag
        handleTagSearch(newTags);
    };


    // Test function to verify popular tags flow
    const testPopularTagsFlow = async () => {
        console.log('🧪 Testing popular tags flow...');
        try {
            // Test 1: Direct service call
            console.log('🧪 Test 1: Direct service call');
            const serviceResult = await UnifiedTagService.getPopularTags(5);
            console.log('🧪 Service result:', serviceResult);

            // Test 2: Redux thunk call
            console.log('🧪 Test 2: Redux thunk call');
            const thunkResult = await dispatch(loadPopularTagsThunk(5)).unwrap();
            console.log('🧪 Thunk result:', thunkResult);

            // Test 3: Check Redux state
            console.log('🧪 Test 3: Redux state');
            console.log('🧪 Current popularTags state:', popularTags);

            return { serviceResult, thunkResult, state: popularTags };
        } catch (error) {
            console.error('🧪 Test failed:', error);
            return { error: error.message };
        }
    };

    // Make test function available globally for console testing
    window.testPopularTagsFlow = testPopularTagsFlow;

    // Clear all filters
    const handleClearFilters = () => {
        setIsFilterSearching(false);
        dispatch(setSelectedYear(''));
        dispatch(setSelectedPaper(''));
        dispatch(setSelectedQuestionNo(''));
        dispatch(setSearchTags([]));
        dispatch(setSearchInput(''));
        dispatch(setQuestions([]));
        dispatch(setSelectedQuestion(null));
        dispatch(setQuestionTags({}));
        dispatch(clearError());
        dispatch(setLoading(false));
        dispatch(setIsTagSearchActive(false));

        // Clear tag-related state (but keep available tags and popular tags as they should persist)
        // Note: Available tags and popular tags should not be cleared as they're permanent features

        // Clear navigation state
        dispatch(setCameFromTagSearch(false));
        dispatch(setOriginalSearchTags([]));
        dispatch(setOriginalSearchPage(1));

        // Clear cache
        dispatch(setQuestionsCache({}));
        dispatch(setTagsCache({}));

        // Reset pagination
        dispatch(setCurrentPage(1));
        dispatch(setTotalQuestions(0));
        dispatch(setTotalPages(0));

        // Clear URL parameters and redirect to /DSE_Math
        clearURLParams();

        // Scroll to top when clearing filters
        window.scrollTo(0, 0);
    };

    // Handle page change
    const handlePageChange = useCallback((event, newPage) => {
        dispatch(setCurrentPage(newPage));
        updateURLWithPagination(searchTags, newPage);

        // Re-run the current search with new page
        if (searchTags.length > 0) {
            handleTagSearchFromURL(searchTags, newPage);
        } else if (selectedYear || selectedPaper || selectedQuestionNo) {
            handleFilterSearch(newPage);
        }
    }, [searchTags, selectedYear, selectedPaper, selectedQuestionNo, updateURLWithPagination, handleTagSearchFromURL, handleFilterSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    const breadcrumbs = [
        { name: t('breadcrumbs.home'), url: '/' },
        { name: t('breadcrumbs.dseMath'), url: '/DSE_Math' }
    ];

    const courseData = {
        name: t('courseData.name'),
        description: t('courseData.description')
    };

    // Safety check - don't render if component isn't mounted
    if (!componentMounted) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Generate dynamic SEO data based on current state
    const getSEOData = () => {
        // Check if we're on a direct question URL but still loading
        const questionParams = UnifiedURLService.getQuestionParamsFromRouter(params);
        const isDirectQuestionURL = questionParams !== null;

        if (selectedQuestion) {
            // Individual question page - question loaded
            const questionTitle = `${selectedQuestion.year} DSE Maths Paper ${selectedQuestion.paper} Question ${selectedQuestion.question_no} | TutorNote`;
            const questionDescription = selectedQuestion.meta_description ||
                `Step-by-step solution to ${selectedQuestion.year} DSE Maths Paper ${selectedQuestion.paper} Question ${selectedQuestion.question_no}. Expert guide for exam preparation.`;
            const questionKeywords = selectedQuestion.tags ?
                `DSE Math, ${selectedQuestion.year}, Paper ${selectedQuestion.paper}, Question ${selectedQuestion.question_no}, ${selectedQuestion.tags.join(', ')}, Mathematics, Hong Kong, Exam Practice` :
                `DSE Math, ${selectedQuestion.year}, Paper ${selectedQuestion.paper}, Question ${selectedQuestion.question_no}, Mathematics, Hong Kong, Exam Practice`;

            return {
                title: questionTitle,
                description: questionDescription,
                keywords: questionKeywords,
                url: `/DSE_Math/${selectedQuestion.year}/${selectedQuestion.paper}/${selectedQuestion.question_no}`
            };
        } else if (isDirectQuestionURL) {
            // Direct question URL - show loading state or fallback
            const loadingDescription = loading ?
                `Loading DSE Maths Paper ${questionParams.paper} Question ${questionParams.questionNo} solution...` :
                `Step-by-step solution to ${questionParams.year} DSE Maths Paper ${questionParams.paper} Question ${questionParams.questionNo}. Expert guide for exam preparation.`;

            return {
                title: loading ? `Loading Question ${questionParams.questionNo} | TutorNote` : `${questionParams.year} DSE Maths Paper ${questionParams.paper} Question ${questionParams.questionNo} | TutorNote`,
                description: loadingDescription,
                keywords: `DSE Math, ${questionParams.year}, Paper ${questionParams.paper}, Question ${questionParams.questionNo}, Mathematics, Hong Kong`,
                url: `/DSE_Math/${questionParams.year}/${questionParams.paper}/${questionParams.questionNo}`
            };
        } else {
            // Main listing page
            return {
                title: "DSE Math Past Papers - Practice Questions & Solutions | TutorNote",
                description: "Access comprehensive DSE Math past papers with detailed solutions. Practice with real exam questions, track your progress, and improve your mathematics skills for the Hong Kong DSE exam.",
                keywords: "DSE Math, Past Papers, Mathematics, Hong Kong, Exam Practice, Solutions, HKDSE, Secondary School, Math Questions",
                url: "/DSE_Math"
            };
        }
    };

    const seoData = getSEOData();

    // Always render SEOHead - it will handle the dynamic content
    const shouldRenderSEO = true;

    return (
        <>
            {shouldRenderSEO && (
                <SEOHead
                    title={seoData.title}
                    description={seoData.description}
                    keywords={seoData.keywords}
                    url={seoData.url}
                    structuredData={[
                        createCourseStructuredData(courseData),
                        createBreadcrumbStructuredData(breadcrumbs)
                    ]}
                />
            )}
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

                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {/* Breadcrumb */}
                    <Box sx={{ mb: 3 }}>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Home sx={{ mr: 0.5 }} fontSize="small" /> {t('breadcrumbs.home')}
                            </Link>
                            <Typography color="text.primary">{t('breadcrumbs.dseMath')}</Typography>
                        </Breadcrumbs>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <School sx={{ mr: 1 }} color="primary" />
                            {t('pageTitle.main')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('pageTitle.description')}
                        </Typography>
                    </Box>

                    {/* Filter Section */}
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <FilterList sx={{ mr: 1 }} />
                            {t('filters.title')}
                        </Typography>

                        <Grid container spacing={3} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="year-select-label">{t('filters.year.label')}</InputLabel>
                                    <Select
                                        labelId="year-select-label"
                                        id="year-select"
                                        value={selectedYear}
                                        label={t('filters.year.label')}
                                        onChange={(e) => {
                                            dispatch(setSelectedYear(e.target.value));
                                            // Clear tags when using dropdown filters
                                            dispatch(setSearchTags([]));
                                            dispatch(setSearchInput(''));
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 300
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="">{t('filters.year.allYears')}</MenuItem>
                                        {yearOptions.map((year) => (
                                            <MenuItem key={year} value={year}>{year}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="paper-select-label">{t('filters.paper.label')}</InputLabel>
                                    <Select
                                        labelId="paper-select-label"
                                        id="paper-select"
                                        value={selectedPaper}
                                        label={t('filters.paper.label')}
                                        onChange={(e) => {
                                            dispatch(setSelectedPaper(e.target.value));
                                            dispatch(setSelectedQuestionNo('')); // Reset question number when paper changes
                                            // Clear tags when using dropdown filters
                                            dispatch(setSearchTags([]));
                                            dispatch(setSearchInput(''));
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="">{t('filters.paper.allPapers')}</MenuItem>
                                        {paperOptions.map((paper) => (
                                            <MenuItem key={paper} value={paper}>{t('filters.paper.paperPrefix')} {paper}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="question-select-label">{t('filters.questionNumber.label')}</InputLabel>
                                    <Select
                                        labelId="question-select-label"
                                        id="question-select"
                                        value={selectedQuestionNo}
                                        label={t('filters.questionNumber.label')}
                                        onChange={(e) => {
                                            dispatch(setSelectedQuestionNo(e.target.value));
                                            // Clear tags when using dropdown filters
                                            dispatch(setSearchTags([]));
                                            dispatch(setSearchInput(''));
                                        }}
                                        disabled={!selectedPaper}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 300
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="">{t('filters.questionNumber.allQuestions')}</MenuItem>
                                        {getQuestionNumberOptions(selectedPaper).map((num) => (
                                            <MenuItem key={num} value={num}>{num}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Autocomplete
                                    key={`${searchTags.join(',')}-${searchInput}`} // Force remount when search state changes
                                    options={availableTags}
                                    value={searchTags.length > 0 ? searchTags[0] : null}
                                    onChange={(event, newValue) => {
                                        console.log('🔄 Autocomplete onChange - event:', event, 'newValue:', newValue);
                                        if (newValue) {
                                            console.log('🔄 Setting tag:', newValue);
                                            dispatch(setSearchTags([newValue]));
                                            dispatch(setSearchInput(''));
                                        } else {
                                            console.log('🔄 Clearing tags');
                                            dispatch(setSearchTags([]));
                                            dispatch(setSearchInput(''));
                                        }

                                        // Clear dropdown filters when using tags
                                        setSelectedYear('');
                                        setSelectedPaper('');
                                        dispatch(setSelectedQuestionNo(''));
                                        dispatch(setCurrentPage(1));
                                    }}
                                    inputValue={searchInput}
                                    onInputChange={(event, newInputValue, reason) => {
                                        console.log('🔄 Autocomplete onInputChange:', newInputValue, 'reason:', reason);
                                        dispatch(setSearchInput(newInputValue));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            id="tags-autocomplete"
                                            label={t('filters.tags.label')}
                                            placeholder={t('filters.tags.placeholder')}
                                            sx={{ minWidth: '200px' }}
                                        />
                                    )}
                                    renderOption={(props, option) => {
                                        const { key, ...otherProps } = props;
                                        return (
                                            <Box component="li" key={key} {...otherProps}>
                                                {option}
                                            </Box>
                                        );
                                    }}
                                    freeSolo={false}
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
                                        console.log('🔍 Search button clicked - searchTags:', searchTags);

                                        // Reset pagination for new search
                                        dispatch(setCurrentPage(1));

                                        // If tags are selected, do tag search; otherwise do filter search
                                        if (searchTags.length > 0) {
                                            console.log('🔍 Executing tag search');
                                            // Update URL with tags and page 1
                                            updateURLWithPagination(searchTags, 1);
                                            handleTagSearch();
                                        } else {
                                            console.log('🔍 Executing filter search');
                                            // For filter search, update URL with page 1
                                            updateURLWithPagination([], 1);
                                            handleFilterSearch(1);
                                        }
                                    }}
                                    disabled={loading}
                                    sx={{ height: 56 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : t('filters.buttons.search')}
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
                                    {t('filters.buttons.clear')}
                                </Button>
                            </Grid>
                        </Grid>

                    </Paper>

                    {/* Popular Tags Section */}
                    {(isChinese() ? popularTagsChinese : popularTags).length > 0 && (
                        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
                            <Typography variant="h6" gutterBottom sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}>
                                <Search sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                                {t('popularTags.title')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{
                                mb: 2,
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}>
                                {t('popularTags.description')}
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: { xs: 0.5, sm: 1 }
                            }}>
                                {(isChinese() ? popularTagsChinese : popularTags).map((tagData, index) => (
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
                                {t('results.title')} ({totalQuestions} {t('results.questionsFound')})
                                {totalPages > 1 && (
                                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                        ({t('results.pageInfo', { currentPage, totalPages })})
                                    </Typography>
                                )}
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
                                        onClick={() => handleQuestionClick(question)}
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
                                                    #{(currentPage - 1) * pageSize + index + 1}
                                                </Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: { xs: 0.5, sm: 1 },
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <Chip
                                                        label={`${t('question.year')} ${question.year}`}
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
                                                        label={`${t('question.paper')} ${question.paper}`}
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
                                                        label={`${t('question.question')}${question.question_no}`}
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
                                                handleQuestionClick(question);
                                            }}
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                minWidth: { xs: '60px', sm: 'auto' },
                                                alignSelf: { xs: 'flex-end', sm: 'auto' }
                                            }}
                                        >
                                            {t('results.view')}
                                        </Button>
                                    </Box>
                                ))}
                            </Box>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 3,
                                    pt: 2,
                                    borderTop: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="large"
                                        showFirstButton
                                        showLastButton
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </Paper>
                    )}

                    {/* Question Display Section */}
                    {selectedQuestion && (
                        <Box ref={questionDetailsRef} sx={{ mt: 4 }}>
                            <QuestionDisplay
                                question={selectedQuestion}
                                questionTags={questionTags[selectedQuestion.id] || []}
                                onTagClick={handlePopularTagClick}
                                onQuestionChange={(newQuestion) => {
                                    // Update the selected question when navigating
                                    dispatch(setSelectedQuestion(newQuestion));
                                    // Load tags for the new question
                                    const tags = getQuestionTagsFromData(newQuestion);
                                    dispatch(setQuestionTags({ [newQuestion.id]: tags }));
                                }}
                                // Navigation props for back button
                                cameFromTagSearch={cameFromTagSearch}
                                originalSearchTags={originalSearchTags}
                                onBackToSearch={handleBackToTagSearch}
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
                                {t('results.noResults.title')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {t('results.noResults.description')}
                            </Typography>
                        </Paper>
                    )}
                </Container>
            </Box>
        </>
    );
};

export default MathPaperPage;