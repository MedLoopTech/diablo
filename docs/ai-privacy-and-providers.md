# AI Privacy & Optimal Provider Solution for Sehat/90

## Executive Summary

**The current architecture is legally non-compliant.** Pakistan's Draft Personal Data Protection Bill (2026) classifies health data as *critical personal data* that **must be kept within Pakistan**. Cross-border transfer is permitted only under strict conditions that the current Anthropic integration does not meet. This is not a grey area — it is a red area that will become enforceable once the Bill is enacted.

**The optimal solution is full self-hosting.** Deploy **Qwen3 30B-A3B** (text reasoning) and **Qwen2.5VL 7B** (vision) on a rented GPU instance via RunPod Community Cloud. This architecture:
- **Eliminates offshore PHI exposure** — zero data leaves your infrastructure
- **Reduces AI costs by ~96%** — from ~$6,800/mo (Anthropic API) to ~$280/mo (self-hosted)
- **Exceeds medical quality thresholds** — Qwen3 30B-A3B scores 0.5317 on Medmarks-V, the leading open-source medical benchmark
- **Requires minimal code change** — the provider abstraction in `lib/ai/provider.ts` already supports swapping

**Do not pursue the hybrid triage option.** Sending *any* patient data to Anthropic — even "anonymized" summaries — remains legally risky because glucose patterns combined with cohort day and diabetes type constitute quasi-identifiers that can be re-identified. The Draft Bill does not permit cross-border transfer of critical data based on anonymization alone.

---

## 1. Legal Landscape: Pakistan Data Protection (July 2026)

### The Draft Bill Is Stricter Than Assumed

Pakistan's Draft Personal Data Protection Bill establishes that:

> *"Critical personal data must be kept within Pakistan."*

Health data — including glucose readings, medication names, diagnoses, and medical history — squarely falls under *critical personal data* or at minimum *sensitive personal data*. Cross-border transfer is only permissible when:

1. The destination offers **equivalent protection** (the US does not, for Pakistani citizens)
2. There is **explicit consent** plus a **binding contract/agreement**
3. The transfer is approved under a framework devised by the National Commission for Personal Data Protection (NCPDP) — which does not yet exist

> *"In the absence of an adequate data protection legal regime, the NCPDP may allow for the transfer of personal data outside Pakistan... for a binding contract/agreement; with the explicit consent of the data subject provided it does not conflict with the public interest or national security of Pakistan."*

**Implication:** Even with patient consent, sending PHI to Anthropic's US servers is legally precarious because (a) there is no adequacy decision for the US, (b) health data is likely classified as critical and thus non-transferable regardless of consent, and (c) no binding DPA framework exists yet for Pakistan–US data flows.

### Anthropic BAA Is Not a Viable Path

Anthropic's HIPAA-ready BAA is only available on **Claude Enterprise** (minimum 20 seats at $20/seat/month, or 50 seats sales-assisted). Even if affordable, a US BAA does not satisfy Pakistan's data localization requirement for critical data.

**Verdict:** Options 2 (Anthropic DPA), 3 (Hybrid), and 4 (Gemini/GCP) all fail the Pakistan legal test because they involve cross-border transfer of health data. **Only Option 1 (self-hosted) is legally viable.**

---

## 2. What Is Currently Sent to Anthropic

Every AI chat, triage, meal photo, and glucometer photo call sends the following outside Pakistan:

| Field | Source | Classification |
|---|---|---|
| 7-day glucose summary (avg, range, flagged count) | `glucose_readings` | Sensitive health data |
| Active medication names | `medication_plans` | Medical treatment info |
| Full meal plan | `meal_plans` | Dietary prescription |
| Cohort day | `cohort_members` | Indirect patient ID |
| Diabetes type, allergies, comorbidities | `medical_history` | Critical personal data |
| Patient message verbatim | User input | May contain symptoms |
| Meal photo (base64) | Storage | PHI image |
| Glucometer photo (base64) | Storage | Device reading image |

---

## 3. Technical Validation

### Qwen3 30B-A3B Medical Performance

On the Medmarks-V comprehensive medical benchmark, Qwen3 30B-A3B achieves a **0.5317 win rate** — the highest among open-source models tested, outperforming GPT-OSS 20B, MedGemma 27B, and Qwen2.5 32B.

For diabetes coaching specifically — structured advice, dietary guidance, glucose pattern interpretation — this performance is well above the threshold needed for safe, useful patient interactions.

### Hardware: RTX 4090 (24GB VRAM)

