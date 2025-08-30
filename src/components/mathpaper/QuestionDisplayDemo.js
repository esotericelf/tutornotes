import React from 'react';
import { Container, Box } from '@mui/material';
import QuestionDisplay from './QuestionDisplay';

const QuestionDisplayDemo = () => {
    const demoQuestion = {
        id: 2,
        year: 2022,
        paper: 'II',
        question_no: 40,
        question: "A quadratic function $f(x) = ax^2 + bx + c$ has the following properties: it passes through point $(1, 2)$ and has a minimum value of $-1$ at $x = 2$. Given that $a > 0$, which of the following could be the correct function?",
        options: [
            "$f(x) = x^2 - 4x + 3$",
            "$f(x) = 2x^2 - 8x + 7$",
            "$f(x) = x^2 - 4x + 5$",
            "$f(x) = 2x^2 - 8x + 9$"
        ],
        question_diagram: '<iframe scrolling="no" title="2012 II 16" src="https://www.geogebra.org/material/iframe/id/m9dbbwjd/width/1440/height/783/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false" width="1440px" height="783px" style="border:0px;"> </iframe>',
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
        solution_diagram: [
            '<iframe scrolling="no" title="2022 II 40 b" src="https://www.geogebra.org/material/iframe/id/zfca7f9w/width/490/height/420/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false" width="490px" height="420px" style="border:0px;"> </iframe>',
            '<iframe scrolling="no" title="2022 II 40 a" src="https://www.geogebra.org/material/iframe/id/gjswuyg8/width/490/height/420/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/true/ctl/false" width="490px" height="420px" style="border:0px;"> </iframe>'
        ]
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