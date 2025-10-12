# 🚀 Plan de Acción Inmediato Q1 2026 - On Tour App

**Objetivo**: Cerrar gaps críticos y preparar monetización  
**Timeline**: Enero - Marzo 2026 (12 semanas)  
**Focus**: Offline + E-sign + Inbox = Fundamentos sólidos

---

## 📋 SPRINT STRUCTURE (Scrum 2-week sprints)

### Sprint 1-2: Offline Infrastructure (Semanas 1-4)
### Sprint 3-4: Contratos & E-sign (Semanas 5-8)
### Sprint 5-6: Inbox & Polish (Semanas 9-12)

---

## 🎯 SPRINT 1-2: OFFLINE INFRASTRUCTURE

### Objetivo
Implementar offline-first con IndexedDB + sync robusto

### User Stories

#### US-1: Como tour manager, quiero acceder a mis shows sin internet
**Acceptance Criteria**:
- [ ] Todos los shows se cachean en IndexedDB
- [ ] UI muestra indicador "Offline Mode"
- [ ] Puedo crear/editar shows offline
- [ ] Cambios se sincronizan automáticamente al reconectar
- [ ] No hay pérdida de datos en conflictos

**Tasks**:
```typescript
// 1. Setup Dexie.js
npm install dexie

// 2. Define schema
// src/lib/offlineDb.ts
import Dexie, { Table } from 'dexie';

interface OfflineShow {
  id: string;
  data: any;
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

class OfflineDatabase extends Dexie {
  shows!: Table<OfflineShow>;
  finance!: Table<any>;
  contracts!: Table<any>;

  constructor() {
    super('OnTourDB');
    this.version(1).stores({
      shows: 'id, lastModified, syncStatus',
      finance: 'id, showId, lastModified',
      contracts: 'id, showId, lastModified'
    });
  }
}

export const db = new OfflineDatabase();

// 3. Sync service
// src/services/syncService.ts
class SyncService {
  async syncShows() {
    const pending = await db.shows
      .where('syncStatus').equals('pending')
      .toArray();
    
    for (const show of pending) {
      try {
        await api.updateShow(show.id, show.data);
        await db.shows.update(show.id, { 
          syncStatus: 'synced' 
        });
      } catch (err) {
        // Handle conflict
      }
    }
  }
}
```

#### US-2: Como usuario, quiero ver indicadores visuales de estado offline
**Acceptance Criteria**:
- [ ] Badge "Offline" en header cuando no hay conexión
- [ ] Contador de cambios pendientes sync
- [ ] Animación cuando sincroniza
- [ ] Notificación si hay conflictos

**Component**:
```tsx
// src/components/OfflineIndicator.tsx
export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const pendingChanges = usePendingSync();

  if (isOnline && pendingChanges === 0) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-4 right-4 z-50 glass p-3 rounded-lg border border-white/10"
    >
      {!isOnline ? (
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-white/80">Modo Offline</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-accent-500 animate-spin" />
          <span className="text-sm text-white/80">
            Sincronizando {pendingChanges} cambios...
          </span>
        </div>
      )}
    </motion.div>
  );
};
```

#### US-3: Como usuario, necesito resolver conflictos de sincronización
**Acceptance Criteria**:
- [ ] Modal muestra cambios locales vs servidor
- [ ] Puedo elegir: mantener local, usar servidor, o merge manual
- [ ] Historial de conflictos resueltos
- [ ] Auto-resolve simple conflicts (last-write-wins config)

**UI**:
```tsx
// src/components/ConflictResolver.tsx
export const ConflictResolver: React.FC<{ conflict: Conflict }> = ({ conflict }) => {
  return (
    <Modal>
      <h2>Conflicto de Sincronización</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-4">
          <h3>Tus Cambios (Local)</h3>
          <pre>{JSON.stringify(conflict.local, null, 2)}</pre>
          <Button onClick={() => resolveConflict('local')}>
            Usar mis cambios
          </Button>
        </div>
        <div className="glass p-4">
          <h3>Cambios del Servidor</h3>
          <pre>{JSON.stringify(conflict.remote, null, 2)}</pre>
          <Button onClick={() => resolveConflict('remote')}>
            Usar cambios del servidor
          </Button>
        </div>
      </div>
      <Button variant="secondary" onClick={() => resolveConflict('manual')}>
        Resolver manualmente
      </Button>
    </Modal>
  );
};
```

