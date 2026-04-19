# Continuous deployment from GitHub → Cloud Run

Two Cloud Run services, each driven by its own Cloud Build trigger:

| Service | Config | Fires on change in |
|--|--|--|
| `revenue-intelligence-server` | [cloudbuild.server.yaml](cloudbuild.server.yaml) | `server/**` |
| `revenue-intelligence-client` | [cloudbuild.client.yaml](cloudbuild.client.yaml) | `client/**` |

Every push to `main` that touches the relevant directory triggers a build that
builds the image, pushes it to Artifact Registry, and deploys the new revision
to Cloud Run — no manual steps after setup.

---

## 1. One-time project setup

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=us-east1
export REPO=revenue-intelligence
export GITHUB_OWNER=your-github-username
export GITHUB_REPO=your-repo-name           # repo that contains this folder at its root

gcloud config set project $PROJECT_ID

gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com
```

Create the Artifact Registry repo (holds both images):

```bash
gcloud artifacts repositories create $REPO \
    --repository-format=docker \
    --location=$REGION
```

Grant the Cloud Build service account the roles it needs to deploy to Cloud Run,
read secrets, and push to Artifact Registry:

```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for role in roles/run.admin \
            roles/iam.serviceAccountUser \
            roles/secretmanager.secretAccessor \
            roles/artifactregistry.writer; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:${CB_SA}" --role="$role"
done
```

## 2. Create server secrets

```bash
printf 'nvapi-xxxxxxxx'          | gcloud secrets create nvidia-api-key       --data-file=-
printf 'https://xxx.supabase.co' | gcloud secrets create supabase-url         --data-file=-
printf 'eyJhbGc...'              | gcloud secrets create supabase-service-key --data-file=-
```

## 3. Connect the GitHub repo to Cloud Build

Go to **Cloud Build → Triggers → Connect Repository** in the Console and
authorise the Cloud Build GitHub app against `$GITHUB_OWNER/$GITHUB_REPO`.
(This step has to be done in the UI once — `gcloud` does not currently
handle the OAuth handshake.)

## 4. Create the triggers

> **If this `revenue-intelligence/` folder is the repo root**, the included-file
> globs below are correct. If it sits inside a monorepo, prefix them with the
> folder path (e.g. `revenue-intelligence/server/**`) and adjust
> `--build-config` the same way.

### Server trigger

```bash
gcloud builds triggers create github \
    --name=deploy-server \
    --repo-owner=$GITHUB_OWNER \
    --repo-name=$GITHUB_REPO \
    --branch-pattern="^main$" \
    --included-files="server/**,cloudbuild.server.yaml" \
    --build-config=cloudbuild.server.yaml
```

### Client trigger

The client needs three substitution values at build time (Vite bakes the
Supabase anon values into the JS bundle; `BACKEND_URL` is baked into the
nginx config at container start):

```bash
gcloud builds triggers create github \
    --name=deploy-client \
    --repo-owner=$GITHUB_OWNER \
    --repo-name=$GITHUB_REPO \
    --branch-pattern="^main$" \
    --included-files="client/**,cloudbuild.client.yaml" \
    --build-config=cloudbuild.client.yaml \
    --substitutions=_BACKEND_URL="https://revenue-intelligence-server-xxx.a.run.app",_VITE_SUPABASE_URL="https://xxx.supabase.co",_VITE_SUPABASE_ANON_KEY="eyJ..."
```

You won't know `_BACKEND_URL` until the server has been deployed at least once.
Leave it empty on first trigger creation, push a commit touching `server/` to
deploy the server, grab the URL, then update the trigger:

```bash
export BACKEND_URL=$(gcloud run services describe revenue-intelligence-server \
    --region=$REGION --format='value(status.url)')

gcloud builds triggers update deploy-client \
    --update-substitutions=_BACKEND_URL="$BACKEND_URL"
```

## 5. Kick off the first builds

Easiest: make a trivial change in `server/` and push — trigger fires, server
deploys. Then update the client trigger with `$BACKEND_URL` (step 4) and push
a change in `client/`.

Or run either trigger by hand:

```bash
gcloud builds triggers run deploy-server --branch=main
gcloud builds triggers run deploy-client --branch=main
```

---

## Operational notes

- **Changing the backend URL later** — update the client trigger's
  `_BACKEND_URL` substitution and push a new commit, OR skip the rebuild with
  `gcloud run services update revenue-intelligence-client --region=$REGION --update-env-vars=BACKEND_URL=...`
  (the nginx config re-templates on container start).
- **Rotating secrets** — `gcloud secrets versions add nvidia-api-key --data-file=-` then
  redeploy the server (`--set-secrets=...:latest` always pulls the newest version).
- **Rolling back** — `gcloud run services update-traffic <service> --to-revisions=<prev>=100`.
- **Logs** — `gcloud run services logs tail <service> --region=$REGION`.
- `_BACKEND_URL` is read at container startup by
  [client/docker-entrypoint.sh](client/docker-entrypoint.sh), which runs
  `envsubst` against [client/nginx.conf.template](client/nginx.conf.template).
  The frontend keeps calling `/api/*` relatively — nginx proxies to the server.
