# Vielseitig – Monetization Strategy

*Assessment Date: February 3, 2026*

---

## Executive Summary

Vielseitig is well-positioned for monetization with school-based licensing infrastructure already built. The recommended approach is a **freemium model** targeting schools in the DACH region (Germany, Austria, Switzerland), with phased implementation from manual licensing to fully automated payments.

---

## Current State Analysis

### ✅ Already Built (Monetization-Ready)
| Feature | Status | Notes |
|---------|--------|-------|
| School-based licensing | ✅ Complete | 1 active user = school licensed |
| `active_until` field | ✅ Complete | Time-limited access ready |
| Premium lists | ✅ Complete | 4 additional lists for registered teachers |
| PDF export gating | ✅ Complete | Disabled for public standard list |
| User status (active/passive) | ✅ Complete | Can control access |
| Admin approval workflow | ✅ Complete | Manual activation flow |
| SMS notifications | ✅ Ready | Twilio integrated (needs credentials) |

### ❌ Not Yet Built
| Feature | Priority | Effort |
|---------|----------|--------|
| License code system | High | 8-12 hours |
| Email notifications | High | 6-10 hours |
| Stripe integration | Medium | 20-30 hours |
| Self-serve signup | Medium | 4-6 hours |

---

## Recommended Pricing Model

### Tier Structure

| Tier | Price (CHF) | Target Audience | Features |
|------|-------------|-----------------|----------|
| **Free** | 0 | Students, curious teachers | Standard list (30 adj.), no PDF, no custom lists |
| **Teacher** | 59/year | Individual teachers | Custom lists, PDF export, Premium lists, QR codes, share links |
| **School** | 399/year | Schools with multiple teachers | Unlimited teachers, all features, priority support, analytics |
| **District** | Custom | School districts | Multi-school license, dedicated support, custom lists |

### Pricing Rationale

**Teacher Tier (59 CHF/year)**
- ~5 CHF/month - affordable for individual teachers
- Lower than competitors (Mentimeter Edu: ~100 CHF/year)
- Includes all practical features needed

**School Tier (399 CHF/year)**
- Per-school, not per-teacher (simplifies budgeting)
- Competitive with similar EdTech tools
- Schools have dedicated budgets for digital tools
- ROI: If used by 10 teachers, ~40 CHF/teacher/year

---

## Implementation Phases

### Phase 1: Manual Licensing (Current - Pilot)
**Timeline:** Now - Month 3  
**Effort:** 0 hours (already built)

**How it works:**
1. Teacher registers → status = `pending`
2. Admin receives SMS notification
3. Admin manually approves → status = `active`
4. Admin sets `active_until` if time-limited

**Revenue collection:**
- Invoice via email (manual)
- Bank transfer or Twitch payment
- Track in spreadsheet

**Pros:** No development needed, test pricing  
**Cons:** Doesn't scale, admin bottleneck

---

### Phase 2: License Code System
**Timeline:** Month 2-3  
**Effort:** 8-12 hours

**How it works:**
1. Generate license codes (e.g., `VIEL-A7X9-K2M4`)
2. Sell codes via invoice or simple checkout
3. Teacher enters code → auto-activation
4. Code sets `active_until` based on license duration

**Technical implementation:**
```
New table: license_codes
- id
- code (unique, e.g., "VIEL-A7X9-K2M4")  
- type (teacher/school)
- duration_days (365 for yearly)
- school_id (nullable, for school licenses)
- redeemed_by (user_id)
- redeemed_at (timestamp)
- created_at
```

**New endpoints:**
- POST `/api/user/redeem-license` - User redeems code
- GET `/api/admin/licenses` - List all codes
- POST `/api/admin/licenses` - Generate new codes
- POST `/api/admin/licenses/bulk` - Generate batch (e.g., 10 codes)

**Revenue collection:**
- Sell codes directly (invoice)
- Partner with resellers
- Bundle with training/workshops

**Pros:** Self-serve, scales better, no payment gateway needed  
**Cons:** Manual code distribution, can't do subscriptions

