import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    NavigateBefore,
    NavigateNext,
    FirstPage,
    LastPage
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UnifiedQuestionService } from '../../services/mathpaper';

const CompactQuestionNavigation = ({ currentQuestion, onQuestionChange, variant = 'horizontal' }) => {
    const navigate = useNavigate();
    const [navigationInfo, setNavigationInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadNavigationInfo = useCallback(async () => {
        if (!currentQuestion) return;

        setLoading(true);
        setError('');

        try {
            const result = await UnifiedQuestionService.getAllNavigationInfo(
                currentQuestion.year,
                currentQuestion.paper,
                currentQuestion.question_no
            );

            if (result.error) {
                setError(`Failed to load navigation: ${result.error.message}`);
                return;
            }

            setNavigationInfo(result.data);
        } catch (err) {
            setError(`Unexpected error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [currentQuestion]);

    useEffect(() => {
        if (currentQuestion) {
            loadNavigationInfo();
        }
    }, [currentQuestion, loadNavigationInfo]);

    const handleNavigation = (question) => {
        if (!question) return;

        const questionURL = UnifiedQuestionService.generateQuestionURL(
            question.year,
            question.paper,
            question.question_no
        );

        navigate(questionURL);

        // Call the callback if provided
        if (onQuestionChange) {
            onQuestionChange(question);
        }
    };

    const getQuestionDisplayText = (question) => {
        if (!question) return '';
        return `${question.year} Paper ${question.paper} Q${question.question_no}`;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1 }}>
                <CircularProgress size={16} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ py: 0.5 }}>
                {error}
            </Alert>
        );
    }

    if (!navigationInfo) {
        return null;
    }

    if (variant === 'vertical') {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                {/* First Question */}
                <Tooltip title={navigationInfo.first_question ? getQuestionDisplayText(navigationInfo.first_question) : 'No first question'} arrow>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => handleNavigation(navigationInfo.first_question)}
                            disabled={!navigationInfo.first_question}
                            sx={{
                                color: navigationInfo.first_question ? 'primary.main' : 'text.disabled',
                                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                            }}
                        >
                            <FirstPage fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                {/* Previous Question */}
                <Tooltip title={navigationInfo.previous_question ? getQuestionDisplayText(navigationInfo.previous_question) : 'No previous question'} arrow>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => handleNavigation(navigationInfo.previous_question)}
                            disabled={!navigationInfo.has_previous}
                            sx={{
                                color: navigationInfo.has_previous ? 'primary.main' : 'text.disabled',
                                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                            }}
                        >
                            <NavigateBefore fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                {/* Next Question */}
                <Tooltip title={navigationInfo.next_question ? getQuestionDisplayText(navigationInfo.next_question) : 'No next question'} arrow>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => handleNavigation(navigationInfo.next_question)}
                            disabled={!navigationInfo.has_next}
                            sx={{
                                color: navigationInfo.has_next ? 'primary.main' : 'text.disabled',
                                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                            }}
                        >
                            <NavigateNext fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                {/* Last Question */}
                <Tooltip title={navigationInfo.last_question ? getQuestionDisplayText(navigationInfo.last_question) : 'No last question'} arrow>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => handleNavigation(navigationInfo.last_question)}
                            disabled={!navigationInfo.last_question}
                            sx={{
                                color: navigationInfo.last_question ? 'primary.main' : 'text.disabled',
                                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                            }}
                        >
                            <LastPage fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        );
    }

    // Horizontal variant (default) - enhanced design
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'center',
            py: 2
        }}>
            {/* First Question */}
            <Tooltip title={navigationInfo.first_question ? getQuestionDisplayText(navigationInfo.first_question) : 'No first question'} arrow>
                <span>
                    <IconButton
                        size="medium"
                        onClick={() => handleNavigation(navigationInfo.first_question)}
                        disabled={!navigationInfo.first_question}
                        sx={{
                            color: navigationInfo.first_question ? 'primary.main' : 'text.disabled',
                            backgroundColor: navigationInfo.first_question ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                            border: `1px solid ${navigationInfo.first_question ? 'primary.main' : 'rgba(0,0,0,0.2)'}`,
                            borderRadius: 2,
                            width: 48,
                            height: 48,
                            '&:hover': {
                                backgroundColor: navigationInfo.first_question ? 'primary.main' : 'rgba(0,0,0,0.1)',
                                color: navigationInfo.first_question ? 'white' : 'text.disabled',
                                transform: 'scale(1.05)',
                                transition: 'all 0.2s ease-in-out'
                            }
                        }}
                    >
                        <FirstPage fontSize="medium" />
                    </IconButton>
                </span>
            </Tooltip>

            {/* Previous Question */}
            <Tooltip title={navigationInfo.previous_question ? getQuestionDisplayText(navigationInfo.previous_question) : 'No previous question'} arrow>
                <span>
                    <IconButton
                        size="medium"
                        onClick={() => handleNavigation(navigationInfo.previous_question)}
                        disabled={!navigationInfo.has_previous}
                        sx={{
                            color: navigationInfo.has_previous ? 'primary.main' : 'text.disabled',
                            backgroundColor: navigationInfo.has_previous ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                            border: `1px solid ${navigationInfo.has_previous ? 'primary.main' : 'rgba(0,0,0,0.2)'}`,
                            borderRadius: 2,
                            width: 48,
                            height: 48,
                            '&:hover': {
                                backgroundColor: navigationInfo.has_previous ? 'primary.main' : 'rgba(0,0,0,0.1)',
                                color: navigationInfo.has_previous ? 'white' : 'text.disabled',
                                transform: 'scale(1.05)',
                                transition: 'all 0.2s ease-in-out'
                            }
                        }}
                    >
                        <NavigateBefore fontSize="medium" />
                    </IconButton>
                </span>
            </Tooltip>

            {/* Next Question */}
            <Tooltip title={navigationInfo.next_question ? getQuestionDisplayText(navigationInfo.next_question) : 'No next question'} arrow>
                <span>
                    <IconButton
                        size="medium"
                        onClick={() => handleNavigation(navigationInfo.next_question)}
                        disabled={!navigationInfo.has_next}
                        sx={{
                            color: navigationInfo.has_next ? 'primary.main' : 'text.disabled',
                            backgroundColor: navigationInfo.has_next ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                            border: `1px solid ${navigationInfo.has_next ? 'primary.main' : 'rgba(0,0,0,0.2)'}`,
                            borderRadius: 2,
                            width: 48,
                            height: 48,
                            '&:hover': {
                                backgroundColor: navigationInfo.has_next ? 'primary.main' : 'rgba(0,0,0,0.1)',
                                color: navigationInfo.has_next ? 'white' : 'text.disabled',
                                transform: 'scale(1.05)',
                                transition: 'all 0.2s ease-in-out'
                            }
                        }}
                    >
                        <NavigateNext fontSize="medium" />
                    </IconButton>
                </span>
            </Tooltip>

            {/* Last Question */}
            <Tooltip title={navigationInfo.last_question ? getQuestionDisplayText(navigationInfo.last_question) : 'No last question'} arrow>
                <span>
                    <IconButton
                        size="medium"
                        onClick={() => handleNavigation(navigationInfo.last_question)}
                        disabled={!navigationInfo.last_question}
                        sx={{
                            color: navigationInfo.last_question ? 'primary.main' : 'text.disabled',
                            backgroundColor: navigationInfo.last_question ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                            border: `1px solid ${navigationInfo.last_question ? 'primary.main' : 'rgba(0,0,0,0.2)'}`,
                            borderRadius: 2,
                            width: 48,
                            height: 48,
                            '&:hover': {
                                backgroundColor: navigationInfo.last_question ? 'primary.main' : 'rgba(0,0,0,0.1)',
                                color: navigationInfo.last_question ? 'white' : 'text.disabled',
                                transform: 'scale(1.05)',
                                transition: 'all 0.2s ease-in-out'
                            }
                        }}
                    >
                        <LastPage fontSize="medium" />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
};

export default CompactQuestionNavigation;
