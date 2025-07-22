import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import QuestionDisplay from '../QuestionDisplay';

const theme = createTheme();

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('QuestionDisplay Component', () => {
    const sampleQuestion = {
        id: 1,
        question_no: 15,
        year: 2023,
        paper: 'I',
        correct_answer: "Find the extremum of the quadratic function f(x) = 2x² - 8x + 5.",
        option_a: "Minimum at (2, -3)",
        option_b: "Maximum at (2, -3)",
        option_c: "Minimum at (-2, 3)",
        option_d: "Maximum at (-2, 3)",
        tags: ['quadratic functions', 'extremum', 'calculus']
    };

    test('renders question metadata correctly', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('2023')).toBeInTheDocument();
        expect(screen.getByText('Paper I')).toBeInTheDocument();
        expect(screen.getByText('#15')).toBeInTheDocument();
    });

    test('renders question statement', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('Question Statement:')).toBeInTheDocument();
        expect(screen.getByText(sampleQuestion.correct_answer)).toBeInTheDocument();
    });

    test('renders multiple choice options', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('A: Minimum at (2, -3)')).toBeInTheDocument();
        expect(screen.getByText('B: Maximum at (2, -3)')).toBeInTheDocument();
        expect(screen.getByText('C: Minimum at (-2, 3)')).toBeInTheDocument();
        expect(screen.getByText('D: Maximum at (-2, 3)')).toBeInTheDocument();
    });

    test('renders solution section', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('Solution:')).toBeInTheDocument();
    });

    test('renders diagram section', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('Diagram & Visualization')).toBeInTheDocument();
        expect(screen.getByText('Diagram placeholder')).toBeInTheDocument();
    });

    test('renders tags when available', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('Tags:')).toBeInTheDocument();
        expect(screen.getByText('quadratic functions')).toBeInTheDocument();
        expect(screen.getByText('extremum')).toBeInTheDocument();
        expect(screen.getByText('calculus')).toBeInTheDocument();
    });

    test('shows no question message when no question provided', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={null} />
            </TestWrapper>
        );

        expect(screen.getByText('No question selected')).toBeInTheDocument();
    });
});