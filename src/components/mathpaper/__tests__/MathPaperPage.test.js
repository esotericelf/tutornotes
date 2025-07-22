import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MathPaperPage from '../MathPaperPage';
import { supabase } from '../../../services/supabase';

// Mock Supabase
jest.mock('../../../services/supabase', () => ({
    supabase: {
        rpc: jest.fn()
    }
}));

// Mock react-router-dom before importing the component
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    BrowserRouter: ({ children }) => <div>{children}</div>
}));

const theme = createTheme();

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('MathPaperPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders MathPaperPage with correct title', () => {
        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        expect(screen.getByText('Math Past Papers')).toBeInTheDocument();
        expect(screen.getByText('Filter Questions')).toBeInTheDocument();
        expect(screen.getByText('Search by Tags')).toBeInTheDocument();
    });

    test('renders all filter dropdowns', () => {
        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        expect(screen.getByLabelText('Year')).toBeInTheDocument();
        expect(screen.getByLabelText('Paper')).toBeInTheDocument();
        expect(screen.getByLabelText('Question Number')).toBeInTheDocument();
    });

    test('displays years from 2012 to 2025', () => {
        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const yearSelect = screen.getByLabelText('Year');
        fireEvent.mouseDown(yearSelect);

        expect(screen.getByText('2012')).toBeInTheDocument();
        expect(screen.getByText('2025')).toBeInTheDocument();
    });

    test('displays Paper I and Paper II options', () => {
        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const paperSelect = screen.getByLabelText('Paper');
        fireEvent.mouseDown(paperSelect);

        expect(screen.getByText('Paper I')).toBeInTheDocument();
        expect(screen.getByText('Paper II')).toBeInTheDocument();
    });

    test('question number is disabled when no paper is selected', () => {
        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const questionSelect = screen.getByLabelText('Question Number');
        expect(questionSelect).toBeDisabled();
    });

    test('shows correct question numbers for Paper I', () => {
        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const paperSelect = screen.getByLabelText('Paper');
        fireEvent.mouseDown(paperSelect);
        fireEvent.click(screen.getByText('Paper I'));

        const questionSelect = screen.getByLabelText('Question Number');
        fireEvent.mouseDown(questionSelect);

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('16')).toBeInTheDocument();
    });

    test('shows correct question numbers for Paper II', () => {
        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const paperSelect = screen.getByLabelText('Paper');
        fireEvent.mouseDown(paperSelect);
        fireEvent.click(screen.getByText('Paper II'));

        const questionSelect = screen.getByLabelText('Question Number');
        fireEvent.mouseDown(questionSelect);

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
    });

    test('calls filter function with correct parameters', async () => {
        const mockRpc = supabase.rpc.mockResolvedValue({ data: [], error: null });

        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const yearSelect = screen.getByLabelText('Year');
        fireEvent.mouseDown(yearSelect);
        fireEvent.click(screen.getByText('2020'));

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(mockRpc).toHaveBeenCalledWith('filter_math_papers_by_year_paper', {
                filter_year: 2020,
                filter_paper: null
            });
        });
    });

    test('fetches available tags on mount', async () => {
        const mockTags = ['algebra', 'geometry'];
        supabase.rpc.mockResolvedValue({ data: mockTags, error: null });

        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(supabase.rpc).toHaveBeenCalledWith('get_all_tags');
        });
    });

    test('handles filter search error', async () => {
        supabase.rpc.mockResolvedValue({ data: null, error: new Error('Database error') });

        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch questions')).toBeInTheDocument();
        });
    });

    test('clears all filters when clear button is clicked', () => {
        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const yearSelect = screen.getByLabelText('Year');
        fireEvent.mouseDown(yearSelect);
        fireEvent.click(screen.getByText('2020'));

        expect(yearSelect).toHaveValue('2020');

        const clearButton = screen.getByText('Clear All Filters');
        fireEvent.click(clearButton);

        expect(yearSelect).toHaveValue('');
    });

    test('displays question results correctly', async () => {
        const mockData = [{
            id: 1,
            question_no: 5,
            year: 2020,
            paper: 'I',
            correct_answer: 'What is 2+2?',
            option_a: '3',
            option_b: '4',
            option_c: '5',
            option_d: '6',
            tags: ['basic math']
        }];

        supabase.rpc.mockResolvedValue({ data: mockData, error: null });

        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Results (1 questions found)')).toBeInTheDocument();
            expect(screen.getByText('Question 5 - Year 2020, Paper I')).toBeInTheDocument();
            expect(screen.getByText('Question: What is 2+2?')).toBeInTheDocument();
        });
    });

    test('shows no results message when no questions found', async () => {
        supabase.rpc.mockResolvedValue({ data: [], error: null });

        render(
            <TestWrapper>
                <MathPaperPage />
            </TestWrapper>
        );

        const yearSelect = screen.getByLabelText('Year');
        fireEvent.mouseDown(yearSelect);
        fireEvent.click(screen.getByText('2020'));

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('No questions found matching your criteria')).toBeInTheDocument();
        });
    });
});