---

### Phase 3: Stripe Integration
**Timeline:** Month 4-6  
**Effort:** 20-30 hours

**How it works:**
1. Teacher clicks "Upgrade" → Stripe Checkout
2. Payment processed → webhook triggers activation
3. Subscription auto-renews yearly
4. Customer portal for self-service

**Technical implementation:**
```
New table: subscriptions
- id
- user_id
- stripe_customer_id
- stripe_subscription_id
- plan (teacher/school)
- status (active/cancelled/past_due)
- current_period_end
- created_at
```

**Stripe products to create:**
- "Vielseitig Teacher" - 59 CHF/year
- "Vielseitig School" - 399 CHF/year

**New endpoints:**
- POST `/api/billing/create-checkout` - Create Stripe Checkout session
- POST `/api/billing/webhook` - Handle Stripe webhooks
- GET `/api/billing/portal` - Get customer portal URL

**Pros:** Fully automated, professional, handles taxes  
**Cons:** Stripe fees (~2.9% + 0.30 CHF), more complex

---

## Conversion Funnel Optimization

### Current Funnel
```
Visit Homepage → Start Sorting → Complete Sorting → Try PDF → Blocked → ???
```

### Optimized Funnel
```
Visit Homepage → Start Sorting → Complete Sorting → Try PDF → 
    → See "PDF nur mit Schul-Lizenz" + CTA
    → Register as Teacher
    → Admin approves
    → Activate/Pay
    → PDF unlocked
```

### Key Conversion Points

1. **PDF Button on Standard List**
   - Current: Disabled, unclear why
   - Improved: Show message + "Jetzt registrieren" button
   
2. **Registration Page**
   - Add value proposition: "Als Lehrperson freigeschaltet: PDF-Export, eigene Listen, Premium-Inhalte"
   
3. **Post-Registration**
   - Email: "Deine Registrierung ist eingegangen. Wir melden uns in 24h."
   - Follow-up email after approval with getting-started guide

4. **In-App Upgrade Prompts**
   - When trial expires: "Dein Testzeitraum ist abgelaufen. Jetzt aktivieren?"
   - When creating 2nd custom list: "Mit Schul-Lizenz: unbegrenzte Listen"

---

## Pricing Benchmarks (Swiss EdTech Market)

| Tool | Model | Price Range |
|------|-------|-------------|
| Classtime | Per-teacher subscription | 8-15 CHF/month |
| Mentimeter Education | Per-teacher yearly | ~100 CHF/year |
| Kahoot! EDU | School license | 300-500 CHF/year |
| Quizlet Teacher | Individual | ~40 CHF/year |
| Padlet | School | 200-400 CHF/year |

**Positioning:** Vielseitig is simpler and more focused. Price slightly below average to encourage adoption, then increase as value is proven.

---

## Revenue Projections

### Conservative Scenario

| Year | Schools | Teachers | Avg Revenue/School | Total Revenue |
|------|---------|----------|-------------------|---------------|
| Y1 (Pilot) | 10 | 30 | 300 CHF | 3,000 CHF |
| Y2 | 50 | 150 | 350 CHF | 17,500 CHF |
| Y3 | 150 | 500 | 380 CHF | 57,000 CHF |
| Y4 | 300 | 1,000 | 400 CHF | 120,000 CHF |

### Optimistic Scenario

| Year | Schools | Teachers | Avg Revenue/School | Total Revenue |
|------|---------|----------|-------------------|---------------|
| Y1 | 20 | 80 | 350 CHF | 7,000 CHF |
| Y2 | 100 | 400 | 380 CHF | 38,000 CHF |
| Y3 | 300 | 1,200 | 400 CHF | 120,000 CHF |
| Y4 | 600 | 2,500 | 420 CHF | 252,000 CHF |

### Key Assumptions
- Average school has 3-5 teachers using the tool
- 80% school licenses, 20% individual teachers
- 70% annual renewal rate
- Word-of-mouth growth (teachers recommend to colleagues)

