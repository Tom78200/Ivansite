Déploiement

Render (Express long-running)
- Build: npm run build
- Start: npm start
- Env: NODE_ENV=production
- Variables (optionnelles): SMTP_*, SUPABASE_*, PUBLIC_BASE_URL

Vercel (serverless)
1. Build local: npm run build (produit dist/public)
2. Clés:
   - api/index.ts: handler Express pour /api
   - vercel.json: routes API + statique
3. Paramètres Vercel:
   - Framework: Other
   - Build Command: npm run build
   - Output Directory: dist/public
   - Env: NODE_ENV=production (+ SMTP_*, SUPABASE_* si utilisés)

Notes:
- Admin: /api/login (cookie httpOnly + cookie signé stateless), /api/logout.
- HTTPS: fourni par la plateforme; HSTS activé côté serveur en prod.