### Testing
- [ ] Unit tests: syncService.test.ts
- [ ] Integration tests: offline flow completo
- [ ] E2E tests: crear show offline → sync online
- [ ] Performance: 1000 shows cacheados, tiempo de sync

### Documentation
- [ ] `docs/OFFLINE_MODE.md` - Arquitectura y uso
- [ ] User guide: "Trabajar offline"
- [ ] Developer guide: "Extender offline support"

---

## 🎯 SPRINT 3-4: CONTRATOS & E-SIGN

### Objetivo
Integrar firma electrónica y gestión de contratos

### Research Phase (Semana 5)
#### Evaluar proveedores E-sign

**DocuSign**:
- ✅ Industry standard
- ✅ API madura
- ❌ Caro ($25-40/mes base + per envelope)
- ❌ Overkill para indie users

**HelloSign (Dropbox Sign)**:
- ✅ Developer-friendly API
- ✅ Embedded signing
- ✅ Affordable ($15/mes)
- ✅ Free tier (3 docs/mes)
- ⭐ **RECOMENDADO**

**SignRequest**:
- ✅ Muy barato ($8/mes)
- ✅ EU-based (GDPR)
- ❌ API menos documentada

**Custom (react-signature-canvas)**:
- ✅ Gratis, full control
- ❌ No legal validity en muchos países
- ❌ No audit trail
- ❌ Reinventar rueda

**Decisión**: HelloSign API para MVP

### User Stories

#### US-4: Como manager, quiero enviar un rider para firma
**Acceptance Criteria**:
- [ ] Upload PDF desde show details
- [ ] Añadir signatarios con email
- [ ] Preview del documento
- [ ] Track status (sent/viewed/signed)
- [ ] Notificación cuando firman
- [ ] PDF firmado se guarda automáticamente

**Implementation**:
```typescript
// src/services/esignService.ts
import HelloSign from 'hellosign-sdk';

interface SignatureRequest {
  documentId: string;
  showId: string;
  signers: Array<{
    name: string;
    email: string;
    role: 'artist' | 'venue' | 'promoter' | 'agent';
  }>;
  message?: string;
}

export class ESignService {
  private client = new HelloSign({ apiKey: process.env.HELLOSIGN_API_KEY });

  async sendForSignature(request: SignatureRequest) {
    const opts = {
      test_mode: process.env.NODE_ENV !== 'production',
      clientId: process.env.HELLOSIGN_CLIENT_ID,
      title: `Contract for Show ${request.showId}`,
      subject: 'Please sign this contract',
      message: request.message || 'Please review and sign',
      signers: request.signers.map((s, i) => ({
        email_address: s.email,
        name: s.name,
        order: i
      })),
      file_url: [request.documentId],
      metadata: {
        showId: request.showId,
        appSource: 'OnTourApp'
      }
    };

    const result = await this.client.signatureRequest.send(opts);
    return result.signature_request;
  }

  async getSignatureStatus(signatureRequestId: string) {
    const result = await this.client.signatureRequest.get(signatureRequestId);
    return {
      isComplete: result.is_complete,
      hasError: result.has_error,
      signatures: result.signatures.map(s => ({
        signer: s.signer_email_address,
        status: s.status_code,
        signedAt: s.signed_at
      }))
    };
  }

  async downloadSignedDocument(signatureRequestId: string) {
    const file = await this.client.signatureRequest.download(
      signatureRequestId,
      { file_type: 'pdf' }
    );
    return file;
  }
}
```

#### US-5: Como usuario, quiero templates de contratos legales
**Acceptance Criteria**:
- [ ] Library de templates (rider, contract, invoice)
- [ ] Variables dinámicas ({{venue}}, {{fee}}, {{date}})
- [ ] Templates por país (US/UK/EU/ES)
- [ ] Custom templates (upload propio)
- [ ] Preview antes de enviar

