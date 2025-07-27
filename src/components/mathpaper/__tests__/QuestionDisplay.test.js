import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import QuestionDisplay from '../QuestionDisplay';

const theme = createTheme();

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

const mockQuestion = {
    id: 1,
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
    correct_answer: 'C',
    solution: `To find the quadratic function from the given properties, we can use the vertex form and then convert to standard form.

Step 1: Use the vertex form since we know the minimum:
Since the function has a minimum at $x = 2$ with value $-1$, the vertex form is:
$f(x) = a(x - 2)^2 - 1$

Step 2: Use the point $(1, 2)$ to find the value of $a$:
$f(1) = 2$ means:
$a(1 - 2)^2 - 1 = 2$
$a(1) - 1 = 2$
$a = 3$`,
    solution_diagram: '<iframe scrolling="no" title="Test Diagram" src="https://www.geogebra.org/material/iframe/id/test123/width/100%/height/100%/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false" width="100%" height="100%" style="border:0px;"></iframe>'
};

describe('QuestionDisplay Component', () => {
    test('renders question metadata correctly', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={mockQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('2023')).toBeInTheDocument();
        expect(screen.getByText('II')).toBeInTheDocument();
        // Use getAllByText since '8' appears in both metadata and LaTeX
        expect(screen.getAllByText('8').length).toBeGreaterThan(0);
    });

    test('renders question content with LaTeX', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={mockQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText(/A quadratic function/)).toBeInTheDocument();
        // Check for LaTeX content using data-testid
        const katexElements = screen.getAllByTestId('react-katex');
        expect(katexElements.length).toBeGreaterThan(0);
    });

    test('renders multiple choice options', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={mockQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('A)')).toBeInTheDocument();
        expect(screen.getByText('B)')).toBeInTheDocument();
        expect(screen.getByText('C)')).toBeInTheDocument();
        expect(screen.getByText('D)')).toBeInTheDocument();
    });

    test('renders solution section', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={mockQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText('Solution')).toBeInTheDocument();
        expect(screen.getByText('C')).toBeInTheDocument(); // Correct answer badge
        expect(screen.getByText('Correct Answer')).toBeInTheDocument();
    });

    test('renders solution content with LaTeX', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={mockQuestion} />
            </TestWrapper>
        );

        expect(screen.getByText(/To find the quadratic function/)).toBeInTheDocument();
        // Check for LaTeX content in solution
        const katexElements = screen.getAllByTestId('react-katex');
        expect(katexElements.length).toBeGreaterThan(0);
    });

    test('shows solution diagram toggle button', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={mockQuestion} />
            </TestWrapper>
        );

        // The toggle button should be present (expand icon)
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toBeInTheDocument();
    });

    test('expands solution diagram when toggle is clicked', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={mockQuestion} />
            </TestWrapper>
        );

        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);

        // After clicking, the "Solution Diagram" text should appear
        expect(screen.getByText('Solution Diagram')).toBeInTheDocument();
    });

    test('renders iframe when solution diagram is expanded', () => {
        render(
            <TestWrapper>
                <QuestionDisplay question={mockQuestion} />
            </TestWrapper>
        );

        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);

        // The iframe should be rendered
        const iframe = document.querySelector('iframe');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src', expect.stringContaining('geogebra.org'));
    });

    test('handles question without diagram gracefully', () => {
        const questionWithoutDiagram = {
            ...mockQuestion,
            question_diagram: null,
            solution_diagram: null
        };

        render(
            <TestWrapper>
                <QuestionDisplay question={questionWithoutDiagram} />
            </TestWrapper>
        );

        // Should still render the question content
        expect(screen.getByText(/A quadratic function/)).toBeInTheDocument();
        expect(screen.getByText('Solution')).toBeInTheDocument();
    });
});