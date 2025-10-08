import React from 'react'
import {
    AppBar as MuiAppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    useTheme,
    useMediaQuery,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress
} from '@mui/material'
import {
    School,
    PlayCircleOutline,
    Language,
    Translate,
    LanguageOutlined
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
import { signOut } from '../../store/slices/authSlice'
import { useTranslation } from '../../hooks/useTranslation'

const AppBar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, loading, dispatch } = useAuth()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { t, changeLanguage, getCurrentLanguage, getAvailableLanguages } = useTranslation()


    // Use a stable state to prevent flashing
    const [showSignIn, setShowSignIn] = React.useState(false)

    React.useEffect(() => {
        if (!loading) {
            setShowSignIn(!user)
        }
    }, [user, loading])

    const [languageMenuAnchor, setLanguageMenuAnchor] = React.useState(null)
    const open = Boolean(languageMenuAnchor)

    const handleTitleClick = () => {
        navigate('/')
    }

    const handleSignInClick = () => {
        navigate('/login')
    }

    const handleSignOutClick = async () => {
        try {
            await dispatch(signOut())
            navigate('/')
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    const handleDemoClick = () => {
        navigate('/DSE_Math')
    }

    const handleLanguageToggle = (event) => {
        setLanguageMenuAnchor(event.currentTarget)
    }

    // Function to parse question parameters from URL pathname
    const parseQuestionParamsFromPath = (pathname) => {
        // Match patterns like /DSE_Math/2013/II/2 or /DSE_Math/2013/II/2/zh
        const match = pathname.match(/^\/DSE_Math\/(\d{4})\/([I]+)\/(\d+)(?:\/([a-z]{2}))?$/);
        if (match) {
            const [, year, paper, questionNo] = match;
            return {
                year: parseInt(year, 10),
                paper: paper,
                questionNo: parseInt(questionNo, 10)
            };
        }
        return null;
    };

    const handleLanguageSelect = async (language) => {
        // Check if we're on a direct question URL by parsing the pathname
        const questionParams = parseQuestionParamsFromPath(location.pathname);

        if (questionParams) {
            // We're on a direct question URL, preserve the question parameters and add language
            const newURL = `/DSE_Math/${questionParams.year}/${questionParams.paper}/${questionParams.questionNo}/${language}`;
            navigate(newURL);
        } else {
            // Regular language toggle for other pages
            await changeLanguage(language);
        }
        setLanguageMenuAnchor(null);
    }

    const handleCloseLanguageMenu = () => {
        setLanguageMenuAnchor(null)
    }

    const getLanguageDisplayName = (lang) => {
        switch (lang) {
            case 'en':
                return 'English'
            case 'zh':
                return '中文'
            default:
                return lang
        }
    }

    const getLanguageIcon = (lang) => {
        switch (lang) {
            case 'en':
                return <LanguageOutlined />
            case 'zh':
                return <Translate />
            default:
                return <Language />
        }
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
                        {t('app.title')}
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
                        aria-label="Select language"
                        aria-controls={open ? 'language-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        {getLanguageIcon(getCurrentLanguage())}
                    </IconButton>

                    {/* Language Menu */}
                    <Menu
                        id="language-menu"
                        anchorEl={languageMenuAnchor}
                        open={open}
                        onClose={handleCloseLanguageMenu}
                        MenuListProps={{
                            'aria-labelledby': 'language-button',
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {getAvailableLanguages().map((language) => (
                            <MenuItem
                                key={language}
                                onClick={() => handleLanguageSelect(language)}
                                selected={getCurrentLanguage() === language}
                            >
                                <ListItemIcon>
                                    {getLanguageIcon(language)}
                                </ListItemIcon>
                                <ListItemText>
                                    {getLanguageDisplayName(language)}
                                </ListItemText>
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* Demo Button */}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PlayCircleOutline />}
                        onClick={handleDemoClick}
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            minWidth: 'auto',
                            px: 2
                        }}
                    >
                        Demo
                    </Button>

                    {/* Sign In/Sign Out Button or Loading */}
                    {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                            <CircularProgress size={20} />
                        </Box>
                    ) : showSignIn ? (
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
                    ) : user ? (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleSignOutClick}
                            sx={{
                                minWidth: 'auto',
                                px: 2
                            }}
                        >
                            Sign Out
                        </Button>
                    ) : null}
                </Box>
            </Toolbar>
        </MuiAppBar>
    )
}

export default AppBar
