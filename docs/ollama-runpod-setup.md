# Ollama + RunPod GPU Setup (PDPB Compliance)

Pakistan PDPB classifies health data as critical personal data requiring full in-country or
self-hosted processing. Sending patient queries to Anthropic's US servers is non-compliant.
This guide replaces the Anthropic API with a self-hosted Ollama instance on RunPod.

## Models

| Role | Model | VRAM (Q4_K_M) | Speed on RTX 4090 |
|---|---|---|---|
| Text / chat | `qwen3:30b-a3b` | ~16.8 GB | ~40 tok/s |
| Vision / meal photos | `qwen2.5vl:7b` | ~5.5 GB | ~20 tok/s |

Both fit on a single RTX 4090 (24 GB) if you swap between them. For production, use two
separate pods (one per model) to avoid the ~10 s model-load delay.

## Monthly cost estimate (500 patients)

| Config | $/mo | PKR/mo |
|---|---|---|
| 1× RTX 4090 Secure (text + vision, shared) | ~$250 | ~71,000 |
| 2× RTX 4090 Secure (dedicated per model) | ~$462 | ~131,700 |
| Anthropic API at current usage | ~$6,800 | ~1,938,000 |

Use RunPod **Secure Cloud** (not Community) for production — dedicated hardware, no
neighbour interference, 99.9% SLA.

---

## Step 1 — Create a RunPod pod

1. Sign in at runpod.io → **Deploy** → **GPU Cloud**.
2. Select **RTX 4090**, 24 GB VRAM, Secure Cloud region.
3. Template: **RunPod PyTorch** (latest) — includes CUDA drivers.
4. Expose TCP port **11434** (Ollama default).
5. Set a pod name, e.g. `loop90-text`.
6. Deploy. Wait for status **Running**.

## Step 2 — Install Ollama and pull models

SSH into the pod (RunPod dashboard → Connect → SSH):

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama bound to all interfaces (needed for the app to reach it)
OLLAMA_HOST=0.0.0.0 ollama serve &

# Pull models (takes 5–15 min first time)
ollama pull qwen3:30b-a3b
ollama pull qwen2.5vl:7b

# Smoke test
ollama run qwen3:30b-a3b "Reply OK if you are working."
```

## Step 3 — Secure the connection with Tailscale

Never expose port 11434 to the public internet — Ollama has no built-in auth.
Use Tailscale to create a private overlay network between the RunPod pod and Vercel.

On the RunPod pod:
```bash
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up --authkey=<YOUR_TAILSCALE_AUTH_KEY>
# Note the Tailscale IP shown (e.g. 100.x.x.x)
```

On Vercel:
- Install the [Tailscale Vercel integration](https://vercel.com/integrations/tailscale).
- Add your Vercel project to the same Tailscale tailnet.

## Step 4 — Set environment variables on Vercel

```
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://100.x.x.x:11434   # your pod's Tailscale IP
OLLAMA_MODEL=qwen3:30b-a3b
OLLAMA_VISION_MODEL=qwen2.5vl:7b
```

Remove or leave `ANTHROPIC_API_KEY` — when `AI_PROVIDER=ollama` the Anthropic SDK
is never imported (lazy import in `lib/ai/provider.ts`).

## Step 5 — Verify

```bash
# From any machine on the tailnet:
curl http://100.x.x.x:11434/api/tags

# Full round-trip test via the app:
curl -X POST https://your-app.vercel.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <patient-jwt>" \
  -d '{"message": "What foods lower blood sugar?"}'
```

The response should stream from the self-hosted model with no Anthropic calls.

## Persistence across pod restarts

RunPod pods can be stopped/started; Ollama and the pulled models survive on the
persistent volume if you attach one (recommended — 50 GB is enough for both models).

Add a startup script in the RunPod pod settings:
```bash
OLLAMA_HOST=0.0.0.0 ollama serve
```

Or use a Docker template that pre-bakes Ollama + model weights — RunPod marketplace
has community templates for this.

## Fallback

If the Ollama pod is unreachable (pod stopped, network issue), the app will throw
rather than silently fall back to Anthropic — intentional, to avoid accidental
cross-border data leakage. Set up RunPod auto-restart and a Vercel alert on 5xx
spikes from `/api/ai/*` routes.

## Development / CI

Keep `AI_PROVIDER=gemini` (free tier) for local dev and CI — no GPU needed, no PKR
cost, no data sovereignty concerns for synthetic test data. Switch to `ollama` only
in staging/production.
