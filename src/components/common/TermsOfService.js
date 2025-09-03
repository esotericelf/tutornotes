import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import { ArrowBack, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <AppBar position="static" elevation={0}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleBack}
                        aria-label="Go back"
                        sx={{ mr: 2 }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <School sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Terms of Service
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                        Terms of Service
                    </Typography>

                    <Typography variant="body1" paragraph>
                        <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Welcome to Tutor Notes. These Terms of Service ("Terms") govern your use of our educational application
                        and services. By accessing or using Tutor Notes, you agree to be bound by these Terms.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        1. Acceptance of Terms
                    </Typography>

                    <Typography variant="body1" paragraph>
                        By accessing or using Tutor Notes, you agree to be bound by these Terms. If you do not agree to these Terms,
                        you must not use our application. These Terms apply to all users, visitors, and others who access or use the service.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        2. Description of Service
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Tutor Notes is an educational application that provides:
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemText primary="• Access to educational materials and resources" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Interactive learning tools and exercises" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• User authentication and account management" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Social learning features and discussions" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Progress tracking and personalized learning paths" />
                        </ListItem>
                    </List>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        3. User Accounts and Registration
                    </Typography>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, mb: 1 }}>
                        3.1 Account Creation
                    </Typography>
                    <Typography variant="body1" paragraph>
                        To access certain features of Tutor Notes, you must create an account. You agree to:
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemText primary="• Provide accurate, current, and complete information" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Maintain and update your account information" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Keep your account credentials secure and confidential" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Accept responsibility for all activities under your account" />
                        </ListItem>
                    </List>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, mb: 1 }}>
                        3.2 Account Security
                    </Typography>
                    <Typography variant="body1" paragraph>
                        You are responsible for maintaining the confidentiality of your account and password.
                        You agree to notify us immediately of any unauthorized use of your account.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        4. Acceptable Use Policy
                    </Typography>

                    <Typography variant="body1" paragraph>
                        You agree to use Tutor Notes only for lawful purposes and in accordance with these Terms. You agree not to:
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemText primary="• Use the service for any illegal or unauthorized purpose" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Violate any applicable laws or regulations" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Infringe upon the rights of others" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Upload, post, or transmit harmful, offensive, or inappropriate content" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Attempt to gain unauthorized access to our systems" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Interfere with or disrupt the service" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="• Use automated systems to access the service without permission" />
                        </ListItem>
                    </List>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        5. Intellectual Property Rights
                    </Typography>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, mb: 1 }}>
                        5.1 Our Content
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Tutor Notes and its original content, features, and functionality are owned by us and are protected by
                        international copyright, trademark, patent, trade secret, and other intellectual property laws.
                    </Typography>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, mb: 1 }}>
                        5.2 User Content
                    </Typography>
                    <Typography variant="body1" paragraph>
                        You retain ownership of any content you submit, post, or display on Tutor Notes. By submitting content,
                        you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content.
                    </Typography>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, mb: 1 }}>
                        5.3 Third-Party Content
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Our service may contain links to third-party websites or services. We are not responsible for the content
                        or privacy practices of these third-party sites.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        6. Privacy and Data Protection
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Your privacy is important to us. Our collection and use of personal information is governed by our
                        Privacy Policy, which is incorporated into these Terms by reference.
                    </Typography>

                    <Typography variant="body1" paragraph>
                        By using Tutor Notes, you consent to the collection and use of information as outlined in our Privacy Policy.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        7. Service Availability and Modifications
                    </Typography>

                    <Typography variant="body1" paragraph>
                        We strive to provide reliable and uninterrupted service, but we do not guarantee that Tutor Notes will be
                        available at all times. We may modify, suspend, or discontinue the service at any time without notice.
                    </Typography>

                    <Typography variant="body1" paragraph>
                        We reserve the right to update or change these Terms at any time. We will notify users of any material
                        changes by posting the new Terms on this page.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        8. Disclaimers and Limitations of Liability
                    </Typography>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, mb: 1 }}>
                        8.1 Educational Content
                    </Typography>
                    <Typography variant="body1" paragraph>
                        While we strive to provide accurate and up-to-date educational content, we do not guarantee the accuracy,
                        completeness, or usefulness of any information on Tutor Notes. Educational content is provided "as is"
                        without warranties of any kind.
                    </Typography>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, mb: 1 }}>
                        8.2 Service Availability
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We do not guarantee that Tutor Notes will be error-free, secure, or uninterrupted. We are not liable for
                        any damages resulting from the use or inability to use our service.
                    </Typography>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, mb: 1 }}>
                        8.3 Limitation of Liability
                    </Typography>
                    <Typography variant="body1" paragraph>
                        In no event shall Tutor Notes be liable for any indirect, incidental, special, consequential, or punitive
                        damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        9. Indemnification
                    </Typography>

                    <Typography variant="body1" paragraph>
                        You agree to defend, indemnify, and hold harmless Tutor Notes and its officers, directors, employees,
                        and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising
                        from your use of the service or violation of these Terms.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        10. Termination
                    </Typography>

                    <Typography variant="body1" paragraph>
                        We may terminate or suspend your account and access to Tutor Notes immediately, without prior notice,
                        for any reason, including without limitation if you breach these Terms.
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Upon termination, your right to use the service will cease immediately. All provisions of these Terms
                        which by their nature should survive termination shall survive termination.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        11. Governing Law and Dispute Resolution
                    </Typography>

                    <Typography variant="body1" paragraph>
                        These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                        without regard to its conflict of law provisions.
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Any disputes arising from these Terms or your use of Tutor Notes shall be resolved through binding
                        arbitration in accordance with the rules of [Arbitration Organization].
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        12. Severability
                    </Typography>

                    <Typography variant="body1" paragraph>
                        If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck
                        and the remaining provisions shall be enforced to the fullest extent under law.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        13. Entire Agreement
                    </Typography>

                    <Typography variant="body1" paragraph>
                        These Terms constitute the entire agreement between you and Tutor Notes regarding the use of our service,
                        superseding any prior agreements between you and Tutor Notes.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                        14. Contact Information
                    </Typography>

                    <Typography variant="body1" paragraph>
                        If you have any questions about these Terms of Service, please contact us:
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemText
                                primary="• Email: legal@tutornotes.com"
                                secondary="For legal and compliance inquiries"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="• Support: support@tutornotes.com"
                                secondary="For general application support"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="• Address: [Your Business Address]"
                                secondary="For formal legal correspondence"
                            />
                        </ListItem>
                    </List>

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Thank you for using Tutor Notes. We're committed to providing you with the best educational experience possible.
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default TermsOfService;
