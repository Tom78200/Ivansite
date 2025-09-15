import Navigation from "./Navigation";
import { Helmet } from "react-helmet-async";
import AudioPlayer from "./AudioPlayer";
import AnimatedBackground from "./AnimatedBackground";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-inter overflow-x-hidden relative">
      <Helmet>
        <title>Ivan Gauthier — Artiste Peintre Contemporain</title>
        <meta name="description" content="Ivan Gauthier, artiste peintre contemporain. Galerie d'œuvres, expositions, contact. Peinture contemporaine figurative et expressionniste." />
        <meta name="keywords" content="Ivan Gauthier, artiste peintre, peinture contemporaine, art contemporain, exposition, galerie, œuvres, peintre Paris" />
        <meta name="author" content="Ivan Gauthier" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://www.ivangauthier.com/" />
        <meta property="og:title" content="Ivan Gauthier — Artiste Peintre Contemporain" />
        <meta property="og:description" content="Galerie d'œuvres, expositions et contact d'Ivan Gauthier, artiste peintre contemporain." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ivangauthier.com/" />
        <meta property="og:image" content="/generated-icon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ivan Gauthier — Artiste Peintre Contemporain" />
        <meta name="twitter:description" content="Peinture contemporaine, expositions et galerie des œuvres d'Ivan Gauthier." />
      </Helmet>
      <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Ivan Gauthier",
          "jobTitle": "Artiste Peintre Contemporain",
          "url": "https://www.ivangauthier.com/",
          "image": "https://www.ivangauthier.com/generated-icon.png",
          "description": "Artiste peintre contemporain expressionniste et figuratif. Expositions en France et sur tous les continents depuis l'âge de 16 ans.",
          "birthDate": "2000-03-01",
          "birthPlace": "Beregovo, Ukraine",
          "nationality": "Français",
          "knowsAbout": ["Peinture contemporaine", "Art expressionniste", "Art figuratif", "Expositions d'art"],
          "sameAs": [
            "https://instagram.com",
            "https://facebook.com"
          ],
          "hasOccupation": {
            "@type": "Occupation",
            "name": "Artiste Peintre",
            "occupationLocation": {
              "@type": "City",
              "name": "Paris",
              "addressCountry": "FR"
            }
          }
        }
      `}</script>
      {/* Masquage global d'images désactivé */}
      <AnimatedBackground />
      <Navigation />
      <AudioPlayer />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
