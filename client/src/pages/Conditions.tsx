import { Helmet } from "react-helmet-async";

export default function Conditions() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-16 px-6 text-white">
      <Helmet>
        <title>Conditions d’utilisation | Ivan Gauthier</title>
        <meta name="description" content="Conditions d’utilisation du site d'Ivan Gauthier." />
        <link rel="canonical" href="https://www.ivangauthier.com/conditions" />
      </Helmet>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-playfair mb-6">Conditions d’utilisation</h1>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Accès au site</h2>
          <p>Le site est accessible 24/7, sauf cas de force majeure ou maintenance. L’éditeur ne garantit pas l’absence d’interruptions ou d’erreurs.</p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Utilisation du contenu</h2>
          <p>Le contenu est fourni à titre informatif. Toute utilisation illicite ou non autorisée est interdite.</p>
        </section>

        <section className="space-y-2 mb-8">
          <h2 className="text-xl font-semibold">Liens externes</h2>
          <p>Le site peut contenir des liens externes. L’éditeur n’est pas responsable de leur contenu.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Droit applicable</h2>
          <p>Le droit français est applicable. En cas de litige, les tribunaux compétents seront saisis.</p>
        </section>
      </div>
    </main>
  );
}


