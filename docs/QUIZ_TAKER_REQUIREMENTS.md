# QuizTaker Component Requirements

## 🚫 **What NOT to Show During Quiz**
1. **NO solutions** - Hide all solution content
2. **NO correct answers** - Don't reveal which option is correct
3. **NO solution diagrams** - Hide until after submission

## ✅ **What TO Show During Quiz**
1. **Question text** with LaTeX support
2. **Multiple choice options** (A, B, C, D)
3. **Question diagrams** (GeoGebra iframes)
4. **Option diagrams** (if they exist)
5. **Progress tracking**
6. **Timer countdown**

## 🔧 **Key Features Needed**

### 1. **Answer Selection**
- Radio buttons for A, B, C, D
- Visual feedback when option selected
- Store answers in state (don't submit until end)

### 2. **Navigation**
- Previous/Next buttons
- Question counter (e.g., "Question 3 of 10")
- Progress bar showing completion percentage

### 3. **Timer**
- Countdown timer
- Pause/Resume functionality
- Auto-submit when time runs out

### 4. **Diagram Handling**
- **FIX OVERFLOW**: Set fixed height (300px) and width (100%)
- Add borders and rounded corners
- Ensure responsive scaling
- Handle both iframe and GeoGebra URLs

### 5. **Quiz Flow**
- Start button to begin
- Submit button to finish
- Confirmation dialog before submission
- Navigate to results page after submission

## 📱 **Responsive Design**
- Mobile-friendly layout
- Proper spacing and typography
- Touch-friendly buttons
- Responsive diagrams

## 🔗 **Integration Points**
- Use existing `quizService` for data
- Use existing `AuthContext` for user info
- Navigate to results page with quiz data
- Pass answers and timing to results component

## 🎯 **After Submission**
- Navigate to `/quiz/{id}/results`
- Pass quiz data, answers, and timing
- Use existing solution component from MathPaperPage.js
- Show correct answers and explanations

## 🐛 **Fix Diagram Overflow**
Current issue: Diagrams are overflowing and look ugly
Solution:
- Set fixed dimensions (width: 100%, height: 300px)
- Add overflow: hidden
- Add borders and rounded corners
- Ensure responsive scaling

## 📝 **Code Structure**
```jsx
const QuizTaker = () => {
  // State for quiz data, current question, answers, timer
  // Load quiz on mount
  // Timer countdown effect
  // Navigation handlers
  // Answer selection handlers
  // Submit handlers

  return (
    // Quiz header with title, description, timer, controls
    // Progress bar
    // Question navigation
    // Question display (text + diagram)
    // Multiple choice options
    // Submit dialog
    // Start quiz instructions
  );
};
```

## 🎨 **Design Guidelines**
- Inherit parent Material-UI theme
- Use consistent spacing and colors
- Gradient backgrounds for sections
- Clear visual hierarchy
- Professional, clean appearance