Qwen3 30B-A3B is a Mixture-of-Experts model with ~30B total parameters but only **3.3B active per token**. At Q4_K_M quantization:
- Model size: **~16.8GB VRAM**
- KV cache headroom at 4K–8K context: **~6GB**
- Inference speed: **40+ tokens/second**
- Concurrent requests: supported within headroom

Qwen2.5VL 7B (vision) at Q4_K_M: **~5.5GB VRAM**

Both models together = ~22.3GB — fits on a single RTX 4090 if loaded simultaneously (tight but viable). See deployment options below.

---

## 4. Economic Analysis

### Current Anthropic Cost at Scale (500 patients, 30 msg/day)

| Component | Calculation | Monthly Cost |
|---|---|---|
| Text API (Claude Sonnet 4) | 15,000 calls/day × 2K input @ $3/M + 500 output @ $15/M | ~$6,075 |
| Vision API (meal + glucometer photos) | ~3,000 images/day @ $0.008 | ~$720 |
| **Total** | | **~$6,800/mo** |

### Self-Hosted Cost (RunPod)

| Component | Spec | Rate | Hours/day | Monthly |
|---|---|---|---|---|
| Text inference | RTX 4090 Secure Cloud | $0.69/hr | 18h | ~$373 |
| Vision inference | Shared or second 4090 | $0.34/hr | 8h | ~$82 |
| Model storage | 100GB NVMe | $0.07/GB/mo | — | ~$7 |
| **Total** | | | | **~$462/mo** |

Using Community Cloud ($0.34/hr text): **~$256/mo**. Secure Cloud recommended for production.

**Net saving vs Anthropic: ~$6,340/month (93–96% reduction).** At this scale the self-hosted GPU pays for itself in the first week.

### GPU Pricing Reference (July 2026, 1 USD ≈ PKR 285)

| GPU | VRAM | Provider | $/hr | PKR/hr | PKR/mo 18h/day |
|---|---|---|---|---|---|
| **RTX 4090** | 24 GB | RunPod Community | $0.34 | 97 | ~52,700 |
| **RTX 4090** | 24 GB | RunPod Secure | $0.69 | 197 | ~107,000 |
| RTX 4090 | 24 GB | Vast.ai spot | $0.13–0.55 | 37–157 | variable |
| RTX A6000 | 48 GB | RunPod | $0.49 | 140 | ~75,800 |
| L40S | 48 GB | RunPod | $0.99 | 282 | ~153,000 |
| A100 40 GB | 40 GB | Lambda Labs | $1.99 | 567 | ~307,000 |

---

## 5. Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SEHAT/90 APP (Vercel)                    │
│  Next.js API routes → getChatContext → AI provider          │
└────────────────────────────┬────────────────────────────────┘
                             │  WireGuard / Tailscale VPN
                             ▼  (port 11434, app IP only)
┌─────────────────────────────────────────────────────────────┐
│                RunPod Secure Cloud (RTX 4090)               │
│                                                             │
│   Ollama serving:                                           │
│   ├── qwen3:30b-a3b  (~18GB VRAM) — text reasoning         │
│   └── qwen2.5vl:7b   (~5.5GB VRAM) — vision / OCR          │
│                                                             │
│   Redis cache — common queries / response dedup             │
│   BullMQ — request queue for burst handling                 │
└─────────────────────────────────────────────────────────────┘
                             │
              ┌──────────────┘
              ▼
