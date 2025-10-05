import React, { useState, useEffect } from 'react';
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

const QuestionNavigation = ({ currentQuestion, onQuestionChange }) => {
    const navigate = useNavigate();
    const [navigationInfo, setNavigationInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentQuestion) {
            loadNavigationInfo();
        }
    }, [currentQuestion]);

    const loadNavigationInfo = async () => {
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
                setError(`Failed to load navigation info: ${result.error.message}`);
                return;
            }

            setNavigationInfo(result.data);
        } catch (err) {
            setError(`Unexpected error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

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

    const getNavigationHint = (type) => {
        if (!navigationInfo) return '';

        switch (type) {
            case 'previous':
                if (navigationInfo.previous_question) {
                    return `Previous: ${getQuestionDisplayText(navigationInfo.previous_question)}`;
                }
                return 'This is the first question';
            case 'next':
                if (navigationInfo.next_question) {
                    return `Next: ${getQuestionDisplayText(navigationInfo.next_question)}`;
                }
                return 'This is the last question';
            case 'first':
                if (navigationInfo.first_question) {
                    return `First: ${getQuestionDisplayText(navigationInfo.first_question)}`;
                }
                return 'No questions available';
            case 'last':
                if (navigationInfo.last_question) {
                    return `Last: ${getQuestionDisplayText(navigationInfo.last_question)}`;
                }
                return 'No questions available';
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!navigationInfo) {
        return null;
    }

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            py: 2,
            borderTop: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            mb: 2
        }}>
            {/* First Question */}
            <Tooltip title={getNavigationHint('first')} arrow>
                <span>
                    <IconButton
                        onClick={() => handleNavigation(navigationInfo.first_question)}
                        disabled={!navigationInfo.first_question}
                        size="small"
                        sx={{
                            color: navigationInfo.first_question ? 'primary.main' : 'text.disabled',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white'
                            }
                        }}
                    >
                        <FirstPage />
                    </IconButton>
                </span>
            </Tooltip>

            {/* Previous Question */}
            <Tooltip title={getNavigationHint('previous')} arrow>
                <span>
                    <IconButton
                        onClick={() => handleNavigation(navigationInfo.previous_question)}
                        disabled={!navigationInfo.has_previous}
                        size="small"
                        sx={{
                            color: navigationInfo.has_previous ? 'primary.main' : 'text.disabled',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white'
                            }
                        }}
                    >
                        <NavigateBefore />
                    </IconButton>
                </span>
            </Tooltip>

            {/* Next Question */}
            <Tooltip title={getNavigationHint('next')} arrow>
                <span>
                    <IconButton
                        onClick={() => handleNavigation(navigationInfo.next_question)}
                        disabled={!navigationInfo.has_next}
                        size="small"
                        sx={{
                            color: navigationInfo.has_next ? 'primary.main' : 'text.disabled',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white'
                            }
                        }}
                    >
                        <NavigateNext />
                    </IconButton>
                </span>
            </Tooltip>

            {/* Last Question */}
            <Tooltip title={getNavigationHint('last')} arrow>
                <span>
                    <IconButton
                        onClick={() => handleNavigation(navigationInfo.last_question)}
                        disabled={!navigationInfo.last_question}
                        size="small"
                        sx={{
                            color: navigationInfo.last_question ? 'primary.main' : 'text.disabled',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white'
                            }
                        }}
                    >
                        <LastPage />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
};

export default QuestionNavigation;
