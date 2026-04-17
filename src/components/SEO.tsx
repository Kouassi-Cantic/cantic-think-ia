import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BRANDING } from '../constants';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website' 
}) => {
  const siteTitle = "CANTIC THINK IA";
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Expertise Stratégique et IA`;
  const defaultDescription = "Cabinet d'expertise senior en IA et transformation numérique en Côte d'Ivoire. Penser utile, agir intelligent. Accompagnement stratégique pour institutions et entreprises.";
  const metaDescription = description || defaultDescription;
  const metaImage = image || BRANDING.logoUrl; // Utilise le logo par défaut si pas d'image spécifique
  const metaUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};

export default SEO;
