# Cloud Run deployment

Client and server are deployed as **two separate Cloud Run services**.
Deploy the server first (to get its URL), then the client (pointing at it).

## One-time setup

Set your project/region and enable APIs.

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=us-east1
export REPO=revenue-intelligence

gcloud config set project $PROJECT_ID

gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com
```

Create the Artifact Registry repo (one repo holds both images):

```bash
gcloud artifacts repositories create $REPO \
    --repository-format=docker \
    --location=$REGION
```

Grant the Cloud Build service account permission to deploy to Cloud Run
and access Secret Manager:

```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for role in roles/run.admin roles/iam.serviceAccountUser roles/secretmanager.secretAccessor roles/artifactregistry.writer; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:${CB_SA}" --role="$role"
done
```

## Create server secrets

```bash
printf 'nvapi-xxxxxxxx' | gcloud secrets create nvidia-api-key       --data-file=-
printf 'https://xxx.supabase.co' | gcloud secrets create supabase-url --data-file=-
printf 'eyJhbGc...'    | gcloud secrets create supabase-service-key  --data-file=-
```

## Deploy the server

```bash
cd server
gcloud builds submit --config=cloudbuild.yaml .
```

Grab the resulting Cloud Run URL:

```bash
export BACKEND_URL=$(gcloud run services describe revenue-intelligence-server \
    --region=$REGION --format='value(status.url)')
echo $BACKEND_URL
```

## Deploy the client

From `client/`, pass the backend URL and the Supabase anon values as build/substitution args.
Supabase anon values are baked into the JS bundle at build time (Vite).

```bash
cd ../client
gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=_BACKEND_URL="$BACKEND_URL",_VITE_SUPABASE_URL="https://xxx.supabase.co",_VITE_SUPABASE_ANON_KEY="eyJ..." \
    .
```

## Notes

- The nginx container in the client proxies `/api/*` → `$BACKEND_URL/api/*`, so the frontend
  code can keep calling relative paths (`/api/query`, `/api/deals`, …).
- `BACKEND_URL` is an env var read at container startup by `docker-entrypoint.sh`, so you
  can change it later via `gcloud run services update ... --update-env-vars=BACKEND_URL=...`
  without rebuilding the image.
- Cloud Run injects `PORT=8080`; both Dockerfiles listen on `$PORT`.
- Server secrets are wired with `--set-secrets`; no `.env` file is baked into the image.