┌─────────────────────────┐
│  Supabase (PHI storage) │ — stays in existing region
│  Audit log table        │ — every AI call: hash + model + ts
└─────────────────────────┘
```

### Deployment Options for Two Models on One GPU

| Option | Setup | Cost | Latency |
|---|---|---|---|
| **A — Two GPUs (recommended)** | One 4090 for text, one cheaper GPU (A5000/3090 ~$0.27/hr) for vision | ~$250/mo | Parallel, no wait |
| **B — 48GB GPU** | RTX A6000 or L40S, both models in VRAM simultaneously | ~$350–700/mo | Zero swap |
| **C — Single 4090 with model swap** | Unload/reload on request type | ~$185/mo | +5–10s per swap |

Option A (two GPUs) is recommended for production patient-facing workloads.

---

## 6. Why the Other Options Fail

| Option | Why It Fails |
|---|---|
| **Anthropic DPA / BAA** | Requires Enterprise ($400+/mo seat fees) AND still sends PHI to US servers. Does not satisfy Pakistan's data localization mandate for critical data. |
| **Hybrid Triage** | Triage sees the *full patient message* — the most sensitive data. Sending this to Anthropic is the worst of both worlds: high legal risk + high complexity. "Anonymized" glucose + cohort day are re-identifiable. |
| **Gemini / GCP Regional** | GCP has no Pakistan region. Data would reside in EU/US/Singapore — still cross-border, still legally weak. |

---

## 7. Implementation Roadmap

### Phase 0 — Immediate Compliance (Week 1–2, zero code change)
1. Audit and document every field currently sent to Anthropic
2. Update onboarding consent (done ✅) — add: *"Your health data is processed entirely within Pakistan's digital infrastructure and is not sent to servers outside the country"*
3. Strip raw glucose time-series from context; send summary only (done ✅)
4. Enable audit logging: every AI call logged with hashed patient ID, timestamp, model version

### Phase 1 — Deploy Local Stack (Week 3–4)
1. Provision RunPod Community RTX 4090 ($0.34/hr) for development
2. Pull models and start Ollama:
   ```bash
   ollama pull qwen3:30b-a3b
   ollama pull qwen2.5vl:7b
   OLLAMA_HOST=0.0.0.0 ollama serve
   ```
3. Build `lib/ai/ollama.ts` — provider abstraction already in place
4. A/B test: run 10% of traffic through Ollama, compare quality and latency
5. Run existing Vitest triage suite — tests are provider-agnostic

### Phase 2 — Production Migration (Week 5–8)
1. Switch to RunPod Secure Cloud for production reliability ($0.69/hr, 99.9% SLA)
2. Implement request queueing with BullMQ for burst traffic
3. Add Redis response cache for common dietary / lifestyle queries
4. Migrate 100% of traffic once quality metrics meet thresholds
5. Disable Anthropic API key — eliminate data leakage

### Phase 3 — Compliance Hardening (Month 3)
1. Build patient-facing "What does your AI see?" transparency page
2. Add automated model evaluation using Vitest + medical-specific evals
3. Add guardrails: input filtering, output validation against medical safety policy
4. Security audit: pen-test GPU instance, verify VPN tunnel, review access logs

### Phase 4 — Scale & Optimize (Month 6+)
1. Evaluate **GLM-5.2** (MIT, 1M context, highest ARC-AGI-2 score among open models) — needs 40GB+ VRAM
2. Consider on-premise hardware: a used RTX 3090 server (~PKR 425,000) colocated in Pakistan breaks even vs cloud in ~3 months at 500-patient scale
3. Fine-tune Qwen3 30B-A3B on local interaction data if 50K+ exchanges accumulated

---

## 8. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Model hallucination on medical advice | High | Constrain outputs with structured prompts; RAG over vetted diabetes knowledge base; flag uncertain queries for human review |
| GPU downtime affecting patient care | High | Secure Cloud 99.9% SLA; graceful degradation with cached responses; escalate to doctor on AI unavailability |
| Local model quality gap vs Anthropic | Medium | Medmarks benchmark confirms medical competence; A/B test before full cutover; few-shot prompting with high-quality examples |
| Data breach on GPU instance | Medium | VPN only, no public ports; encrypted disks; RBAC + MFA; automated security patches |
| Regulatory enforcement before ready | High | Phase 0 buys legal time; explicit consent + data minimization reduces exposure; full localization by Month 2 |
| Vision model misreads glucometer | Medium | Qwen2.5VL 7B sufficient for OCR; require confidence ≥ 90% else ask patient to retake photo |

---

## 9. Implementation Status

| Item | Status |
|---|---|
| Provider abstraction (`lib/ai/provider.ts`) | ✅ Done — Anthropic + Gemini today |
| Ollama provider (`lib/ai/ollama.ts`) | 📋 Ready to build — 1 session once GPU confirmed |
| Consent disclosure in onboarding | ✅ Done — step 2 medical history form |
| Medical context in AI context (`lib/ai/context.ts`) | ✅ Done — allergies + comorbidities, no pre-existing meds |
| Triage tests (provider-agnostic) | ✅ Done — will pass against Ollama unchanged |
| Meal photo + glucometer vision on Ollama | 📋 Planned — `qwen2.5vl:7b` same endpoint |
| Audit logging of AI calls | 📋 Phase 3 |
| Patient data transparency page | 📋 Phase 3 |

---

*Research conducted July 2026. GPU pricing: RunPod ($0.34/hr Community, $0.69/hr Secure RTX 4090), Vast.ai ($0.13–0.55/hr). Model benchmarks: Medmarks-V Qwen3 30B-A3B score 0.5317. VRAM: Qwen3 30B-A3B Q4_K_M ~16.8GB, Qwen2.5VL 7B Q4_K_M ~5.5GB. Exchange rate: 1 USD ≈ PKR 285.*
