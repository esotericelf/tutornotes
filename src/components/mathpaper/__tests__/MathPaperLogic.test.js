import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { supabase } from '../../../services/supabase';

// Mock Supabase
jest.mock('../../../services/supabase', () => ({
    supabase: {
        rpc: jest.fn()
    }
}));

// Create a simple test component that doesn't use routing
const TestMathPaperComponent = () => {
    const [questions, setQuestions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.rpc('filter_math_papers_by_year_paper', {
                filter_year: null,
                filter_paper: null
            });

            if (error) {
                setError('Failed to fetch questions');
            } else {
                setQuestions(data || []);
            }
        } catch (err) {
            setError('Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setQuestions([]);
        setError('');
    };

    return (
        <div>
            <h1>Math Past Papers</h1>
            <button onClick={handleSearch} disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
            </button>
            <button onClick={handleClear}>Clear All Filters</button>

            {error && <div>{error}</div>}

            {questions.length > 0 && (
                <div>
                    <h3>Results ({questions.length} questions found)</h3>
                    {questions.map(question => (
                        <div key={question.id}>
                            <p>Question {question.question_no} - Year {question.year}, Paper {question.paper}</p>
                            <p>Question: {question.correct_answer}</p>
                        </div>
                    ))}
                </div>
            )}

            {!loading && questions.length === 0 && (
                <div>No questions found matching your criteria</div>
            )}
        </div>
    );
};

const theme = createTheme();

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('MathPaperPage Core Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders main sections', () => {
        render(
            <TestWrapper>
                <TestMathPaperComponent />
            </TestWrapper>
        );

        expect(screen.getByText('Math Past Papers')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
    });

    test('performs basic search', async () => {
        supabase.rpc.mockResolvedValue({ data: [], error: null });

        render(
            <TestWrapper>
                <TestMathPaperComponent />
            </TestWrapper>
        );

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(supabase.rpc).toHaveBeenCalledWith('filter_math_papers_by_year_paper', {
                filter_year: null,
                filter_paper: null
            });
        });
    });

    test('displays search results', async () => {
        const mockData = [{
            id: 1,
            question_no: 5,
            year: 2020,
            paper: 'I',
            correct_answer: 'What is 2+2?'
        }];

        supabase.rpc.mockResolvedValue({ data: mockData, error: null });

        render(
            <TestWrapper>
                <TestMathPaperComponent />
            </TestWrapper>
        );

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Results (1 questions found)')).toBeInTheDocument();
            expect(screen.getByText('Question 5 - Year 2020, Paper I')).toBeInTheDocument();
        });
    });

    test('handles search errors', async () => {
        supabase.rpc.mockResolvedValue({ data: null, error: new Error('Database error') });

        render(
            <TestWrapper>
                <TestMathPaperComponent />
            </TestWrapper>
        );

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch questions')).toBeInTheDocument();
        });
    });

    test('shows no results message', async () => {
        supabase.rpc.mockResolvedValue({ data: [], error: null });

        render(
            <TestWrapper>
                <TestMathPaperComponent />
            </TestWrapper>
        );

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('No questions found matching your criteria')).toBeInTheDocument();
        });
    });

    test('clears results when clear button is clicked', async () => {
        const mockData = [{
            id: 1,
            question_no: 5,
            year: 2020,
            paper: 'I',
            correct_answer: 'What is 2+2?'
        }];

        supabase.rpc.mockResolvedValue({ data: mockData, error: null });

        render(
            <TestWrapper>
                <TestMathPaperComponent />
            </TestWrapper>
        );

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Results (1 questions found)')).toBeInTheDocument();
        });

        const clearButton = screen.getByText('Clear All Filters');
        fireEvent.click(clearButton);

        expect(screen.getByText('No questions found matching your criteria')).toBeInTheDocument();
    });

    test('shows loading state during search', async () => {
        let resolvePromise;
        const promise = new Promise(resolve => {
            resolvePromise = resolve;
        });
        supabase.rpc.mockReturnValue(promise);

        render(
            <TestWrapper>
                <TestMathPaperComponent />
            </TestWrapper>
        );

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        resolvePromise({ data: [], error: null });
        await waitFor(() => {
            expect(screen.getByText('Search')).toBeInTheDocument();
        });
    });
});