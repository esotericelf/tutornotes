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
    ListItemText
} from '@mui/material'
import {
    School,
    PlayCircleOutline,
    Language,
    Translate,
    LanguageOutlined
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
import { useTranslation } from '../../hooks/useTranslation'

const AppBar = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { t, changeLanguage, getCurrentLanguage, getAvailableLanguages } = useTranslation()

    const [languageMenuAnchor, setLanguageMenuAnchor] = React.useState(null)
    const open = Boolean(languageMenuAnchor)

    const handleTitleClick = () => {
        navigate('/')
    }

    const handleSignInClick = () => {
        navigate('/login')
    }

    const handleLanguageToggle = (event) => {
        setLanguageMenuAnchor(event.currentTarget)
    }

    const handleLanguageSelect = async (language) => {
        await changeLanguage(language)
        setLanguageMenuAnchor(null)
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
