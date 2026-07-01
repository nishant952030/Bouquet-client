# Digital Pet Gift Feature — Spec Summary

## Context
Existing website lets users create and send digital gifts via shareable link (bouquet, greeting card, plushy, birthday cake, etc.). This document specs a **new feature**: a digital pet (kitten/puppy/any animal) that the recipient must care for over time.

---

## Core Concept
Sender creates and sends a digital pet via link. Recipient must check in regularly to feed and give attention. Neglect causes the pet to get sick and eventually **run away** (never dies). The pet can be cared for, recovered, and even returned to the original sender, who can revive and resend it.

---

## Core Stats (Two Independent Tracks)

| Stat | Decays from | Restored by |
|---|---|---|
| **Hunger** | Time since last feed | "Feed" action |
| **Mood/Attention** | Time since last interaction | "Pet", "Play", "Talk" actions |

Both tracks are independent — a pet can be well-fed but lonely, or attention-rich but starving. Combined values drive the displayed animation/state.

### Hunger states
Joyful (80–100%) → Content (50–79%) → Hungry (25–49%) → Sick (10–24%) → Very Sick (1–9%) → **Ran Away** (0%, after sustained neglect)

### Mood states
Cheerful (80–100%) → Calm (50–79%) → Lonely (25–49%) → Sad (10–24%) → Angry/Withdrawn (1–9%)

- At "Angry/Withdrawn," pet may briefly refuse feeding until a "make-up" gesture is given (apology, gentle pet, favorite toy) — small redemption beat before things escalate further.
- **"Ran Away"** should only trigger when BOTH hunger and mood are critical for an extended period — not from a single neglected stat.

---

## "Ran Away" → Return-to-Sender Loop
- Pet never dies. If neglected too long, it "runs away" and **returns to the original sender's account**.
- Sender gets notified ("Mochi came back to you 🐾 — looks like they missed you.")
- Pet returns in its sick/sad state (not reset) — sender must nurse it back to "Cheerful" before resending.
- Sender can then resend to the same recipient (with a note) or to someone new.
- Optional: store a pet's journey/history log ("Sent to Asha on June 2, returned June 9") as a keepsake/novelty feature.

---

## Growth Stages
- **Baby** (0–7 days of care): smaller proportions, big eyes, wobbly movement, simpler emotional range
- **Adult** (7+ days, consistent care): full size, full expression range, calmer movements
- (Optional later: add a Juvenile middle stage once validated)
- Growth tied to **consistent care quality**, not just elapsed time — neglected pets grow slower, adding another incentive loop.
- Each growth stage = its own animation rig, but same state machine (idle/happy/sad/sick/angry/sleep) and same numeric inputs (hunger, mood) drive all stages.

---

## "Talk to Pet" — AI Emotional Understanding (Key Differentiator)
- Sender or recipient can type/speak a message to the pet at any time.
- Message sent to an LLM (Claude API) with a prompt to classify emotional tone — not just sentiment, but warmth, sincerity, intensity.
- Example structured output:
```json
{ "warmth": 0.8, "sincerity": 0.7, "primary_emotion": "apologetic", "intensity": "high" }
```
- High warmth/sincerity → larger mood boost + comforting animation (nuzzle, calm down)
- Flat/dismissive message → smaller boost, pet stays guarded
- Detected sadness from the human → pet can respond with a comforting reaction, making the relationship feel two-way
- Optional: store emotional interaction history per pet to build a "trust/personality" trend over time, not just react to the latest message
- Show a "listening…" / "thinking…" state while the API call resolves (reinforces the feeling of being heard)
- Pet can show a short generated reaction line ("Mochi seems to perk up at your words 🐾") for direct feedback

**Practical considerations:** rate-limit talk interactions per pet/day (cost + abuse control), run basic content moderation on free text input, and disclose to users that messages are processed (privacy, especially since product may be used by/around families).

---

## Animation Approach (Budget-Conscious)
Cuteness comes from **proportion + eyes + motion**, not detail — simple/chibi style is both cuter and cheaper than realistic art.

