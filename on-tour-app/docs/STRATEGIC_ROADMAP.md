# 🎯 Plan Estratégico On Tour App - Análisis de Mercado y Roadmap

**Fecha:** 9 Octubre 2025  
**Versión:** 1.0  
**Basado en:** Análisis de competencia y oportunidades de mercado

---

## 📊 RESUMEN EJECUTIVO

### Posicionamiento Actual
**"De caos a control. De datos a decisiones. On Tour App es el copiloto inteligente de tus giras."**

### Oportunidad de Mercado
- **Mercado Total**: USD 9B (Music Tours 2025) → 12.7B (2031) - CAGR 8.7%
- **Target Inmediato**: Indie/medianos managers (70% usan Excel + email)
- **Potencial 2-3 años**: 100-200M USD (1-2% market share)

### Ventajas Competitivas Únicas
1. ✅ **IA Proactiva** (Quick Entry NLP, ActionHub, Health Score)
2. ✅ **UX Premium** (Glassmorphism, animaciones fluidas, mobile-first)
3. ✅ **Ecosistema Flexible** (Roles dinámicos, dashboards personalizables)
4. ✅ **Documentación Evolutiva** (Proceso iterativo, developer-friendly)

### Gaps Críticos vs Competencia
1. ❌ **E-sign & Contratos** (Gigwell/Stagent lo tienen)
2. ❌ **Settlement 1-click** (Prism/Back On Stage lo tienen)
3. ❌ **Inbox Contextual** (Gigwell chat in-app)
4. ❌ **Offline Robusto** (Master Tour/Daysheets lideran)
5. ❌ **Travel/Venues DB** (Daysheets/Master Tour integrados)

---

## 🎯 COMPETENCIA ANALIZADA

### Tier 1: Enterprise Leaders
| Competidor | Precio | Fortaleza | Debilidad |
|------------|--------|-----------|-----------|
| **Master Tour** | $65-200/mes | DB venues/hotels, offline robusto | UI anticuada, clunky |
| **Prism.fm** | $100+/mes | Settlement completo, box office | Solo promotores/venues |

### Tier 2: Mid-Market Players
| Competidor | Precio | Fortaleza | Debilidad |
|------------|--------|-----------|-----------|
| **Gigwell** | $99+/mes | E-sign integrado, chat in-app | Enfoque solo booking |
| **Stagent** | €39-799/mes | API sólida, contratos | No IA, UI básica |
| **Daysheets** | $30-100/mes | Offline-first mobile, travel | Limitado en finanzas |

### Tier 3: Indie/Freemium
| Competidor | Precio | Fortaleza | Debilidad |
|------------|--------|-----------|-----------|
| **Back On Stage** | $20-50/mes | Auto-bookings, pagos | Básico, pocas features |
| **IndieFlow** | Freemium | Suite generalista | Superficial en tours |

### 🎯 Posicionamiento de On Tour App
**Sweet Spot**: Entre indie (IndieFlow) y mid-market (Gigwell/Stagent)
- Más inteligente que freemium
- Más accesible que enterprise
- Más proactivo que todos

---

## 🚀 ROADMAP ESTRATÉGICO 12-18 MESES

### Q1 2026: FUNDAMENTOS (Ene-Mar)
**Objetivo**: Cerrar gaps críticos de adopción

#### 1.1 Offline Robusto ⭐ CRÍTICO
**Gap**: Master Tour/Daysheets dominan
**Solución**:
- IndexedDB para shows/finance/contracts
- Service Worker con sync inteligente
- Modo offline-first con indicadores visuales
- Resolución de conflictos automática
- Cache de mapas offline (MapLibre tiles)

**Impacto**: Adoption blocker para tour managers en carretera

#### 1.2 E-sign & Contratos Digitales ⭐ CRÍTICO
**Gap**: Gigwell/Stagent integrados
**Solución**:
- Integración DocuSign o HelloSign
- Templates legales por país (rider, contract, invoice)
- Upload PDF + link a show específico
- Búsqueda full-text en contratos
- Auditoría de cambios y versiones
- Recordatorios automáticos pre-show

**Features**:
```typescript
interface Contract {
  id: string;
  showId: string;
  type: 'rider' | 'contract' | 'invoice' | 'other';
  status: 'draft' | 'sent' | 'signed' | 'expired';
  parties: Party[];
  signedAt?: Date;
  expiresAt?: Date;
  fileUrl: string;
  searchableText: string; // OCR extracted
}
```

**Impacto**: Deal-closer para agencias medianas

#### 1.3 Inbox Contextual por Booking ⭐ HIGH
**Gap**: Gigwell tiene chat in-app
**Solución**:
- Thread de conversaciones por show
- Email forwarding a show específico
- Integración Gmail/Outlook API
- Estados: pending/waiting/resolved
- Attachments automáticos a contratos
- Menciones @teammember

