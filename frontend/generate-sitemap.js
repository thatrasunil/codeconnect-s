const fs = require('fs');
const path = require('path');

// Base URL of your production site
const BASE_URL = 'https://codeconnect-s.vercel.app';

// Static routes
const staticRoutes = [
    '/',
    '/login',
    '/signup',
    '/leaderboard',
    '/problems',
    '/teams',
    '/chat',
    // Legal & Compliance Pages
    '/privacy',
    '/terms',
    '/contact',
    '/about',
    '/cookie-policy',
    '/disclaimer',
    // Blog Index
    '/blog'
];

// Generate the 23 blog post routes dynamically
const blogRoutes = Array.from({ length: 23 }, (_, i) => `/blog/${i + 1}`);

// Combine all routes
const allRoutes = [...staticRoutes, ...blogRoutes];

// Generate XML content for the sitemap
const generateSitemapXml = () => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    allRoutes.forEach(route => {
        // Priority logic: High (1.0) for root, medium (0.8) for important static/legal, low (0.5) for hidden blogs
        let priority = '0.5';
        if (route === '/') priority = '1.0';
        else if (staticRoutes.includes(route)) priority = '0.8';

        // Add each URL block
        xml += '  <url>\n';
        xml += `    <loc>${BASE_URL}${route}</loc>\n`;
        // For AdSense, having a somewhat recent modified date is helpful
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
};

// Write the sitemap to the frontend/public folder
const writeSitemap = () => {
    const sitemapContent = generateSitemapXml();
    // Assuming this script is run from the 'frontend' directory
    const publicDir = path.join(__dirname, 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');

    try {
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
        console.log(`\x1b[32mSuccessfully generated sitemap.xml with ${allRoutes.length} routes at:\x1b[0m ${sitemapPath}`);
        console.log(`Don't forget to submit this sitemap in Google Search Console!`);
    } catch (err) {
        console.error('Error writing sitemap.xml:', err);
    }
};

writeSitemap();