---

## Go-to-Market Strategy

### Phase 1: Pilot Schools (Month 1-3)
**Goal:** 5-10 paying schools

**Actions:**
1. Identify 3-5 partner schools (existing contacts)
2. Offer free pilot (2 months)
3. Collect feedback and testimonials
4. Convert to paid at pilot end

**Success metrics:**
- 80% pilot completion rate
- 60% conversion to paid
- Net Promoter Score > 40

### Phase 2: Regional Expansion (Month 4-6)
**Goal:** 30-50 schools in German-speaking Switzerland

**Actions:**
1. Create landing page with testimonials
2. Email outreach to school IT contacts
3. Present at 1-2 teacher conferences
4. Partner with cantonal education offices

**Marketing channels:**
- Direct email to school administrators
- LinkedIn (teachers, school leaders)
- Teacher forums (lehrerforen.de, 4teachers.de)
- Education trade shows (Didacta)

### Phase 3: DACH Expansion (Month 7-12)
**Goal:** 100+ schools in CH/DE/AT

**Actions:**
1. Localize for German/Austrian school systems
2. Partner with teacher training institutions
3. Create case studies and ROI calculator
4. Consider reseller partnerships

---

## Competitive Advantages

| Advantage | Why It Matters |
|-----------|----------------|
| **Privacy-focused** | No student data stored, GDPR-friendly, schools love this |
| **Simple & focused** | Does one thing well, not bloated with features |
| **Local (Swiss)** | Swiss schools prefer local providers |
| **Offline-capable** | Works on unreliable school WiFi (with PWA) |
| **Beautiful output** | Hexagon visualization is unique and shareable |
| **No student accounts** | Zero friction for classroom use |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low adoption | Medium | High | Start with pilot schools, validate PMF |
| Competitor copies | Low | Medium | Move fast, build brand, add features |
| Schools can't pay | Low | Medium | Offer payment plans, invoice option |
| Technical issues | Medium | High | Monitoring, backups, support channel |
| Churn after year 1 | Medium | Medium | Engagement features, annual reminders |

---

## Action Items

### Immediate (This Week)
- [ ] Add "Jetzt registrieren" CTA on disabled PDF button
- [ ] Set up basic analytics tracking (registrations, conversions)
- [ ] Prepare pilot school outreach email

### Short-term (Month 1)
- [ ] Implement email notifications (registration, approval)
- [ ] Create license code system
- [ ] Sign up 3 pilot schools

### Medium-term (Month 2-3)
- [ ] Implement Stripe checkout (if volume justifies)
- [ ] Create marketing landing page
- [ ] Collect testimonials from pilot schools

### Long-term (Month 4-6)
- [ ] Launch public pricing page
- [ ] Begin regional marketing
- [ ] Consider hiring part-time support

---

## Financial Summary

### Startup Costs
| Item | Cost (CHF) |
|------|------------|
| Domain + Hosting | ~200/year |
| Stripe fees | ~3% of revenue |
| Email service | ~50/year |
| Marketing | 500-1000 |
| **Total Year 1** | ~1,500 CHF |

### Break-even Analysis
- Fixed costs: ~1,500 CHF/year
- Average revenue per school: 350 CHF
- **Break-even: 5 schools**

### Profit Potential (Year 3)
- Revenue: 57,000 CHF (conservative)
- Costs: ~5,000 CHF
- **Net profit: ~52,000 CHF**

---

## Conclusion

Vielseitig has strong monetization potential in the Swiss/German education market. The recommended approach:

1. **Start simple** - Manual licensing during pilot phase
2. **Validate pricing** - Test with 5-10 schools before public launch
3. **Automate gradually** - License codes first, then Stripe
4. **Focus on schools** - Higher LTV than individual teachers
5. **Leverage privacy** - Key differentiator in education market

**Next step:** Reach out to 3 pilot schools this week and offer free 2-month trial with commitment to provide feedback.

---

*Last Updated: 2026-02-03*