**Recommended v1 build:**
1. 5–6 static cute poses (happy, sad, sick, sleepy, excited) — illustrated cheaply or sourced free (Rive community files, LottieFiles free library)
2. Animate transitions yourself using CSS/Framer Motion — no animator needed for v1:
   - Squash-and-stretch on bounce/idle
   - Random-timer eye blinking
   - Idle "breathing" pulse
   - Reaction wiggle on tap
   - Small sound effects (Freesound.org, free) for purr/mew on interaction
3. Two numeric inputs (hunger 0–100, mood 0–100) drive which state/animation plays — same logic reused across growth stages and animal types.

**Upgrade path (once feature proves traction):** commission a proper Rive state-machine rig (~₹8,000–20,000 per stage) for smoother blended animation.

---

## Budget (India-specific, minimum-cost plan)

You are building backend/frontend yourself — main cost is art assets.

| Item | Cost (₹) | Notes |
|---|---|---|
| Pet animations (1 stage, freelance Rive rig) | ₹8,000–20,000 | Optional — can substitute with free/cheap assets below |
| Free/cheap stock assets (Rive community, LottieFiles, itch.io) | ₹0–3,000 | Recommended for v1 |
| Backend, DB, frontend | ₹0 | Self-built |
| LLM API (emotion detection) | ₹500–1,500/month | Claude API, cheap per short message; cap usage per user/day |
| Hosting (Supabase/Railway/Render/Vercel free tiers) | ₹0–800/month | Free tier sufficient early on |
| Push notifications (OneSignal) | ₹0 | Free tier |
| Domain | Already owned | N/A |

**Realistic v1 launch cost: ₹10,000–25,000**, or near-₹0 if using static images + CSS animation + free assets instead of a commissioned rig.

### Phased rollout
1. **Phase 0 (₹0–3,000):** Static images + CSS animation, 3–4 emotion states, one animal, one growth stage. Validate real engagement.
2. **Phase 1 (₹10,000–20,000):** If traction proves out, invest in proper Rive animator for smoother visuals.
3. **Phase 2:** Add growth stages, more animals, premium pets — funded by Phase 1 revenue.

---

## Monetization Ideas
- Pay-per-gift (flat fee per pet sent, e.g. ₹150–400)
- Free basic pet, paid premium animals (exotic/fantasy/branded)
- Sender subscription: unlimited sends + exclusive pets/skins
- Customization upsells: names, accessories, backgrounds, voice packs
- Paid care boosters: "auto-feed for 3 days" (for recipient going away), "instant revive" if pet ran away
- Bundle pet with existing cake/bouquet/card products as a combo gift
- B2B/white-label licensing to florists/gift shops
- Seasonal/limited-edition pets (Diwali, Christmas, Valentine's) for urgency + repeat purchase

**Suggested model:** free core pet to drive viral sharing (recipients become future senders) + monetize via premium pets, customization, and care boosters.

---

## Open Design Decisions (to finalize before/during dev)
1. Exact day/hour thresholds for each hunger/mood state transition
2. Exact cooldown before a returned pet can be resent
3. Whether "ran away" pet resets to neutral or stays in its sick/sad state on return (recommended: stays, must be nursed back)
4. Rate limit / daily cap for "Talk to Pet" LLM calls
5. Content moderation approach for free-text talk input
6. Single animal (cat) vs. multi-animal at launch (recommended: start with one)

---

## Suggested Build Order
1. Data model: pet_id, owner_id, recipient_id, hunger_level, mood_level, growth_stage, last_fed_at, last_interaction_at, state_history/journey log
2. Decay logic: calculated on page load based on elapsed time (no constant polling needed)
3. Core actions: Feed, Pet, Play, Talk
4. Static art + CSS/Framer Motion animation states (Phase 0)
5. Notification triggers (gentle → urgent → final warning)
6. "Ran away" → return-to-sender flow
7. Talk-to-pet LLM integration (Claude API) with structured emotion JSON output
8. Growth stage transition logic
