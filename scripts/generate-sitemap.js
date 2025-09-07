const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.REACT_APP_PRODUCTION_URL || 'https://your-domain.com';
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

// Define your site structure
const pages = [
    {
        url: '/',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '1.0'
    },
    {
        url: '/login',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.8'
    },
    {
        url: '/mathpaper',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.9'
    },
    {
        url: '/question-demo',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7'
    },
    {
        url: '/quiz/take',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8'
    },
    {
        url: '/quiz/results',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.6'
    },
    {
        url: '/dashboard',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.7'
    }
];

// Generate XML sitemap
function generateSitemap() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    pages.forEach(page => {
        sitemap += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    sitemap += '</urlset>';

    // Write sitemap to file
    fs.writeFileSync(SITEMAP_PATH, sitemap);
    console.log(`Sitemap generated successfully at ${SITEMAP_PATH}`);
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Pages included: ${pages.length}`);
}

// Run if called directly
if (require.main === module) {
    generateSitemap();
}

module.exports = { generateSitemap, pages };
