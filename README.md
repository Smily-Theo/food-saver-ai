# FoodSaver AI

A professional sustainability dashboard for reducing food waste.

## Included
- Responsive dashboard
- Inventory management
- Expiry prioritization
- AI-style food-saving assistant with recipe suggestions
- Sustainability impact metrics
- Waste analytics
- Local demo data
- Supabase-ready database schema
- Vercel-ready static deployment

## Run locally
No build tools are required for the demo version.

1. Extract the project.
2. Open `index.html` in a browser.

For a production deployment, upload the project to GitHub and import it into Vercel.

## Supabase setup
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy your Project URL and anon key into the Supabase settings section in `app.js`.
5. The current UI falls back to local demo data when Supabase is not configured.

## Deployment
### Vercel
- Push the project to GitHub.
- In Vercel, choose Add New Project and import the repository.
- Framework preset: Other.
- Build command: leave empty.
- Output directory: `.`
- Deploy.

### Render
Use a Static Site pointing to the repository. Build command can remain empty and publish directory is `.`.

Footer credit: Designed & Developed by Theo.

## Supabase connection for the current static build

The project is configured for the Supabase project URL:
`https://bpsgevzareqwzflwdawj.supabase.co`

The browser uses the Supabase JS client. For a fully authenticated cloud experience, enable Supabase Auth and provide the browser-safe Publishable/anon key through your deployment configuration. Never expose a `service_role` or secret key.

For the current static build, the key can be supplied before `app.js` loads with:
```html
<script>
window.FOODSAVER_SUPABASE_URL = "https://bpsgevzareqwzflwdawj.supabase.co";
window.FOODSAVER_SUPABASE_KEY = "YOUR_PUBLISHABLE_OR_ANON_KEY";
</script>
```
For production, prefer a build-based frontend with Vite environment variables so secrets are managed by the deployment platform.


## Authentication setup
1. Open `config.js`.
2. Replace `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY` with the browser-safe Publishable/anon key from Supabase.
3. Do NOT use a `service_role` or secret key.
4. Commit `config.js` to GitHub. A publishable/anon key is designed for browser use; database access is protected by the RLS policies in `supabase/schema.sql`.
5. Supabase Authentication → Providers → Email must be enabled.
6. If email confirmation is enabled, users must confirm their email before they can sign in.
