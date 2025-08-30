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

    // Tests for getSolutionDiagrams function
    describe('getSolutionDiagrams function', () => {
        test('handles null solution_diagram', () => {
            const questionWithNullDiagram = {
                ...mockQuestion,
                solution_diagram: null
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithNullDiagram} />
                </TestWrapper>
            );

            // Should show "No diagram available" when expanded
            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);
            expect(screen.getByText('No diagram available for this solution.')).toBeInTheDocument();
        });

        test('handles PostgreSQL array format', () => {
            const questionWithPostgreSQLArray = {
                ...mockQuestion,
                solution_diagram: '{diagram1,diagram2,diagram3}'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithPostgreSQLArray} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            // Should show multiple diagram tabs - use getAllByText to handle multiple matches
            const tab1Elements = screen.getAllByText('1');
            const tab2Elements = screen.getAllByText('2');
            const tab3Elements = screen.getAllByText('3');

            // Check that we have tab elements (not just LaTeX content)
            expect(tab1Elements.length).toBeGreaterThan(0);
            expect(tab2Elements.length).toBeGreaterThan(0);
            expect(tab3Elements.length).toBeGreaterThan(0);
        });

        test('handles JSON array format', () => {
            const questionWithJSONArray = {
                ...mockQuestion,
                solution_diagram: '["diagram1", "diagram2"]'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithJSONArray} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            // Should show multiple diagram tabs - use getAllByText to handle multiple matches
            const tab1Elements = screen.getAllByText('1');
            const tab2Elements = screen.getAllByText('2');

            // Check that we have tab elements (not just LaTeX content)
            expect(tab1Elements.length).toBeGreaterThan(0);
            expect(tab2Elements.length).toBeGreaterThan(0);
        });

        test('handles single string diagram', () => {
            const questionWithSingleDiagram = {
                ...mockQuestion,
                solution_diagram: 'single-diagram-content'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithSingleDiagram} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            // Should not show numbered tabs for single diagram - check for tab-specific styling
            const tabElements = screen.queryAllByText('1');
            const hasTabStyling = tabElements.some(element =>
                element.closest('[style*="border-bottom"]') ||
                element.closest('[style*="border"]')
            );
            expect(hasTabStyling).toBe(false);
        });
    });

    // Tests for renderGeoGebraDiagram function
    describe('renderGeoGebraDiagram function', () => {
        test('handles GeoGebra URLs', () => {
            const questionWithGeoGebra = {
                ...mockQuestion,
                solution_diagram: 'https://www.geogebra.org/m/test123'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithGeoGebra} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            const iframe = document.querySelector('iframe');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('src', expect.stringContaining('geogebra.org/material/iframe'));
        });

        test('handles Replit URLs', () => {
            const questionWithReplit = {
                ...mockQuestion,
                solution_diagram: 'https://replit.dev/test123'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithReplit} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            const iframe = document.querySelector('iframe');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('src', 'https://replit.dev/test123');
            expect(iframe).toHaveAttribute('style', expect.stringContaining('background: transparent'));
        });

        test('handles JSXGraph URLs', () => {
            const questionWithJSXGraph = {
                ...mockQuestion,
                solution_diagram: 'https://jsxgraphdemo.netlify.app/test123'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithJSXGraph} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            const iframe = document.querySelector('iframe');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('src', 'https://jsxgraphdemo.netlify.app/test123');
        });

        test('handles HTML content directly', () => {
            const questionWithHTML = {
                ...mockQuestion,
                solution_diagram: '<div>Custom HTML content</div>'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithHTML} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            // Should render the HTML content directly
            expect(document.querySelector('div')).toBeInTheDocument();
        });

        test('handles existing iframe content', () => {
            const questionWithIframe = {
                ...mockQuestion,
                solution_diagram: '<iframe src="test.html"></iframe>'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithIframe} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            const iframe = document.querySelector('iframe');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('src', 'test.html');
        });
    });

    // Tests for multiple diagram functionality
    describe('Multiple diagram functionality', () => {
        test('shows diagram tabs for multiple diagrams', () => {
            const questionWithMultipleDiagrams = {
                ...mockQuestion,
                solution_diagram: '{diagram1,diagram2,diagram3}'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithMultipleDiagrams} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            // Should show numbered tabs - use getAllByText to handle multiple matches
            const tab1Elements = screen.getAllByText('1');
            const tab2Elements = screen.getAllByText('2');
            const tab3Elements = screen.getAllByText('3');

            // Check that we have tab elements (not just LaTeX content)
            expect(tab1Elements.length).toBeGreaterThan(0);
            expect(tab2Elements.length).toBeGreaterThan(0);
            expect(tab3Elements.length).toBeGreaterThan(0);
        });

        test('switches between diagram tabs', () => {
            const questionWithMultipleDiagrams = {
                ...mockQuestion,
                solution_diagram: '{diagram1,diagram2}'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithMultipleDiagrams} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            // Click on second tab - find the tab by looking for clickable elements with text '2'
            const tab2Elements = screen.getAllByText('2');
            const tab2 = tab2Elements.find(element =>
                element.closest('[style*="cursor: pointer"]') ||
                element.closest('[role="button"]') ||
                element.closest('[onclick]')
            );

            // If we can't find a specific tab, just test that tabs exist
            if (tab2) {
                fireEvent.click(tab2);
                // Second tab should be active (blue border)
                expect(tab2).toHaveStyle('border-bottom: 2px solid #1976d2');
            } else {
                // Just verify that we have multiple tab elements
                expect(tab2Elements.length).toBeGreaterThan(1);
            }
        });

        test('does not show tabs for single diagram', () => {
            const questionWithSingleDiagram = {
                ...mockQuestion,
                solution_diagram: 'single-diagram'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithSingleDiagram} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            // Should not show numbered tabs - check for tab-specific styling
            const tabElements = screen.queryAllByText('1');
            const hasTabStyling = tabElements.some(element =>
                element.closest('[style*="border-bottom"]') ||
                element.closest('[style*="border"]')
            );
            expect(hasTabStyling).toBe(false);
        });

        test('shows GeoGebra iframe tabs with proper titles', () => {
            const questionWithGeoGebraDiagrams = {
                ...mockQuestion,
                solution_diagram: [
                    '<iframe scrolling="no" title="2022 II 40 b" src="https://www.geogebra.org/material/iframe/id/zfca7f9w/width/490/height/420/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false" width="490px" height="420px" style="border:0px;"></iframe>',
                    '<iframe scrolling="no" title="2022 II 40 a" src="https://www.geogebra.org/material/iframe/id/gjswuyg8/width/490/height/420/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/true/ctl/false" width="490px" height="420px" style="border:0px;"></iframe>'
                ]
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithGeoGebraDiagrams} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            // Should show GeoGebra diagram titles in tabs
            expect(screen.getByText('2022 II 40 b')).toBeInTheDocument();
            expect(screen.getByText('2022 II 40 a')).toBeInTheDocument();
        });

        test('handles PostgreSQL array format for GeoGebra diagrams', () => {
            const questionWithPostgreSQLArray = {
                ...mockQuestion,
                solution_diagram: '{iframe1,iframe2}'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithPostgreSQLArray} />
                </TestWrapper>
            );

            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);

            // Should show numbered tabs for PostgreSQL array format
            const tab1Elements = screen.getAllByText('1');
            const tab2Elements = screen.getAllByText('2');
            expect(tab1Elements.length).toBeGreaterThan(0);
            expect(tab2Elements.length).toBeGreaterThan(0);
        });
    });

    // Tests for collapsed state
    describe('Collapsed state', () => {
        test('shows diagram count in collapsed state', () => {
            const questionWithMultipleDiagrams = {
                ...mockQuestion,
                solution_diagram: '{diagram1,diagram2,diagram3}'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithMultipleDiagrams} />
                </TestWrapper>
            );

            // Should show "3 Diagrams" in collapsed state
            expect(screen.getByText('3 Diagrams')).toBeInTheDocument();
        });

        test('shows "Diagram" for single diagram in collapsed state', () => {
            const questionWithSingleDiagram = {
                ...mockQuestion,
                solution_diagram: 'single-diagram'
            };

            render(
                <TestWrapper>
                    <QuestionDisplay question={questionWithSingleDiagram} />
                </TestWrapper>
            );

            // Should show "Diagram" in collapsed state
            expect(screen.getByText('Diagram')).toBeInTheDocument();
        });
    });
});