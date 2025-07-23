import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import QuestionDisplay from './QuestionDisplay';

const QuestionDisplayDemo = () => {
    const demoQuestion = {
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
        questionDiagram: `<div style="text-align: center; padding: 20px;">
    <svg width="250" height="200" viewBox="0 0 250 200">
        <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
            </marker>
        </defs>

        <!-- Grid lines -->
        <line x1="30" y1="170" x2="220" y2="170" stroke="#ddd" stroke-width="1"/>
        <line x1="30" y1="30" x2="220" y2="30" stroke="#ddd" stroke-width="1"/>
        <line x1="30" y1="30" x2="30" y2="170" stroke="#ddd" stroke-width="1"/>
        <line x1="220" y1="30" x2="220" y2="170" stroke="#ddd" stroke-width="1"/>

        <!-- Axes -->
        <line x1="30" y1="100" x2="220" y2="100" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
        <line x1="125" y1="170" x2="125" y2="30" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>

        <!-- Axis labels -->
        <text x="225" y="105" font-size="12" fill="#333">x</text>
        <text x="120" y="25" font-size="12" fill="#333">y</text>

        <!-- Proper quadratic curve (parabola with one extremum) -->
        <path d="M 30 150 Q 125 30 220 150" stroke="url(#curveGradient)" stroke-width="3" fill="none"/>

        <!-- Key points -->
        <circle cx="125" cy="30" r="4" fill="#ff6b6b"/>
        <text x="130" y="25" font-size="10" fill="#333">(2,-1)</text>

        <circle cx="95" cy="70" r="4" fill="#4ecdc4"/>
        <text x="100" y="65" font-size="10" fill="#333">(1,2)</text>

        <!-- Grid values -->
        <text x="25" y="105" font-size="8" fill="#666">0</text>
        <text x="90" y="105" font-size="8" fill="#666">1</text>
        <text x="120" y="105" font-size="8" fill="#666">2</text>
        <text x="120" y="175" font-size="8" fill="#666">-1</text>
        <text x="120" y="155" font-size="8" fill="#666">0</text>
        <text x="120" y="75" font-size="8" fill="#666">2</text>
    </svg>
    <p style="margin-top: 10px; font-size: 12px; color: #888;">Quadratic curve with minimum at (2,-1) and passing through (1,2)</p>
</div>`,
        solution: `To find the quadratic function from the given properties, we can use the vertex form and then convert to standard form.

Step 1: Use the vertex form since we know the minimum:
Since the function has a minimum at $x = 2$ with value $-1$, the vertex form is:
$f(x) = a(x - 2)^2 - 1$

Step 2: Use the point $(1, 2)$ to find the value of $a$:
$f(1) = 2$ means:
$a(1 - 2)^2 - 1 = 2$
$a(1) - 1 = 2$
$a = 3$

Step 3: Expand to get the standard form:
$f(x) = 3(x - 2)^2 - 1$
$f(x) = 3(x^2 - 4x + 4) - 1$
$f(x) = 3x^2 - 12x + 12 - 1$
$f(x) = 3x^2 - 12x + 11$

Step 4: Check the options:
A) $f(x) = x^2 - 4x + 3$ → $f(1) = 1 - 4 + 3 = 0$ ✗ (should be 2)
B) $f(x) = 2x^2 - 8x + 7$ → $f(1) = 2 - 8 + 7 = 1$ ✗ (should be 2)
C) $f(x) = x^2 - 4x + 5$ → $f(1) = 1 - 4 + 5 = 2$ ✓, $f(2) = 4 - 8 + 5 = 1$ ✗ (should be -1)
D) $f(x) = 2x^2 - 8x + 9$ → $f(1) = 2 - 8 + 9 = 3$ ✗ (should be 2)

None of the given options match exactly. The correct function would be $f(x) = 3x^2 - 12x + 11$.

However, looking at the diagram features:
- The curve is symmetric about $x = 2$
- It passes through $(1, 2)$
- It has a minimum at $(2, -1)$
- The curve opens upward (a > 0)

From the options, Option C is closest as it passes through $(1, 2)$ but has the wrong minimum value.`,
        solutionDiagram: `<div style="text-align: center; padding: 20px;">
    <svg width="250" height="180" viewBox="0 0 250 180">
        <defs>
            <linearGradient id="solutionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4ecdc4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#44a08d;stop-opacity:1" />
            </linearGradient>
        </defs>

        <!-- Solution visualization -->
        <rect x="20" y="20" width="210" height="140" fill="rgba(255,255,255,0.9)" stroke="#ddd" stroke-width="1" rx="5"/>

        <!-- Vertex form -->
        <text x="30" y="45" font-size="12" fill="#333" font-weight="bold">Vertex Form:</text>
        <text x="30" y="65" font-size="14" fill="#667eea">f(x) = a(x - 2)² - 1</text>

        <!-- Point substitution -->
        <text x="30" y="85" font-size="12" fill="#333" font-weight="bold">Using (1,2):</text>
        <text x="30" y="105" font-size="12" fill="#666">f(1) = a(1-2)² - 1 = 2</text>
        <text x="30" y="125" font-size="12" fill="#666">a = 3</text>

        <!-- Final answer -->
        <text x="30" y="145" font-size="12" fill="#333" font-weight="bold">Answer:</text>
        <text x="30" y="165" font-size="14" fill="#4ecdc4" font-weight="bold">f(x) = 3x² - 12x + 11</text>

        <!-- Check marks -->
        <circle cx="200" cy="45" r="8" fill="#4ecdc4"/>
        <text x="200" y="50" font-size="12" fill="white" text-anchor="middle">✓</text>

        <circle cx="200" cy="85" r="8" fill="#4ecdc4"/>
        <text x="200" y="90" font-size="12" fill="white" text-anchor="middle">✓</text>

        <circle cx="200" cy="145" r="8" fill="#ff6b6b"/>
        <text x="200" y="150" font-size="12" fill="white" text-anchor="middle">?</text>
    </svg>
    <p style="margin-top: 10px; font-size: 12px; color: #888;">Solution steps and option verification</p>
</div>`
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <QuestionDisplay question={demoQuestion} />
            </Box>
        </Container>
    );
};

export default QuestionDisplayDemo;