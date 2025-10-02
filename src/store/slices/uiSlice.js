import { createSlice } from '@reduxjs/toolkit'

// Initial state
const initialState = {
    // Navigation state
    currentRoute: '/',
    previousRoute: null,

    // Loading states
    globalLoading: false,
    loadingStates: {
        auth: false,
        mathPaper: false,
        quiz: false,
        user: false,
        discussion: false,
    },

    // Error states
    globalError: null,
    errorStates: {
        auth: null,
        mathPaper: null,
        quiz: null,
        user: null,
        discussion: null,
    },

    // UI state
    sidebarOpen: false,
    theme: 'light',
    language: 'en',

    // Notifications
    notifications: [],

    // Modals
    modals: {
        login: false,
        signup: false,
        profile: false,
        settings: false,
        help: false,
    },

    // Search state
    searchOpen: false,
    searchQuery: '',
    searchResults: [],
    searchLoading: false,

    // Toast notifications
    toasts: [],

    // App state
    appInitialized: false,
    online: navigator.onLine,
}

// UI slice
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Navigation actions
        setCurrentRoute: (state, action) => {
            state.previousRoute = state.currentRoute
            state.currentRoute = action.payload
        },
        setPreviousRoute: (state, action) => {
            state.previousRoute = action.payload
        },

        // Loading actions
        setGlobalLoading: (state, action) => {
            state.globalLoading = action.payload
        },
        setLoadingState: (state, action) => {
            const { key, loading } = action.payload
            state.loadingStates[key] = loading
        },
        clearAllLoadingStates: (state) => {
            state.loadingStates = {
                auth: false,
                mathPaper: false,
                quiz: false,
                user: false,
                discussion: false,
            }
        },

        // Error actions
        setGlobalError: (state, action) => {
            state.globalError = action.payload
        },
        setErrorState: (state, action) => {
            const { key, error } = action.payload
            state.errorStates[key] = error
        },
        clearGlobalError: (state) => {
            state.globalError = null
        },
        clearErrorState: (state, action) => {
            state.errorStates[action.payload] = null
        },
        clearAllErrors: (state) => {
            state.globalError = null
            state.errorStates = {
                auth: null,
                mathPaper: null,
                quiz: null,
                user: null,
                discussion: null,
            }
        },

        // UI actions
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen
        },
        setTheme: (state, action) => {
            state.theme = action.payload
        },
        setLanguage: (state, action) => {
            state.language = action.payload
        },

        // Notification actions
        addNotification: (state, action) => {
            state.notifications.push({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...action.payload,
            })
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(notification => notification.id !== action.payload)
        },
        clearAllNotifications: (state) => {
            state.notifications = []
        },

        // Modal actions
        openModal: (state, action) => {
            state.modals[action.payload] = true
        },
        closeModal: (state, action) => {
            state.modals[action.payload] = false
        },
        closeAllModals: (state) => {
            Object.keys(state.modals).forEach(key => {
                state.modals[key] = false
            })
        },

        // Search actions
        setSearchOpen: (state, action) => {
            state.searchOpen = action.payload
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload
        },
        setSearchResults: (state, action) => {
            state.searchResults = action.payload
        },
        setSearchLoading: (state, action) => {
            state.searchLoading = action.payload
        },
        clearSearch: (state) => {
            state.searchQuery = ''
            state.searchResults = []
            state.searchLoading = false
        },

        // Toast actions
        addToast: (state, action) => {
            state.toasts.push({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...action.payload,
            })
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
        },
        clearAllToasts: (state) => {
            state.toasts = []
        },

        // App state actions
        setAppInitialized: (state, action) => {
            state.appInitialized = action.payload
        },
        setOnline: (state, action) => {
            state.online = action.payload
        },

        // Reset UI state
        resetUI: (state) => {
            return { ...initialState }
        },
    },
})

export const {
    setCurrentRoute,
    setPreviousRoute,
    setGlobalLoading,
    setLoadingState,
    clearAllLoadingStates,
    setGlobalError,
    setErrorState,
    clearGlobalError,
    clearErrorState,
    clearAllErrors,
    setSidebarOpen,
    toggleSidebar,
    setTheme,
    setLanguage,
    addNotification,
    removeNotification,
    clearAllNotifications,
    openModal,
    closeModal,
    closeAllModals,
    setSearchOpen,
    setSearchQuery,
    setSearchResults,
    setSearchLoading,
    clearSearch,
    addToast,
    removeToast,
    clearAllToasts,
    setAppInitialized,
    setOnline,
    resetUI,
} = uiSlice.actions

export default uiSlice.reducer
