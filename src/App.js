import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './components/home/HomePage'
import LoginPage from './components/auth/LoginPage'
import Dashboard from './components/dashboard/Dashboard'
import ProtectedRoute from './components/auth/ProtectedRoute'
import MathPaperPage from './components/mathpaper/MathPaperPage'
import QuestionDisplayDemo from './components/mathpaper/QuestionDisplayDemo'
import { QuizTaker, QuizResults } from './components/quiz'

import './App.css'

// Create Material-UI theme with light color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6c757d',
      light: '#adb5bd',
      dark: '#495057',
    },
    secondary: {
      main: '#dee2e6',
      light: '#f8f9fa',
      dark: '#ced4da',
    },
    background: {
      default: '#ffffff',
      paper: '#f8f9fa',
    },
    text: {
      primary: '#495057',
      secondary: '#6c757d',
    },
    divider: '#dee2e6',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#495057',
    },
    h6: {
      fontWeight: 500,
      color: '#495057',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
        contained: {
          backgroundColor: '#6c757d',
          '&:hover': {
            backgroundColor: '#495057',
          },
        },
        outlined: {
          borderColor: '#dee2e6',
          color: '#6c757d',
          '&:hover': {
            borderColor: '#adb5bd',
            backgroundColor: '#f8f9fa',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#495057',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6',
          color: '#6c757d',
        },
        outlined: {
          borderColor: '#dee2e6',
          color: '#6c757d',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '56px',
          '@media (min-width: 600px)': {
            minHeight: '64px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '16px', // Prevents zoom on iOS
            '@media (min-width: 600px)': {
              fontSize: '1rem',
            },
          },
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/mathpaper" element={<MathPaperPage />} />
              <Route path="/question-demo" element={<QuestionDisplayDemo />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Quiz Routes */}
              <Route
                path="/quiz/take"
                element={
                  <ProtectedRoute>
                    <QuizTaker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/results"
                element={
                  <ProtectedRoute>
                    <QuizResults />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
