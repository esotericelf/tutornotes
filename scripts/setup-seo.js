#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTION_URL = process.env.REACT_APP_PRODUCTION_URL || 'https://your-domain.com';

console.log('🚀 Setting up SEO for TutorNote...\n');

// Update sitemap with production URL
function updateSitemap() {
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');

    if (fs.existsSync(sitemapPath)) {
        let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        sitemapContent = sitemapContent.replace(/https:\/\/your-domain\.com/g, PRODUCTION_URL);
        fs.writeFileSync(sitemapPath, sitemapContent);
        console.log('✅ Updated sitemap.xml with production URL');
    } else {
        console.log('❌ Sitemap not found');
    }
}

// Update robots.txt with production URL
function updateRobotsTxt() {
    const robotsPath = path.join(__dirname, '../public/robots.txt');

    if (fs.existsSync(robotsPath)) {
        let robotsContent = fs.readFileSync(robotsPath, 'utf8');
        robotsContent = robotsContent.replace(/https:\/\/your-domain\.com/g, PRODUCTION_URL);
        fs.writeFileSync(robotsPath, robotsContent);
        console.log('✅ Updated robots.txt with production URL');
    } else {
        console.log('❌ robots.txt not found');
    }
}

// Generate Google Search Console verification file
function generateGoogleVerification() {
    const verificationCode = process.env.GOOGLE_VERIFICATION_CODE;

    if (verificationCode) {
        const verificationPath = path.join(__dirname, '../public/google' + verificationCode + '.html');
        const verificationContent = `google-site-verification: google${verificationCode}.html`;
        fs.writeFileSync(verificationPath, verificationContent);
        console.log('✅ Generated Google Search Console verification file');
    } else {
        console.log('⚠️  GOOGLE_VERIFICATION_CODE not set - skipping verification file generation');
    }
}

// Check for required environment variables
function checkEnvironmentVariables() {
    console.log('\n📋 Environment Variables Check:');

    const requiredVars = [
        'REACT_APP_PRODUCTION_URL',
        'REACT_APP_SUPABASE_URL',
        'REACT_APP_SUPABASE_ANON_KEY'
    ];

    const optionalVars = [
        'GOOGLE_VERIFICATION_CODE',
        'REACT_APP_GOOGLE_ANALYTICS_ID',
        'REACT_APP_GOOGLE_TAG_MANAGER_ID'
    ];

    // Check if analytics is hardcoded in HTML
    const indexHtmlPath = path.join(__dirname, '../public/index.html');
    if (fs.existsSync(indexHtmlPath)) {
        const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
        if (indexContent.includes('G-YVBQQPNEE7')) {
            console.log('✅ Google Analytics: Hardcoded in index.html (G-YVBQQPNEE7)');
        } else {
            console.log('⚠️  Google Analytics: Not found in index.html');
        }
    }

    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`✅ ${varName}: Set`);
        } else {
            console.log(`❌ ${varName}: Not set (REQUIRED)`);
        }
    });

    optionalVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`✅ ${varName}: Set`);
        } else {
            console.log(`⚠️  ${varName}: Not set (Optional)`);
        }
    });
}

// Generate SEO report
function generateSEOReport() {
    console.log('\n📊 SEO Implementation Report:');

    const files = [
        { path: 'public/sitemap.xml', name: 'XML Sitemap' },
        { path: 'public/robots.txt', name: 'Robots.txt' },
        { path: 'src/components/common/SEOHead.js', name: 'SEO Head Component' },
        { path: 'src/utils/structuredData.js', name: 'Structured Data Utils' },
        { path: 'src/config/seo.js', name: 'SEO Configuration' },
        { path: 'src/utils/performance.js', name: 'Performance Utils' }
    ];

    files.forEach(file => {
        const fullPath = path.join(__dirname, '..', file.path);
        if (fs.existsSync(fullPath)) {
            console.log(`✅ ${file.name}: Implemented`);
        } else {
            console.log(`❌ ${file.name}: Missing`);
        }
    });
}

// Main execution
function main() {
    console.log(`Production URL: ${PRODUCTION_URL}\n`);

    updateSitemap();
    updateRobotsTxt();
    generateGoogleVerification();
    checkEnvironmentVariables();
    generateSEOReport();

    console.log('\n🎉 SEO setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Deploy your application to production');
    console.log('2. Submit your sitemap to Google Search Console');
    console.log('3. Submit your sitemap to Bing Webmaster Tools');
    console.log('4. Set up Google Analytics');
    console.log('5. Follow the SEO_SUBMISSION_GUIDE.md for detailed instructions');
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };
