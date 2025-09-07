// Structured Data utilities for SEO

export const createWebsiteStructuredData = () => {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TutorNote",
        "description": "Comprehensive DSE Math Past Papers, practice quizzes, and educational resources for Hong Kong students",
        "url": process.env.REACT_APP_PRODUCTION_URL || "https://your-domain.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${process.env.REACT_APP_PRODUCTION_URL || "https://your-domain.com"}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        },
        "publisher": {
            "@type": "Organization",
            "name": "TutorNote",
            "url": process.env.REACT_APP_PRODUCTION_URL || "https://your-domain.com",
            "logo": {
                "@type": "ImageObject",
                "url": `${process.env.REACT_APP_PRODUCTION_URL || "https://your-domain.com"}/favicon.svg`
            }
        }
    };
};

export const createOrganizationStructuredData = () => {
    return {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "TutorNote",
        "description": "Online platform providing DSE Math past papers and educational resources for Hong Kong students",
        "url": process.env.REACT_APP_PRODUCTION_URL || "https://your-domain.com",
        "logo": `${process.env.REACT_APP_PRODUCTION_URL || "https://your-domain.com"}/favicon.svg`,
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "HK"
        },
        "sameAs": [
            // Add your social media URLs here
            // "https://www.facebook.com/tutornote",
            // "https://www.instagram.com/tutornote",
            // "https://twitter.com/tutornote"
        ]
    };
};

export const createCourseStructuredData = (courseData) => {
    return {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": courseData.name || "DSE Math Past Papers",
        "description": courseData.description || "Comprehensive collection of DSE Mathematics past papers for Hong Kong students",
        "provider": {
            "@type": "EducationalOrganization",
            "name": "TutorNote",
            "url": process.env.REACT_APP_PRODUCTION_URL || "https://your-domain.com"
        },
        "courseMode": "online",
        "educationalLevel": "Secondary",
        "inLanguage": "en",
        "isAccessibleForFree": true,
        "audience": {
            "@type": "EducationalAudience",
            "educationalRole": "student"
        }
    };
};

export const createBreadcrumbStructuredData = (breadcrumbs) => {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url
        }))
    };
};

export const createFAQStructuredData = (faqs) => {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
};