**Data Model**:
```typescript
interface ContractTemplate {
  id: string;
  name: string;
  type: 'rider' | 'contract' | 'invoice' | 'custom';
  country: 'US' | 'UK' | 'EU' | 'ES' | 'ALL';
  language: 'en' | 'es' | 'de' | 'fr';
  content: string; // HTML with {{variables}}
  variables: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'money';
    required: boolean;
    defaultValue?: any;
  }>;
  createdBy: 'system' | 'user';
}

// Example template
const riderTemplateES: ContractTemplate = {
  id: 'rider-basic-es',
  name: 'Rider Técnico Básico España',
  type: 'rider',
  country: 'ES',
  language: 'es',
  content: `
    <h1>RIDER TÉCNICO</h1>
    <p>Artista: {{artistName}}</p>
    <p>Fecha: {{showDate}}</p>
    <p>Venue: {{venue}}</p>
    
    <h2>Requisitos Técnicos</h2>
    <ul>
      <li>Sistema de sonido: {{soundSystem}}</li>
      <li>Escenario: {{stageSize}}</li>
      <li>Iluminación: {{lighting}}</li>
    </ul>
    
    <h2>Hospitalidad</h2>
    <ul>
      <li>Catering: {{catering}}</li>
      <li>Bebidas: {{drinks}}</li>
      <li>Green room: {{greenRoom}}</li>
    </ul>
  `,
  variables: [
    { key: 'artistName', label: 'Nombre del artista', type: 'text', required: true },
    { key: 'showDate', label: 'Fecha del show', type: 'date', required: true },
    { key: 'venue', label: 'Nombre del venue', type: 'text', required: true },
    // ... más variables
  ],
  createdBy: 'system'
};
```

#### US-6: Como usuario, quiero buscar en mis contratos
**Acceptance Criteria**:
- [ ] Full-text search en PDFs (OCR)
- [ ] Filtros: tipo, estado, fecha, show
- [ ] Search: "rider" → encuentra todos los riders
- [ ] Highlight de términos encontrados
- [ ] Export resultados búsqueda

**Search Implementation**:
```typescript
// src/services/contractSearchService.ts
import FlexSearch from 'flexsearch';

class ContractSearchService {
  private index: FlexSearch.Document;

  constructor() {
    this.index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['content', 'fileName', 'metadata'],
        store: ['id', 'showId', 'type', 'fileName']
      },
      tokenize: 'forward',
      context: true
    });
  }

  async indexContract(contract: Contract) {
    // Extract text from PDF using pdf.js or cloud OCR
    const text = await this.extractTextFromPDF(contract.fileUrl);
    
    await this.index.add({
      id: contract.id,
      content: text,
      fileName: contract.fileName,
      metadata: `${contract.type} ${contract.status}`,
      showId: contract.showId,
      type: contract.type
    });
  }

  async search(query: string) {
    const results = await this.index.search(query, {
      limit: 50,
      suggest: true
    });
    return results;
  }

  private async extractTextFromPDF(url: string): Promise<string> {
    // Use pdf.js or OCR service
    // For MVP: use cloud OCR (Google Cloud Vision API)
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Send to OCR service
    const text = await ocrService.extractText(blob);
    return text;
  }
}
```

### UI Components

```tsx
// src/pages/dashboard/Contracts.tsx
export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ContractType | 'all'>('all');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Contratos</h1>
        <Button onClick={() => openUploadModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Subir Contrato
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="glass p-4 rounded-xl border border-white/10 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar en contratos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="all">Todos</option>
            <option value="rider">Riders</option>
            <option value="contract">Contratos</option>
            <option value="invoice">Facturas</option>
          </select>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map(contract => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
      </div>
    </div>
  );
};

const ContractCard: React.FC<{ contract: Contract }> = ({ contract }) => {
  const statusColors = {
    draft: 'text-white/60',
    sent: 'text-blue-400',
    signed: 'text-green-400',
    expired: 'text-red-400'
  };

  return (
    <div className="glass p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white/60" />
        </div>
        <span className={`text-xs font-medium ${statusColors[contract.status]}`}>
          {contract.status}
        </span>
      </div>
      
      <h3 className="text-sm font-medium text-white mb-1 truncate">
        {contract.fileName}
      </h3>
      
      <p className="text-xs text-white/50 mb-3">
        {contract.showName} • {formatDate(contract.createdAt)}
      </p>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost">
          <Eye className="w-3 h-3 mr-1" />
          Ver
        </Button>
        <Button size="sm" variant="ghost">
          <Download className="w-3 h-3 mr-1" />
          Descargar
        </Button>
      </div>
    </div>
  );
};
```

