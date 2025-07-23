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

    test('renders main sections', () => {
        render(
            <TestWrapper>
                <MathPaperPage />
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
                <MathPaperPage />
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
                <MathPaperPage />
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
                <MathPaperPage />
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
                <MathPaperPage />
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
                <MathPaperPage />
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
                <MathPaperPage />
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