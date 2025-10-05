import React from 'react'
import { Box } from '@mui/material'
import AppBar from './AppBar'

const Layout = ({ children }) => {
    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
            <AppBar />
            {children}
        </Box>
    )
}

export default Layout