**UI**: Similar a Linear/Notion comments

**Impacto**: Reduce "email chaos" que managers odian

---

### Q2 2026: MONETIZACIÓN (Abr-Jun)
**Objetivo**: Freemium → Conversión paid

#### 2.1 Tier Freemium Launch
**Límites gratuitos**:
- 10 shows/mes
- 1 tour activo
- 2 team members
- Features básicos (shows, calendar, finance básica)
- Sin offline, sin e-sign, sin IA avanzada

**Paid Tiers**:
- **Indie** ($19/mes): 50 shows, 5 members, offline, e-sign (10/mes)
- **Pro** ($49/mes): Unlimited shows, 15 members, IA avanzada, settlement
- **Agency** ($99/mes): Multi-roster, white-label, API access

**Impacto**: Acquisition rápida, path to revenue claro

#### 2.2 Settlement Automático + Payouts ⭐ CRÍTICO
**Gap**: Prism/Back On Stage lo tienen
**Solución**:
- Settlement wizard 1-click
- Split payments multiparte (venue/agent/artist)
- Integración Stripe Connect o XRPL
- Auto-invoicing con templates
- Tax compliance por país
- Payment tracking en timeline

**Workflow**:
```
Show confirmed → Generate settlement → 
Split % defined → Payment sent → 
Invoice generated → Tracked in finance
```

**Impacto**: Killer feature para managers, reduce tiempo 80%

#### 2.3 Travel & Venues Database
**Gap**: Daysheets/Master Tour tienen DB
**Solución**:
- Integración Amadeus API (vuelos/hoteles)
- DB venues crowdsourced (capacidad, tech specs, contacto)
- Auto-suggest venues en Quick Entry
- Travel cost estimator en routing
- Per diem calculator por país
- Visa requirements checker

**Impacto**: Convierte app en "single source of truth"

---

### Q3 2026: DIFERENCIACIÓN (Jul-Sep)
**Objetivo**: IA avanzada = moat defensible

#### 3.1 IA Predictiva Avanzada 🤖
**Expansión de Quick Entry**:
- "Berlin → Paris → Madrid" → detecta gap logístico
- "2 shows same day different countries" → alerta automática
- Predict profit margin por show (ML model)
- "If we add Barcelona show, route cost +€800"
- Auto-suggest optimal routing con cost/benefit

**ML Models**:
- Revenue prediction (show type + city + capacity)
- Route optimization (TSP algorithm + real costs)
- Budget forecasting (historical + seasonality)

**Impacto**: "Notion + IA" positioning

#### 3.2 Fiscalidad por País
**Gap**: Nadie lo resuelve bien
**Solución**:
- Tax rates database (EU/US/LatAm)
- Auto-calculate withholding tax
- Export tax-ready reports por jurisdicción
- Integration TurboTax/Xero/Quickbooks
- Alert de tax deadlines por país

**Impacto**: Accountant-friendly = team buy-in

#### 3.3 Analytics Avanzado
**Dashboard insights**:
- "Festivals profitable +35%, small venues -10%"
- "UK tour lost money, DE tour crushed it"
- Compare: projected vs actual por tour
- Benchmark vs industry (anonymous aggregated)
- Export Excel con pivot tables

**Visualizations**:
- Profit heatmap por región
- Timeline de cash flow
- Venue type performance chart
- Currency impact analysis

**Impacto**: Data-driven decisions, CFO-friendly

---

### Q4 2026: ECOSISTEMA (Oct-Dic)
**Objetivo**: Plataforma abierta, network effects

#### 4.1 API Pública + Webhooks
**Developer platform**:
- REST API documentada (Stripe-level docs)
- Webhooks para eventos (show.created, payment.completed)
- OAuth2 para third-party apps
- Rate limits por tier
- SDK JavaScript/Python

**Use cases**:
- Integración accounting software
- Custom reporting tools
- Crew management apps
- Social media auto-posting

**Impacto**: Ecosystem moat, enterprise appeal

#### 4.2 Marketplace Interno
**Services marketplace**:
- Crew database (sound tech, lighting, drivers)
- Promoter connections
- Venue partnerships
- Insurance providers
- Merch suppliers

**Revenue model**: Commission 5-10% on bookings

**Impacto**: Network effects, sticky platform

#### 4.3 White-Label + Enterprise
**Agency tier**:
- Custom branding
- Multi-tenant architecture
- SSO/SAML
- Advanced permissions
- Dedicated support
- SLA guarantees

**Pricing**: $499+/mes custom

**Impacto**: Upmarket move, high margins

---

## 💰 MONETIZACIÓN ESTRATEGIA

