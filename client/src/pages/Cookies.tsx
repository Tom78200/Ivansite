import { Helmet } from "react-helmet-async";

export default function Cookies() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-16 px-6 text-white">
      <Helmet>
        <title>Politique de cookies | Ivan Gauthier</title>
        <meta name="description" content="Politique de cookies du site d'Ivan Gauthier." />
        <link rel="canonical" href="https://www.ivangauthier.com/cookies" />
      </Helmet>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-playfair mb-6">Politique de cookies</h1>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Qu’est‑ce qu’un cookie ?</h2>
          <p>Un cookie est un fichier déposé sur votre appareil pour enregistrer des informations relatives à votre navigation.</p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Cookies utilisés</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Cookies techniques nécessaires au fonctionnement du site.</li>
            <li>Cookies de mesure d’audience (désactivés par défaut si bannière opt‑in).</li>
          </ul>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Gestion du consentement</h2>
          <p>Vous pouvez accepter/refuser les cookies non essentiels via la bannière (à venir) ou paramétrer votre navigateur.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Durée de vie</h2>
          <p>La durée maximale de conservation des cookies non essentiels est de 13 mois.</p>
        </section>
      </div>
    </main>
  );
}


