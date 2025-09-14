const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.REACT_APP_PRODUCTION_URL || 'https://tutornotes.com.hk';
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

// Static pages (public only - no quiz or dashboard)
const staticPages = [
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
        url: '/DSE_Math',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.9'
    },
    {
        url: '/changelog',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.6'
    }
];

// Sample popular tags (in production, fetch from database)
const popularTags = [
    'factor_method', 'roots', 'quadratic_formula', 'domain', 'range',
    'sine', 'cosine', 'tangent', 'conditional_probability', 'arithmetic_sequence',
    'geometric_sequence', 'quadratic_inequalities', 'chords', 'standard_deviation',
    'permutation_notation', 'combination_notation', 'direct_variation', 'inverse_variation',
    'trigonometry', 'algebra', 'geometry', 'calculus', 'statistics', 'probability',
    'functions', 'graphs', 'equations', 'inequalities', 'sequences', 'series',
    'circles', 'triangles', 'polynomials', 'logarithms', 'exponentials'
];

// Generate tag pages
function generateTagPages() {
    return popularTags.map(tag => ({
        url: `/DSE_Math/tag/${encodeURIComponent(tag)}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.7'
    }));
}

// Sample math paper questions (in production, fetch from database)
function generateMathPaperPages() {
    const pages = [];
    const years = [2020, 2021, 2022, 2023, 2024];
    const papers = ['I', 'II'];

    years.forEach(year => {
        papers.forEach(paper => {
            // Add year/paper combination page
            pages.push({
                url: `/DSE_Math/${year}/${paper}`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: '0.8'
            });

            // Add individual questions (sample 1-5 for each paper)
            for (let questionNo = 1; questionNo <= 5; questionNo++) {
                pages.push({
                    url: `/DSE_Math/${year}/${paper}/${questionNo}`,
                    lastmod: new Date().toISOString().split('T')[0],
                    changefreq: 'monthly',
                    priority: '0.7'
                });
            }
        });
    });

    return pages;
}

// Generate XML sitemap
function generateSitemap() {
    const tagPages = generateTagPages();
    const mathPaperPages = generateMathPaperPages();
    const allPages = [...staticPages, ...tagPages, ...mathPaperPages];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    allPages.forEach(page => {
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
    console.log(`✅ Dynamic sitemap generated successfully at ${SITEMAP_PATH}`);
    console.log(`📊 Base URL: ${BASE_URL}`);
    console.log(`📄 Static pages: ${staticPages.length}`);
    console.log(`🏷️  Tag pages: ${tagPages.length}`);
    console.log(`📚 Math paper pages: ${mathPaperPages.length}`);
    console.log(`📈 Total pages: ${allPages.length}`);
}

// Run if called directly
if (require.main === module) {
    generateSitemap();
}

module.exports = { generateSitemap, staticPages, generateTagPages, generateMathPaperPages };
