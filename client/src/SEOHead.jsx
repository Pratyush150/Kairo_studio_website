import { Helmet, HelmetProvider } from 'react-helmet-async';

const SEOHead = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://kairostudio.in/#organization",
        "name": "Kairo Studio",
        "url": "https://kairostudio.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://kairostudio.in/logo.png"
        },
        "description": "Marketing & Automation Agency specializing in SaaS Development, Business Automation, Performance Marketing, and Digital Strategy",
        "email": "support@kairostudio.in",
        "telephone": "+91-866-884-4178",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressLocality": "India"
        },
        "sameAs": [
          "https://www.instagram.com/kairo_studio_official",
          "https://www.linkedin.com/company/kairo-studio"
        ],
        "foundingDate": "2019",
        "slogan": "Where Strategy Meets Intelligent Automation"
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://kairostudio.in/#localbusiness",
        "name": "Kairo Studio",
        "image": "https://kairostudio.in/og-image.jpg",
        "priceRange": "₹₹₹",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "20.5937",
          "longitude": "78.9629"
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://kairostudio.in/#website",
        "url": "https://kairostudio.in",
        "name": "Kairo Studio",
        "publisher": {
          "@id": "https://kairostudio.in/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://kairostudio.in/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Service",
        "serviceType": "Marketing Automation",
        "provider": {
          "@id": "https://kairostudio.in/#organization"
        },
        "areaServed": ["IN", "AE", "US"],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Digital Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Marketing Automation",
                "description": "End-to-end marketing automation solutions for growing businesses"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "SaaS Development",
                "description": "Custom SaaS platform development and integration"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Performance Marketing",
                "description": "Data-driven performance marketing campaigns"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Business Automation",
                "description": "Workflow automation and system integration"
              }
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What services does Kairo Studio offer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Kairo Studio offers Marketing Automation, SaaS Development, Performance Marketing, Business Automation, and Digital Strategy services."
            }
          },
          {
            "@type": "Question",
            "name": "Where is Kairo Studio located?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Kairo Studio is based in India and serves clients globally across India, UAE, and the United States."
            }
          },
          {
            "@type": "Question",
            "name": "How can I contact Kairo Studio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can reach Kairo Studio at support@kairostudio.in or call +91 866-884-4178. Office hours are Monday to Friday, 9 AM to 6 PM IST."
            }
          }
        ]
      }
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>Kairo Studio | Marketing & Automation Agency for Scalable Growth</title>
      <meta name="title" content="Kairo Studio | Marketing & Automation Agency for Scalable Growth" />
      <meta
        name="description"
        content="Kairo Studio builds SaaS-powered marketing systems that automate your business growth. From performance marketing to full automation pipelines — we turn strategy into scalable systems."
      />
      <meta
        name="keywords"
        content="marketing automation agency, saas automation company, performance marketing india, business workflow automation, digital growth systems, automation developers, crm marketing setup, digital marketing systems, custom saas agency, automation strategy firm, marketing automation experts, saas marketing india, growth strategy consultants"
      />
      <meta name="author" content="Kairo Studio" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Geo Tags */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="geo.position" content="20.5937;78.9629" />
      <meta name="ICBM" content="20.5937, 78.9629" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kairostudio.in/" />
      <meta property="og:title" content="Kairo Studio | Marketing & Automation Agency for Scalable Growth" />
      <meta
        property="og:description"
        content="Where Strategy Meets Intelligent Automation. We build SaaS-powered marketing systems that scale your business effortlessly."
      />
      <meta property="og:image" content="https://kairostudio.in/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Kairo Studio" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://kairostudio.in/" />
      <meta property="twitter:title" content="Kairo Studio | Marketing & Automation Agency" />
      <meta
        property="twitter:description"
        content="We build SaaS-powered marketing systems that automate your business growth. Performance marketing + automation engineering."
      />
      <meta property="twitter:image" content="https://kairostudio.in/twitter-card.jpg" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0066ff" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Kairo Studio" />

      {/* Canonical URL */}
      <link rel="canonical" href="https://kairostudio.in/" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
    </Helmet>
  );
};

export default SEOHead;
export { HelmetProvider };
