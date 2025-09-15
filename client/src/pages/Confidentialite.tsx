import { Helmet } from "react-helmet-async";

export default function Confidentialite() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-16 px-6 text-white">
      <Helmet>
        <title>Politique de confidentialité | Ivan Gauthier</title>
        <meta name="description" content="Politique de confidentialité (RGPD) du site d'Ivan Gauthier." />
        <link rel="canonical" href="https://www.ivangauthier.com/confidentialite" />
      </Helmet>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-playfair mb-6">Politique de confidentialité</h1>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Données collectées</h2>
          <p>Via le formulaire de contact: nom, e‑mail, message. Aucune donnée sensible n’est collectée.</p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Finalités</h2>
          <p>Répondre aux demandes, suivi des échanges, gestion des relations avec les visiteurs.</p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Base légale</h2>
          <p>Intérêt légitime et/ou consentement (article 6 du RGPD).
          </p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Durée de conservation</h2>
          <p>Les messages sont conservés le temps nécessaire au traitement puis archivés/supprimés.
          </p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Destinataires</h2>
          <p>Uniquement l’éditeur du site et son prestataire d’hébergement/maintenance si nécessaire.
          </p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Transferts hors UE</h2>
          <p>Le cas échéant, ils sont encadrés par des garanties appropriées (clauses contractuelles types).
          </p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Vos droits</h2>
          <p>Accès, rectification, effacement, opposition, limitation, portabilité. Contact: <a href="mailto:ivangauthier009@gmail.com" className="underline">ivangauthier009@gmail.com</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Sécurité</h2>
          <p>Mesures techniques et organisationnelles raisonnables sont mises en œuvre pour protéger les données.
          </p>
        </section>
      </div>
    </main>
  );
}


