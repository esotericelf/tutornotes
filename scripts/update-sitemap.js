#!/usr/bin/env node

/**
 * Quick Sitemap Update Script
 * Use this script to quickly update your sitemap when Supabase data changes
 *
 * Usage: node scripts/update-sitemap.js
 */

const { generateDynamicSitemap } = require('./generate-dynamic-sitemap-db');

async function updateSitemap() {
    console.log('🔄 Updating sitemap with latest database data...\n');

    try {
        await generateDynamicSitemap();
        console.log('\n🎉 Sitemap updated successfully!');
        console.log('📝 Your sitemap now reflects the latest data from Supabase.');
        console.log('🚀 Ready for deployment or search engine submission.');
    } catch (error) {
        console.error('\n❌ Failed to update sitemap:', error.message);
        console.log('💡 Make sure your Supabase connection is working.');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    updateSitemap();
}

module.exports = { updateSitemap };
