import { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import SEOHead from './SEOHead';
import PlateCarousel from './components/PlateCarousel';
import './index.css';

function App() {
  const [plates, setPlates] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load content and metadata
  useEffect(() => {
    Promise.all([
      fetch('/data/content.json').then(res => res.json()),
      fetch('/data/meta.json').then(res => res.json())
    ])
      .then(([contentData, metaData]) => {
        setPlates(contentData.plates || []);
        setMetadata(metaData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handlePlateChange = (index, plate) => {
    // Update page title and meta based on active plate
    if (plate && metadata) {
      const pageKey = plate.slug;
      const pageMeta = metadata.pages[pageKey];

      if (pageMeta) {
        document.title = pageMeta.title;
      }
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading Kairo Studio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h1>Oops! Something went wrong</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div className="app">
        {/* SEO Head */}
        {metadata && (
          <SEOHead
            title={metadata.site.title}
            description={metadata.site.description}
            url={metadata.site.url}
            image={metadata.site.image}
            structuredData={metadata.structuredData}
          />
        )}

        {/* Main 3D Plate Carousel */}
        {plates.length > 0 && (
          <PlateCarousel
            plates={plates}
            onPlateChange={handlePlateChange}
          />
        )}

        {/* Contact Form Handler */}
        <div id="contact-form-container" style={{ display: 'none' }}>
          {/* This will be used by the contact form in the panel */}
        </div>
      </div>
    </HelmetProvider>
  );
}

export default App;