### Testing
- [ ] E2E: Enviar contrato → firma → descarga
- [ ] Unit: extractTextFromPDF
- [ ] Integration: HelloSign webhook handling
- [ ] Security: File upload validation

### Documentation
- [ ] `docs/CONTRACTS.md` - Feature guide
- [ ] Legal compliance checklist
- [ ] HelloSign API integration guide

---

## 🎯 SPRINT 5-6: INBOX & POLISH

### Objetivo
Centralizar comunicaciones por show

### User Stories

#### US-7: Como manager, quiero centralizar emails por show
**Acceptance Criteria**:
- [ ] Thread de conversaciones por show
- [ ] Email forwarding: show+[showId]@ontourapp.com
- [ ] Parse emails automáticamente
- [ ] Attachments se guardan en show
- [ ] Estados: pending/resolved
- [ ] Menciones @team

**Architecture**:
```typescript
// Email ingestion via Sendgrid Inbound Parse
// POST /api/webhooks/inbound-email

interface InboundEmail {
  from: string;
  to: string; // show+abc123@ontourapp.com
  subject: string;
  html: string;
  text: string;
  attachments: Array<{
    filename: string;
    type: string;
    content: Buffer;
  }>;
}

async function handleInboundEmail(email: InboundEmail) {
  // Parse showId from recipient
  const match = email.to.match(/show\+([a-z0-9]+)@/);
  if (!match) return;
  
  const showId = match[1];
  
  // Create message in inbox
  await db.messages.add({
    showId,
    from: email.from,
    subject: email.subject,
    body: email.html || email.text,
    attachments: await uploadAttachments(email.attachments),
    status: 'pending',
    createdAt: new Date()
  });
  
  // Notify team members
  await notifyTeam(showId, email.from, email.subject);
}
```

#### US-8: Como usuario, quiero responder desde la app
**Acceptance Criteria**:
- [ ] Reply inline desde show
- [ ] Rich text editor
- [ ] Attach files
- [ ] CC/BCC team members
- [ ] Thread view (Gmail-style)