### Pricing Model
```
Freemium: $0 (acquisition)
  └─> 10 shows/mes, basic features
  
Indie: $19/mes (indie artists)
  └─> 50 shows, offline, e-sign
  
Pro: $49/mes (managers, small agencies)
  └─> Unlimited, IA, settlement, analytics
  
Agency: $99/mes (multi-roster agencies)
  └─> Multi-tenant, API, white-label
  
Enterprise: $499+/mes (custom)
  └─> Dedicated, SLA, custom integrations
```

### Revenue Projections
**Year 1 (2026)**:
- 5,000 freemium users
- 500 paid conversions (10% rate)
- Avg $35/mes = $210K ARR

**Year 2 (2027)**:
- 20,000 freemium
- 3,000 paid (15% rate)
- Avg $45/mes = $1.62M ARR

**Year 3 (2028)**:
- 50,000 freemium
- 10,000 paid (20% rate)
- 50 enterprise ($499/mes)
- Total = $5.1M ARR

---

## 🎨 MESSAGING & BRANDING

### Tagline
**"De caos a control. De datos a decisiones."**

### Value Props por Segmento

#### Indie Artists
- "Gestiona tu primer tour como un pro"
- "De Excel a app inteligente en 10 minutos"
- Focus: Simplicidad, templates, guías

#### Tour Managers
- "Tu copiloto IA para tours complejos"
- "Anticipa problemas antes de que ocurran"
- Focus: IA, automation, offline

#### Agencies
- "Multi-roster management sin caos"
- "Un dashboard para todos tus artistas"
- Focus: Escalabilidad, permisos, reporting

### Competitive Positioning

| Competidor | Nosotros |
|------------|----------|
| Master Tour: Robusto pero anticuado | **Moderno y proactivo** |
| Prism: Solo promotores | **Para artistas y managers** |
| Gigwell: Solo booking | **Suite completa** |
| Excel: Manual y frágil | **Inteligente y confiable** |

---

## 🔧 TECH STACK EVOLUTION

### Current Stack ✅
- React 18 + TypeScript
- Vite build system
- MapLibre GL JS
- Framer Motion
- PWA + Service Worker
- IndexedDB (partial)

### Q1 2026 Additions
- **Offline**: Dexie.js (IndexedDB wrapper)
- **E-sign**: DocuSign API
- **Search**: FlexSearch (contracts full-text)
- **Email**: Gmail/Outlook API integration

### Q2 2026 Additions
- **Payments**: Stripe Connect
- **Travel**: Amadeus API
- **ML**: TensorFlow.js (client-side predictions)

### Q3 2026 Additions
- **Analytics**: Apache ECharts (advanced charts)
- **Tax**: Custom tax rates database
- **Export**: xlsx advanced (pivot tables)

### Q4 2026 Additions
- **API**: Express + OpenAPI docs
- **Webhooks**: Redis pub/sub
- **Multi-tenant**: Row-level security
- **SSO**: Auth0 enterprise

---

## 📈 METRICS & KPIs

### North Star Metric
**"Tours successfully completed with On Tour App"**

### Leading Indicators
- Weekly active users (WAU)
- Shows created per user
- Time to first show
- Feature adoption rate
- NPS score

### Lagging Indicators
- Monthly recurring revenue (MRR)
- Churn rate (target <5%)
- Customer lifetime value (LTV)
- Customer acquisition cost (CAC)
- LTV:CAC ratio (target 3:1)

### Success Criteria by Quarter

**Q1 2026**:
- 1,000 beta users
- 50 paid conversions
- NPS > 40

**Q2 2026**:
- 5,000 total users
- 500 paid users
- $15K MRR

**Q3 2026**:
- 15,000 total users
- 2,000 paid users
- $75K MRR

**Q4 2026**:
- 30,000 total users
- 4,000 paid users
- $150K MRR

---

## 🚧 RISKS & MITIGATION

### Risk 1: Enterprise Sales Cycle
**Problema**: Agencies tardan 3-6 meses en decidir
**Mitigation**: Focus en indie/pro primero, bottom-up adoption

### Risk 2: Feature Parity Race
**Problema**: Competidores copian features
**Mitigation**: IA = moat defensible, velocidad de iteración

### Risk 3: Offline Complexity
**Problema**: Sync conflicts, data corruption
**Mitigation**: Extensive testing, gradual rollout, rollback strategy

### Risk 4: Payment Processing Risk
**Problema**: Fraud, chargebacks, compliance
**Mitigation**: Stripe handles compliance, escrow for settlements

### Risk 5: Saturación Marketing
**Problema**: Bandsintown/Eventbrite dominan awareness
**Mitigation**: Positioning diferente (gestión vs promo), community-led growth

---

## 🎯 GO-TO-MARKET STRATEGY

### Phase 1: Beta Launch (Q1 2026)
**Target**: 100 beta users (hand-picked)
- Tour managers con >50 shows/año
- Indie artists con tours activos
- Small agencies (2-5 artistas)

