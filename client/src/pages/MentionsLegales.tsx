import { Helmet } from "react-helmet-async";

export default function MentionsLegales() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-16 px-6 text-white">
      <Helmet>
        <title>Mentions légales | Ivan Gauthier</title>
        <meta name="description" content="Mentions légales du site d'Ivan Gauthier." />
        <link rel="canonical" href="https://www.ivangauthier.com/mentions-legales" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-playfair mb-6">Mentions légales</h1>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Droits d’auteur</h2>
          <p>
            L’ensemble des contenus de ce site (textes, images, œuvres) est protégé par le droit d’auteur.
            Toute reproduction, représentation, diffusion ou adaptation, même partielle, sans autorisation préalable
            d’Ivan Gauthier est strictement interdite.
          </p>
          <p>
            Pour toute demande ou contact: <a href="mailto:ivangauthier009@gmail.com" className="underline">ivangauthier009@gmail.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}


