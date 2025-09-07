import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
    title = "TutorNote - DSE Math Past Papers for Hong Kong Students",
    description = "Comprehensive DSE Math Past Papers, practice quizzes, and educational resources for Hong Kong students. Access past papers, track progress, and improve your math skills.",
    keywords = "DSE, Math, Past Papers, Hong Kong, Education, Tutoring, Mathematics, HKDSE, Secondary School, Exam Preparation",
    image = "/favicon.svg",
    url = "",
    type = "website",
    author = "TutorNote",
    publishedTime = null,
    modifiedTime = null,
    structuredData = null
}) => {
    const fullUrl = url ? `${process.env.REACT_APP_PRODUCTION_URL || 'https://your-domain.com'}${url}` : (process.env.REACT_APP_PRODUCTION_URL || 'https://your-domain.com');
    const fullImageUrl = image.startsWith('http') ? image : `${process.env.REACT_APP_PRODUCTION_URL || 'https://your-domain.com'}${image}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta name="robots" content="index, follow" />
            <meta name="language" content="en" />
            <meta name="revisit-after" content="7 days" />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:image:alt" content={title} />
            <meta property="og:site_name" content="TutorNote" />
            <meta property="og:locale" content="en_HK" />

            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImageUrl} />
            <meta name="twitter:image:alt" content={title} />
            <meta name="twitter:site" content="@TutorNote" />
            <meta name="twitter:creator" content="@TutorNote" />

            {/* Additional SEO Tags */}
            <meta name="theme-color" content="#6c757d" />
            <meta name="msapplication-TileColor" content="#6c757d" />
            <meta name="apple-mobile-web-app-title" content="TutorNote" />
            <meta name="application-name" content="TutorNote" />

            {/* Structured Data */}
            {structuredData && (
                <>
                    {Array.isArray(structuredData) ? (
                        structuredData.map((data, index) => (
                            <script key={index} type="application/ld+json">
                                {JSON.stringify(data)}
                            </script>
                        ))
                    ) : (
                        <script type="application/ld+json">
                            {JSON.stringify(structuredData)}
                        </script>
                    )}
                </>
            )}
        </Helmet>
    );
};

export default SEOHead;
