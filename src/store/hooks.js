import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

// Custom hooks for each slice
export const useAuth = () => {
    const dispatch = useAppDispatch()
    const auth = useAppSelector(state => state.auth)

    return {
        ...auth,
        dispatch,
    }
}

export const useMathPaper = () => {
    const dispatch = useAppDispatch()
    const mathPaper = useAppSelector(state => state.mathPaper)

    return {
        ...mathPaper,
        dispatch,
    }
}

export const useQuiz = () => {
    const dispatch = useAppDispatch()
    const quiz = useAppSelector(state => state.quiz)

    return {
        ...quiz,
        dispatch,
    }
}

export const useUser = () => {
    const dispatch = useAppDispatch()
    const user = useAppSelector(state => state.user)

    return {
        ...user,
        dispatch,
    }
}

export const useDiscussion = () => {
    const dispatch = useAppDispatch()
    const discussion = useAppSelector(state => state.discussion)

    return {
        ...discussion,
        dispatch,
    }
}

export const useUI = () => {
    const dispatch = useAppDispatch()
    const ui = useAppSelector(state => state.ui)

    return {
        ...ui,
        dispatch,
    }
}

export const useDashboard = () => {
    const dispatch = useAppDispatch()
    const dashboard = useAppSelector(state => state.dashboard)

    return {
        ...dashboard,
        dispatch,
    }
}

// Dashboard-specific hooks
export const useDashboardData = () => {
    const dispatch = useAppDispatch()
    const dashboard = useAppSelector(state => state.dashboard)

    const loadUserStats = useCallback((userId) => {
        dispatch({ type: 'dashboard/loadUserStatistics', payload: userId })
    }, [dispatch])

    const loadDashboardData = useCallback((userId) => {
        dispatch({ type: 'dashboard/loadDashboardData', payload: userId })
    }, [dispatch])

    const refreshDashboard = useCallback((userId) => {
        dispatch({ type: 'dashboard/refreshDashboard', payload: userId })
    }, [dispatch])

    const updateProgress = useCallback((userId, progressData) => {
        dispatch({ type: 'dashboard/updateUserProgress', payload: { userId, progressData } })
    }, [dispatch])

    return {
        ...dashboard,
        loadUserStats,
        loadDashboardData,
        refreshDashboard,
        updateProgress,
        dispatch,
    }
}

export const useDashboardStats = () => {
    const userStats = useAppSelector(state => state.dashboard.userStats)
    const quickStats = useAppSelector(state => state.dashboard.dashboardData.quickStats)
    const loading = useAppSelector(state => state.dashboard.loading)
    const errors = useAppSelector(state => state.dashboard.errors)

    return {
        userStats,
        quickStats,
        loading: {
            userStats: loading.userStats,
            quickStats: loading.quickStats,
            anyLoading: loading.userStats || loading.quickStats
        },
        errors: {
            userStats: errors.userStats,
            quickStats: errors.quickStats,
            anyError: !!errors.userStats || !!errors.quickStats
        }
    }
}

export const useDashboardActivity = () => {
    const recentActivity = useAppSelector(state => state.dashboard.dashboardData.recentActivity)
    const popularTags = useAppSelector(state => state.dashboard.dashboardData.popularTags)
    const recommendedPapers = useAppSelector(state => state.dashboard.dashboardData.recommendedPapers)
    const loading = useAppSelector(state => state.dashboard.loading)
    const errors = useAppSelector(state => state.dashboard.errors)

    return {
        recentActivity,
        popularTags,
        recommendedPapers,
        loading: {
            recentActivity: loading.recentActivity,
            popularTags: loading.popularTags,
            recommendedPapers: loading.recommendedPapers,
            anyLoading: loading.recentActivity || loading.popularTags || loading.recommendedPapers
        },
        errors: {
            recentActivity: errors.recentActivity,
            popularTags: errors.popularTags,
            recommendedPapers: errors.recommendedPapers,
            anyError: !!errors.recentActivity || !!errors.popularTags || !!errors.recommendedPapers
        }
    }
}

// Utility hooks
export const useLoading = () => {
    const loadingStates = useAppSelector(state => state.ui.loadingStates)
    const globalLoading = useAppSelector(state => state.ui.globalLoading)

    return {
        globalLoading,
        ...loadingStates,
        anyLoading: Object.values(loadingStates).some(loading => loading) || globalLoading,
    }
}

export const useErrors = () => {
    const errorStates = useAppSelector(state => state.ui.errorStates)
    const globalError = useAppSelector(state => state.ui.globalError)

    return {
        globalError,
        ...errorStates,
        anyError: Object.values(errorStates).some(error => error) || !!globalError,
    }
}

export const useNotifications = () => {
    const dispatch = useAppDispatch()
    const notifications = useAppSelector(state => state.ui.notifications)
    const toasts = useAppSelector(state => state.ui.toasts)

    const addNotification = useCallback((notification) => {
        dispatch({ type: 'ui/addNotification', payload: notification })
    }, [dispatch])

    const removeNotification = useCallback((id) => {
        dispatch({ type: 'ui/removeNotification', payload: id })
    }, [dispatch])

    const addToast = useCallback((toast) => {
        dispatch({ type: 'ui/addToast', payload: toast })
    }, [dispatch])

    const removeToast = useCallback((id) => {
        dispatch({ type: 'ui/removeToast', payload: id })
    }, [dispatch])

    return {
        notifications,
        toasts,
        addNotification,
        removeNotification,
        addToast,
        removeToast,
    }
}

export const useModals = () => {
    const dispatch = useAppDispatch()
    const modals = useAppSelector(state => state.ui.modals)

    const openModal = useCallback((modalName) => {
        dispatch({ type: 'ui/openModal', payload: modalName })
    }, [dispatch])

    const closeModal = useCallback((modalName) => {
        dispatch({ type: 'ui/closeModal', payload: modalName })
    }, [dispatch])

    const closeAllModals = useCallback(() => {
        dispatch({ type: 'ui/closeAllModals' })
    }, [dispatch])

    return {
        modals,
        openModal,
        closeModal,
        closeAllModals,
    }
}

export const useSearch = () => {
    const dispatch = useAppDispatch()
    const search = useAppSelector(state => state.ui)

    const setSearchOpen = useCallback((open) => {
        dispatch({ type: 'ui/setSearchOpen', payload: open })
    }, [dispatch])

    const setSearchQuery = useCallback((query) => {
        dispatch({ type: 'ui/setSearchQuery', payload: query })
    }, [dispatch])

    const clearSearch = useCallback(() => {
        dispatch({ type: 'ui/clearSearch' })
    }, [dispatch])

    return {
        searchOpen: search.searchOpen,
        searchQuery: search.searchQuery,
        searchResults: search.searchResults,
        searchLoading: search.searchLoading,
        setSearchOpen,
        setSearchQuery,
        clearSearch,
    }
}