**Component**:
```tsx
// src/components/inbox/InboxThread.tsx
export const InboxThread: React.FC<{ showId: string }> = ({ showId }) => {
  const messages = useInboxMessages(showId);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = async () => {
    await api.sendEmail({
      showId,
      to: messages[0].from,
      subject: `Re: ${messages[0].subject}`,
      body: replyText
    });
    
    setReplyText('');
  };

  return (
    <div className="glass p-6 rounded-xl border border-white/10">
      <h3 className="text-lg font-medium text-white mb-4">
        Conversaciones
      </h3>

      {/* Messages Thread */}
      <div className="space-y-4 mb-6">
        {messages.map(msg => (
          <div key={msg.id} className="flex items-start gap-3">
            <Avatar user={msg.from} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">
                  {msg.fromName}
                </span>
                <span className="text-xs text-white/50">
                  {formatRelative(msg.createdAt)}
                </span>
              </div>
              <div 
                className="text-sm text-white/80"
                dangerouslySetInnerHTML={{ __html: msg.body }}
              />
              {msg.attachments.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {msg.attachments.map(att => (
                    <AttachmentChip key={att.id} attachment={att} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="border-t border-white/10 pt-4">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Escribe tu respuesta..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
          rows={4}
        />
        <div className="flex items-center justify-between mt-3">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4 mr-2" />
            Adjuntar
          </Button>
          <Button onClick={handleSendReply}>
            <Send className="w-4 h-4 mr-2" />
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### Polish & Bug Fixes

#### Performance Optimization
- [ ] Lazy load contracts list
- [ ] Virtualize inbox messages
- [ ] Optimize offline sync (batch updates)
- [ ] Reduce bundle size (code splitting)

#### UI/UX Improvements
- [ ] Loading skeletons everywhere
- [ ] Empty states illustrations
- [ ] Error boundaries con recovery
- [ ] Toast notifications sistema

#### Accessibility
- [ ] Keyboard navigation completa
- [ ] Screen reader testing
- [ ] Focus management en modals
- [ ] ARIA labels en todo

### Testing
- [ ] E2E: Email → inbox → reply
- [ ] Load testing: 1000 messages
- [ ] Security: XSS en email body
- [ ] Mobile testing: iOS + Android

### Documentation
- [ ] `docs/INBOX.md` - Architecture
- [ ] User guide: Email forwarding setup
- [ ] API docs: Webhooks

---

## 📊 METRICS & SUCCESS CRITERIA

### Sprint 1-2 (Offline)
- [ ] 100% shows accessible offline
- [ ] 0 data loss en 100 test sync cycles
- [ ] <500ms cache read time
- [ ] <3s full sync con 100 shows

### Sprint 3-4 (Contratos)
- [ ] 50 contracts sent en beta
- [ ] 90% signature completion rate
- [ ] <5min average time to send
- [ ] 100% legal compliance

### Sprint 5-6 (Inbox)
- [ ] 100 emails processed en beta
- [ ] 95% emails parsed correctly
- [ ] <1s email delivery time
- [ ] 0 lost attachments

### Overall Q1 Success
- [ ] 100 active beta users
- [ ] 50 paid conversions
- [ ] NPS > 40
- [ ] 0 critical bugs
- [ ] <5% churn rate

---

## 💰 BUDGET & RESOURCES

### External Services
- HelloSign API: $15/mes (free tier para beta)
- Sendgrid Inbound Parse: $20/mes
- Google Cloud Vision OCR: ~$10/mes
- AWS S3 contracts storage: ~$5/mes

**Total mensual**: ~$50

### Development Team
- 1 Senior Full-stack: 40h/semana
- 1 Frontend Dev: 20h/semana
- 1 QA/Tester: 10h/semana
- 1 Technical Writer: 5h/semana

### External Help (Optional)
- Security audit: $2K (one-time)
- Legal review templates: $1K (one-time)
- UX consultant: $500 (one-time)

---

## 🚨 RISKS & CONTINGENCIES

### Risk: HelloSign API limits
**Impact**: High  
**Probability**: Medium  
**Mitigation**: Monitor usage, upgrade tier si needed, have SignRequest as backup

### Risk: Offline sync conflicts
**Impact**: High  
**Probability**: High  
**Mitigation**: Extensive testing, rollback strategy, manual resolution UI

### Risk: Email parsing failures
**Impact**: Medium  
**Probability**: Medium  
**Mitigation**: Fallback to raw email display, manual categorization

### Risk: Scope creep
**Impact**: Medium  
**Probability**: High  
**Mitigation**: Strict sprint planning, defer nice-to-haves to Q2

---

## ✅ DEFINITION OF DONE

Una feature está "Done" cuando:
- [ ] Code reviewed + merged
- [ ] Unit tests >80% coverage
- [ ] E2E test passing
- [ ] Documentation actualizada
- [ ] Deployed to staging
- [ ] Beta tested con 10 users
- [ ] No critical bugs
- [ ] Accessibility checklist complete
- [ ] Mobile tested
- [ ] Performance metrics met

---

## 📅 SPRINT CALENDAR

### Enero 2026
- W1: Sprint Planning + Offline kickoff
- W2: Offline development
- W3: Offline testing + bug fixes
- W4: Offline polish + sprint review

### Febrero 2026
- W1: Contratos planning + provider setup
- W2: E-sign integration
- W3: Templates + search implementation
- W4: Contratos testing + sprint review

### Marzo 2026
- W1: Inbox planning + email ingestion
- W2: Reply functionality + threading
- W3: Polish sprint + bug bash
- W4: Beta launch + retrospective

---

## 🎓 LEARNING GOALS

### Team Upskilling
- IndexedDB best practices
- Conflict resolution algorithms
- E-signature legal requirements
- Email parsing techniques
- OCR integration

### Process Improvements
- Better sprint estimation
- Automated testing CI/CD
- Feature flags deployment
- User feedback loops

---

**Next Action**: Review con equipo + refinar prioridades  
**Due Date**: End of December 2025  
**Owner**: Product Lead
