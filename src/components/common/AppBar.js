import React from 'react'
import {
    AppBar as MuiAppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material'
import {
    School,
    PlayCircleOutline,
    Language
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks'

const AppBar = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleTitleClick = () => {
        navigate('/')
    }

    const handleSignInClick = () => {
        navigate('/login')
    }

    const handleLanguageToggle = () => {
        // TODO: Implement language toggle functionality
        console.log('Language toggle clicked')
    }

    return (
        <MuiAppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid',
                borderColor: '#dee2e6',
                color: '#495057'
            }}
        >
            <Toolbar sx={{
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                minHeight: { xs: 56, sm: 64 },
                py: { xs: 1, sm: 0 }
            }}>
                {/* Left side - Logo and Title */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexGrow: 1,
                    cursor: 'pointer'
                }} onClick={handleTitleClick}>
                    <School sx={{
                        fontSize: { xs: 24, sm: 32 },
                        color: 'primary.main',
                        mr: { xs: 1, sm: 2 }
                    }} />
                    <Typography
                        variant={isMobile ? "h6" : "h5"}
                        component="h1"
                        color="primary"
                        fontWeight="bold"
                        sx={{
                            fontSize: { xs: '1.1rem', sm: '1.5rem' }
                        }}
                    >
                        Tutornotes
                    </Typography>
                </Box>

                {/* Right side - Language Toggle, Demo, Sign In */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 },
                    flexWrap: 'wrap'
                }}>
                    {/* Language Toggle */}
                    <IconButton
                        onClick={handleLanguageToggle}
                        color="primary"
                        size="small"
                        sx={{
                            minWidth: 'auto',
                            px: 1
                        }}
                    >
                        <Language />
                    </IconButton>

                    {/* Demo Button */}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PlayCircleOutline />}
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            minWidth: 'auto',
                            px: 2
                        }}
                    >
                        Demo
                    </Button>

                    {/* Sign In Button */}
                    {!user && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleSignInClick}
                            sx={{
                                minWidth: 'auto',
                                px: 2
                            }}
                        >
                            Sign In
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </MuiAppBar>
    )
}

export default AppBar