**Channels**:
- Direct outreach LinkedIn
- Music industry forums
- Reddit r/WeAreTheMusicMakers
- ProductHunt launch

### Phase 2: Freemium Launch (Q2 2026)
**Target**: 5,000 users en 90 días

**Channels**:
- SEO content (tour management guides)
- YouTube tutorials
- Partnerships con music schools
- Referral program (free month per referral)

### Phase 3: Paid Growth (Q3-Q4 2026)
**Target**: 4,000 paid users EOY

**Channels**:
- Paid ads (Google/FB retargeting)
- Conference sponsorships (SXSW, Primavera Pro)
- Agency partnerships (white-label)
- Case studies & testimonials

---

## 📚 DOCUMENTATION STRATEGY

### Developer Docs
- API reference (Stripe-level)
- Webhooks guide
- SDK examples
- Integration tutorials

### User Docs
- Getting started guide
- Video tutorials por feature
- Template library (contracts, riders)
- Best practices from pros

### Sales Enablement
- Comparison sheets vs competidores
- ROI calculator
- Demo videos
- Case studies

---

## ✅ IMMEDIATE ACTION ITEMS (Next 30 Days)

### Week 1-2: Planning
- [ ] Audit current codebase vs roadmap
- [ ] Define Q1 2026 sprint structure
- [ ] Hire/contract resources (backend dev, ML engineer)
- [ ] Setup analytics infrastructure (PostHog/Mixpanel)

### Week 3-4: Foundation
- [ ] Implement IndexedDB architecture (Dexie.js)
- [ ] Research DocuSign vs HelloSign vs custom
- [ ] Design contracts data model
- [ ] Prototype inbox contextual UI

### Month 2: Development
- [ ] Build offline sync logic
- [ ] Integrate e-sign provider
- [ ] Build contract search
- [ ] Test with 10 beta users

### Month 3: Polish & Launch
- [ ] Bug fixes from beta
- [ ] Documentation complete
- [ ] Marketing materials ready
- [ ] Launch to 100 users

---

## 🎓 LESSONS FROM COMPETITORS

### From Master Tour
✅ **Learn**: Offline-first es crítico, DB venues valiosa
❌ **Avoid**: UI anticuada, onboarding complejo

### From Prism
✅ **Learn**: Settlement 1-click es killer feature
❌ **Avoid**: Target muy narrow (solo promotores)

### From Gigwell
✅ **Learn**: E-sign integrado es table stakes
❌ **Avoid**: Feature creep, todo en one screen

### From Daysheets
✅ **Learn**: Mobile-first para tour managers
❌ **Avoid**: Finanzas muy básicas

### From IndieFlow
✅ **Learn**: Freemium acquisition works
❌ **Avoid**: Jack of all trades, master of none

---

## 💡 INNOVATION OPPORTUNITIES

### 1. Blockchain Settlements (XRPL)
- Instant cross-border payments
- Transparent split contracts
- No intermediaries
- Lower fees than Stripe

### 2. AI Tour Optimizer
- "Where should we tour next?" ML model
- Predict demand por city + timing
- Optimize route for profit + logistics
- "What-if" scenario simulator

### 3. Social Features
- Public tour pages (shareable)
- Crew marketplace ratings
- Venue reviews (Yelp for venues)
- Manager network (LinkedIn for tours)

### 4. Hardware Integrations
- Badge scanners (guest list)
- POS integration (merch sales)
- Sound level meters (rider compliance)
- Real-time attendance tracking

---

## 🌍 INTERNATIONAL EXPANSION

### Phase 1: English-speaking (2026)
- US, UK, Canada, Australia
- English-only product

### Phase 2: Europe (2027)
- Spain, Germany, France, Italy
- Localization + tax compliance

### Phase 3: LatAm (2028)
- Mexico, Brazil, Argentina
- Spanish/Portuguese

### Key Considerations
- Currency support (multi-currency)
- Tax regulations por país
- Legal templates localized
- Payment methods locales
- Time zones & date formats

---

## 📞 NEXT STEPS

### For Product Team
1. Review roadmap alignment
2. Prioritize Q1 2026 features
3. Setup sprint planning
4. Define success metrics

### For Marketing
1. Refine messaging per segment
2. Create content calendar
3. Plan ProductHunt launch
4. Build case study pipeline

### For Sales (Future)
1. Define ICP (Ideal Customer Profile)
2. Create sales playbook
3. Build demo environment
4. Setup CRM (HubSpot/Pipedrive)

### For Investors (Future)
1. Pitch deck update con roadmap
2. Financial projections detalladas
3. Competitive analysis deck
4. Market sizing validation

---

**Prepared by**: Development Team  
**Date**: 9 Octubre 2025  
**Status**: Draft for Review  
**Next Review**: End of Q4 2025
