#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator with Database Integration
 * This script generates a sitemap by fetching real data from Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

// Configuration
const BASE_URL = process.env.REACT_APP_PRODUCTION_URL || 'https://tutornotes.com.hk';
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

// Supabase connection
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please check your .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Static pages (always included)
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

// Fetch popular tags from database
async function fetchPopularTags() {
    try {
        console.log('🏷️  Fetching popular tags from database...');
        const { data: popularTags, error } = await supabase
            .rpc('get_popular_math_paper_tags', { limit_count: 50 });

        if (error) {
            console.error('❌ Error fetching popular tags:', error);
            return [];
        }

        console.log(`✅ Found ${popularTags.length} popular tags`);
        return popularTags.map(tag => ({
            url: `/DSE_Math/tag/${encodeURIComponent(tag.tag)}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7'
        }));
    } catch (error) {
        console.error('❌ Unexpected error fetching tags:', error);
        return [];
    }
}

// Fetch math papers and questions from database
async function fetchMathPapers() {
    try {
        console.log('📚 Fetching math papers from database...');

        // Get all unique year/paper combinations
        const { data: papers, error } = await supabase
            .from('Math_Past_Paper')
            .select('year, paper')
            .order('year', { ascending: false })
            .order('paper', { ascending: true });

        if (error) {
            console.error('❌ Error fetching papers:', error);
            return [];
        }

        // Get unique combinations
        const uniquePapers = new Map();
        papers.forEach(paper => {
            const key = `${paper.year}/${paper.paper}`;
            if (!uniquePapers.has(key)) {
                uniquePapers.set(key, paper);
            }
        });

        const pages = [];

        // Add year/paper combination pages
        uniquePapers.forEach(paper => {
            pages.push({
                url: `/DSE_Math/${paper.year}/${paper.paper}`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: '0.8'
            });
        });

        // Get all individual questions
        const { data: questions, error: questionsError } = await supabase
            .from('Math_Past_Paper')
            .select('year, paper, question_no')
            .order('year', { ascending: false })
            .order('paper', { ascending: true })
            .order('question_no', { ascending: true });

        if (questionsError) {
            console.error('❌ Error fetching questions:', questionsError);
        } else {
            // Add individual question pages
            questions.forEach(question => {
                pages.push({
                    url: `/DSE_Math/${question.year}/${question.paper}/${question.question_no}`,
                    lastmod: new Date().toISOString().split('T')[0],
                    changefreq: 'monthly',
                    priority: '0.7'
                });
            });
        }

        console.log(`✅ Found ${uniquePapers.size} unique papers and ${questions?.length || 0} questions`);
        return pages;
    } catch (error) {
        console.error('❌ Unexpected error fetching papers:', error);
        return [];
    }
}

// Generate XML sitemap
function generateSitemap(allPages) {
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
    return allPages.length;
}

// Main function
async function generateDynamicSitemap() {
    console.log('🚀 Starting dynamic sitemap generation...');
    console.log(`📊 Base URL: ${BASE_URL}`);
    console.log(`📄 Static pages: ${staticPages.length}`);

    try {
        // Fetch data from database
        const [tagPages, mathPaperPages] = await Promise.all([
            fetchPopularTags(),
            fetchMathPapers()
        ]);

        // Combine all pages
        const allPages = [...staticPages, ...tagPages, ...mathPaperPages];

        // Generate sitemap
        const totalPages = generateSitemap(allPages);

        console.log('\n✅ Dynamic sitemap generated successfully!');
        console.log(`📊 Base URL: ${BASE_URL}`);
        console.log(`📄 Static pages: ${staticPages.length}`);
        console.log(`🏷️  Tag pages: ${tagPages.length}`);
        console.log(`📚 Math paper pages: ${mathPaperPages.length}`);
        console.log(`📈 Total pages: ${totalPages}`);
        console.log(`📁 Sitemap saved to: ${SITEMAP_PATH}`);

    } catch (error) {
        console.error('❌ Error generating dynamic sitemap:', error);

        // Fallback to static sitemap
        console.log('🔄 Falling back to static sitemap...');
        const totalPages = generateSitemap(staticPages);
        console.log(`✅ Static sitemap generated with ${totalPages} pages`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    generateDynamicSitemap();
}

module.exports = { generateDynamicSitemap, fetchPopularTags, fetchMathPapers };
