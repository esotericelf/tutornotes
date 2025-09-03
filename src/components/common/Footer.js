import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { School } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) => theme.palette.grey[100],
                borderTop: 1,
                borderColor: 'divider',
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        gap: 2,
                    }}
                >
                    {/* Logo and Brand */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <School sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                            Tutor Notes
                        </Typography>
                    </Box>

                    {/* Navigation Links */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 1, sm: 3 },
                            alignItems: 'center',
                        }}
                    >
                        <Link
                            component={RouterLink}
                            to="/"
                            color="text.secondary"
                            underline="hover"
                            sx={{ textDecoration: 'none' }}
                        >
                            Home
                        </Link>
                        <Link
                            component={RouterLink}
                            to="/login"
                            color="text.secondary"
                            underline="hover"
                            sx={{ textDecoration: 'none' }}
                        >
                            Login
                        </Link>

                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Copyright and Legal */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        textAlign: { xs: 'center', sm: 'left' },
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        © {currentYear} Tutor Notes. All rights reserved.
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 3,
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                        }}
                    >

                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
