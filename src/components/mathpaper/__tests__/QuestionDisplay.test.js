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

// Sample question data for testing
const sampleQuestion = {
    id: 2,
    year: 2023,
    paper: 'II',
    question_no: 8,
    question: "A quadratic function $f(x) = ax^2 + bx + c$ has the following properties: it passes through point $(1, 2)$ and has a minimum value of $-1$ at $x = 2$. Given that $a > 0$, which of the following could be the correct function?",
    options: [
        "$f(x) = x^2 - 4x + 3$",
        "$f(x) = 2x^2 - 8x + 7$",
        "$f(x) = x^2 - 4x + 5$",
        "$f(x) = 2x^2 - 8x + 9$"
    ],
    questionDiagram: "<div>Test diagram</div>",
    solution: "Test solution with steps.\n\nStep 1: Test step\nStep 2: Another test step",
    solutionDiagram: "<div>Test solution diagram</div>"
};

describe('QuestionDisplay Component', () => {
    test('renders question metadata correctly', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('2023')).toBeInTheDocument();
        expect(screen.getByText('II')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
    });

    test('renders question content', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText(/A quadratic function/)).toBeInTheDocument();
    });

    test('renders multiple choice options', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('A)')).toBeInTheDocument();
        expect(screen.getByText('B)')).toBeInTheDocument();
        expect(screen.getByText('C)')).toBeInTheDocument();
        expect(screen.getByText('D)')).toBeInTheDocument();
    });

    test('renders question diagram', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('Diagram')).toBeInTheDocument();
    });

    test('renders solution section', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('Solution')).toBeInTheDocument();
        expect(screen.getByText(/Test solution with steps/)).toBeInTheDocument();
    });

    test('renders solution diagram', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('Solution Diagram')).toBeInTheDocument();
    });

    test('renders breadcrumb navigation', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Question 8')).toBeInTheDocument();
    });

    test('renders solution steps', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={sampleQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText(/Step 1:/)).toBeInTheDocument();
        expect(screen.getByText(/Step 2:/)).toBeInTheDocument();
    });
});