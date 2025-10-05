import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import mathPaperSlice from './slices/mathPaperSlice'
import quizSlice from './slices/quizSlice'
import userSlice from './slices/userSlice'
import discussionSlice from './slices/discussionSlice'
import uiSlice from './slices/uiSlice'
import dashboardSlice from './slices/dashboardSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        mathPaper: mathPaperSlice,
        quiz: quizSlice,
        user: userSlice,
        discussion: discussionSlice,
        ui: uiSlice,
        dashboard: dashboardSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                ignoredPaths: ['auth.session', 'auth.user'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
})

// TypeScript type exports (for use in .ts files)
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch
