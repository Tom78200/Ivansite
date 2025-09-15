import { Helmet } from "react-helmet-async";

export default function Accessibilite() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-16 px-6 text-white">
      <Helmet>
        <title>Accessibilité | Ivan Gauthier</title>
        <meta name="description" content="Déclaration d’accessibilité du site d'Ivan Gauthier." />
        <link rel="canonical" href="https://www.ivangauthier.com/accessibilite" />
      </Helmet>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-playfair mb-6">Déclaration d’accessibilité</h1>

        <section className="space-y-2 mb-8">
          <p>Nous nous engageons à rendre ce site accessible au plus grand nombre. Des bonnes pratiques de contraste, navigation clavier et balises ARIA sont mises en place.</p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Niveau de conformité visé</h2>
          <p>Objectif: conformité WCAG 2.1 niveau AA (au mieux). Des améliorations sont en cours.</p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Retour d’information et contact</h2>
          <p>Vous rencontrez un défaut d’accessibilité? Écrivez‑nous: <a href="mailto:ivangauthier009@gmail.com" className="underline">ivangauthier009@gmail.com</a>.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Améliorations prévues</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Meilleure visibilité du focus.</li>
            <li>Descriptions alternatives enrichies pour certaines images.</li>
            <li>Tests réguliers de navigation clavier et lecteurs d’écran.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}


