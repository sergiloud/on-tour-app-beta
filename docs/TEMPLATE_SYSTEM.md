# Template System Guide

**Version:** v2.2.1  
**Last Updated:** November 16, 2025  
**Audience:** Users & Administrators

---

## 🎯 Template System Overview

The On Tour App Template System allows users to create, save, and reuse **Show Templates** and **Tour Templates** to streamline event planning and reduce repetitive data entry. This system significantly speeds up booking workflow and ensures consistency across similar events.

### Key Benefits

- ✅ **Time Savings:** Reduce show creation time by 70%
- ✅ **Consistency:** Standardized data across similar venues/events
- ✅ **Collaboration:** Share templates across team members
- ✅ **Scalability:** Manage hundreds of shows with consistent data
- ✅ **Flexibility:** Customize templates for different venue types, tour legs
- ✅ **Version Control:** Track template changes and revert if needed

---

## 📋 Template Types

### Show Templates

**Purpose:** Standardize individual show details for specific venues or show types

**Included Data:**
- Venue information (name, address, capacity, contact details)
- Technical requirements (stage size, sound, lighting specs)
- Standard pricing (base fee, merchandise split, hospitality)
- Crew requirements (local crew, catering, security)
- Travel logistics (load-in/out times, parking, accommodations)
- Contract terms (payment schedule, cancellation policy)

**Use Cases:**
- Venue-specific templates (e.g., "Madison Square Garden Template")
- Show type templates (e.g., "Arena Show Template", "Theater Show Template")
- Market-specific templates (e.g., "European Festival Template")

### Tour Templates  

**Purpose:** Create complete tour structures with multiple shows and routing

**Included Data:**
- Tour routing and show sequence
- Standard show templates applied to venue types
- Travel patterns and logistics
- Crew and equipment manifests
- Budget templates and cost structures
- Marketing and promotion schedules

**Use Cases:**
- Tour type templates (e.g., "Arena Tour Template", "Festival Circuit Template")
- Regional tour templates (e.g., "US East Coast Tour", "European Summer Tour")
- Season-based templates (e.g., "Summer Festival Season", "Holiday Theater Tour")

---

## 🎨 Creating Templates

### Show Template Creation

#### From Existing Show (Recommended)

1. **Navigate to an existing show** with complete, accurate data
2. **Click the "Create Template" button** (⭐ icon) in the show details
3. **Choose template scope:**
   - **Venue Template:** Include venue-specific details (address, capacity, contacts)
   - **Show Type Template:** Include general show structure (pricing, tech specs)
   - **Complete Template:** Include all show data
4. **Name your template:** Use descriptive names like "Arena - 15K+ Capacity" or "Theater - Premium Markets"
5. **Add description and tags** for easy searching
6. **Set sharing permissions:**
   - **Private:** Only you can use
   - **Team:** Your organization can use
   - **Public:** Share with On Tour community (optional)

#### From Scratch

1. **Go to Shows → Templates → Create New**
2. **Select template type:** Venue, Show Type, or Custom
3. **Fill in template fields:**

```
Basic Information:
├── Template Name: "Premium Theater Template"
├── Description: "Mid-size theaters in major markets"
├── Tags: ["theater", "premium", "2000-5000"]
└── Category: "Venue Type"

Venue Details:
├── Capacity Range: 2000-5000
├── Stage Specs: Proscenium, 40' wide minimum
├── Technical: Full lighting rig, professional sound
└── Amenities: Dressing rooms, catering kitchen

Financial Structure:
├── Base Fee: $25,000 - $45,000 (capacity dependent)
├── Merchandise Split: 85% artist / 15% venue
├── Ticket Service Charges: Venue keeps 100%
└── Payment Terms: 50% deposit, 50% settlement

Production Requirements:
├── Load-in: 8 hours before show
├── Sound Check: 2 hours before doors
├── Local Crew: 8 stagehands, 4 security
└── Catering: 20 hot meals, vegetarian options
```

### Tour Template Creation

#### Multi-Show Template Builder

1. **Go to Tours → Templates → Create Tour Template**
2. **Define tour structure:**
   
```
Tour Framework:
├── Tour Type: "Theater Circuit"
├── Duration: 6-8 weeks
├── Show Count: 20-30 shows
├── Geographic Scope: North America
└── Season: Spring/Fall preferred

Routing Logic:
├── Max Travel Distance: 400 miles between shows
├── Rest Days: Every 7 shows minimum
├── Market Priority: Major cities first, secondary markets fill
└── Venue Types: Apply "Premium Theater Template"

Logistics Template:
├── Crew Size: 12 traveling, 8-12 local per show
├── Equipment: 2 trucks, 1 bus, local sound/lights
├── Accommodations: 3-star minimum, near venue preferred
└── Catering: Rider specifications attached

Financial Structure:
├── Show Fee Range: $25K - $60K (market dependent)
├── Travel Budget: $2,500 per show average
├── Crew Costs: $1,800 per show average
└── Accommodation Budget: $200 per person per night
```

---

## 🔄 Using Templates

### Applying Show Templates

#### Quick Application

1. **Create New Show:** Click "New Show" button
2. **Select "Use Template"** option
3. **Browse or search templates:**
   - Filter by category, tags, or creator
   - Preview template details before applying
4. **Choose template** and click "Apply"
5. **Customize specific details:**
   - Update venue name and address
   - Adjust dates and times
   - Modify pricing for specific market
6. **Save show** with template-derived data

#### Batch Application (Multiple Shows)

1. **Go to Shows → Bulk Operations → Apply Template**
2. **Select target shows:** Choose shows to update
3. **Choose template:** Pick appropriate template
4. **Select fields to update:**
   ```
   ☑ Technical Requirements
   ☑ Crew Requirements  
   ☐ Venue Information (keep existing)
   ☑ Contract Terms
   ☐ Pricing (keep custom pricing)
   ☑ Load-in/Load-out Times
   ```
5. **Preview changes** before applying
6. **Apply to selected shows**

### Tour Template Workflow

#### New Tour from Template

1. **Tours → Create New Tour → From Template**
2. **Select tour template** from library
3. **Configure tour parameters:**
   ```
   Tour Details:
   ├── Tour Name: "Spring Theater Tour 2026"
   ├── Start Date: March 15, 2026
   ├── End Date: May 10, 2026
   ├── Target Show Count: 25 shows
   └── Priority Markets: [List of preferred cities]
   
   Template Customization:
   ├── Venue Template: "Premium Theater Template" 
   ├── Pricing Adjustments: +15% for major markets
   ├── Routing Preferences: West to East progression
   └── Special Requirements: Festival slots excluded
   ```
4. **Generate initial tour structure**
5. **Review and adjust** generated shows
6. **Begin venue outreach** with standardized offers

---

## 🎯 Advanced Template Features

### Template Variables

**Dynamic Fields:** Templates can include variables that are filled when applied

```typescript
// Template variable examples
interface TemplateVariables {
  venue: {
    name: "{{venue_name}}",
    capacity: "{{venue_capacity}}",
    address: "{{venue_address}}"
  },
  
  pricing: {
    baseFee: "{{base_fee}}",
    merchandiseSplit: "{{merch_split}}",
    ticketPrice: "{{ticket_price_range}}"
  },
  
  logistics: {
    loadInTime: "{{load_in_hours}} hours before show",
    localCrew: "{{crew_count}} stagehands",
    catering: "{{meal_count}} meals, {{dietary_restrictions}}"
  }
}

// When applying template, user fills in variables:
// venue_name: "Chicago Theatre" 
// venue_capacity: "3600"
// base_fee: "$35,000"
```

### Conditional Logic

**Smart Templates:** Logic-based field population

```yaml
# Example: Venue capacity-based pricing
pricing_logic:
  - if: "capacity < 2000"
    then: "base_fee = $15,000 - $25,000"
  - if: "capacity 2000-5000" 
    then: "base_fee = $25,000 - $45,000"
  - if: "capacity > 5000"
    then: "base_fee = $45,000+"

# Market-based adjustments  
market_multipliers:
  tier_1_markets: 1.4  # NYC, LA, Chicago
  tier_2_markets: 1.2  # Boston, SF, DC
  tier_3_markets: 1.0  # Secondary markets
```

### Template Inheritance

**Hierarchical Templates:** Build complex templates from simpler ones

```
Base Template: "Concert Venue"
├── Venue Template: "Theater Venue" (inherits from Concert)
│   ├── Regional Template: "US Theater" (inherits from Theater)
│   │   └── Specific Template: "Broadway Theater" (inherits from US Theater)
│   └── International Template: "EU Theater" (inherits from Theater)
└── Festival Template: "Festival Stage" (inherits from Concert)
```

---

## 👥 Collaboration & Sharing

### Team Template Library

**Organization Templates:** Shared across all team members

#### Template Permissions

| Role | Create | Edit | Delete | Share External |
|------|--------|------|--------|---------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | Own Only | Own Only | With Approval |
| **Viewer** | ❌ | ❌ | ❌ | ❌ |

#### Template Categories

```
Organization Template Library:
├── Official Templates (Admin-approved)
│   ├── Venue Type Templates
│   ├── Tour Circuit Templates  
│   └── Contract Templates
├── Team Templates (Member-created)
│   ├── Personal Templates
│   ├── Shared Drafts
│   └── Experimental Templates
└── Community Templates (External)
    ├── Industry Standards
    ├── Venue-Provided Templates
    └── Community Contributions
```

### Template Versioning

**Change Management:** Track template evolution

```typescript
interface TemplateVersion {
  version: "1.4.2",
  createdDate: "2025-11-16T14:30:00Z",
  createdBy: "sarah@example.com",
  changes: [
    "Updated load-in time from 6 to 8 hours",
    "Increased local crew requirement from 6 to 8",
    "Added vegetarian catering requirement"
  ],
  appliedToShows: ["show_123", "show_456"], // Shows using this version
  supersedes: "1.4.1"
}
```

**Version Management:**
- **Auto-versioning:** Templates automatically versioned on changes
- **Change tracking:** See what changed between versions
- **Rollback capability:** Revert to previous template versions
- **Impact analysis:** See which shows use each template version
- **Gradual migration:** Update shows to new template versions gradually

---

## 📊 Template Analytics

### Usage Metrics

**Template Performance Dashboard:** Organization Settings → Templates → Analytics

| Metric | Description | Business Value |
|--------|-------------|----------------|
| **Most Used Templates** | Templates applied to most shows | Identifies successful standards |
| **Time Savings** | Hours saved vs manual show creation | ROI measurement |
| **Consistency Score** | How similar template-derived shows are | Quality measurement |
| **Template Adoption** | % of shows using templates | Process adoption tracking |
| **User Template Activity** | Who creates/uses templates most | Training needs identification |

### Success Tracking

```typescript
interface TemplateAnalytics {
  usage: {
    totalApplications: 1247,
    uniqueShows: 892,
    timeSaved: "347 hours",
    averageTimePerShow: "23 minutes saved"
  },
  
  quality: {
    consistencyScore: 0.94,      // How similar template shows are
    errorReduction: "67%",       // Fewer data entry errors
    completenessScore: 0.89      // Fields filled vs empty
  },
  
  adoption: {
    teamAdoptionRate: "78%",     // Team members using templates
    templateCoverage: "65%",     // Shows created from templates
    topCategories: ["theater", "festival", "arena"]
  }
}
```

---

## 🔧 Technical Implementation

### Template Data Structure

```typescript
interface ShowTemplate {
  // Meta Information
  id: string;
  name: string;
  description: string;
  tags: string[];
  category: 'venue' | 'show_type' | 'tour' | 'contract';
  version: string;
  createdBy: string;
  createdDate: Date;
  lastModified: Date;
  
  // Sharing & Permissions
  visibility: 'private' | 'team' | 'public';
  permissions: TemplatePermissions;
  
  // Template Data
  templateData: {
    venue?: VenueTemplate;
    financial?: FinancialTemplate;
    technical?: TechnicalTemplate;
    logistics?: LogisticsTemplate;
    contract?: ContractTemplate;
  };
  
  // Dynamic Fields
  variables: TemplateVariable[];
  conditionalLogic: ConditionalRule[];
  
  // Usage Tracking
  usage: {
    applicationCount: number;
    lastUsed: Date;
    averageRating: number;
    feedback: TemplateFeedback[];
  };
}
```

### Template Engine

```typescript
class TemplateEngine {
  // Apply template to new show
  async applyTemplate(
    templateId: string, 
    targetShow: Partial<Show>,
    variables: Record<string, any>
  ): Promise<Show> {
    
    const template = await this.loadTemplate(templateId);
    const processedData = await this.processVariables(template, variables);
    const conditionalData = await this.applyConditionalLogic(processedData, targetShow);
    
    return {
      ...targetShow,
      ...conditionalData,
      metadata: {
        ...targetShow.metadata,
        templateId: templateId,
        templateVersion: template.version,
        appliedDate: new Date()
      }
    };
  }
  
  // Process template variables
  private async processVariables(
    template: ShowTemplate,
    variables: Record<string, any>
  ): Promise<any> {
    
    let processedData = JSON.stringify(template.templateData);
    
    // Replace variable placeholders
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processedData = processedData.replace(placeholder, String(value));
    }
    
    return JSON.parse(processedData);
  }
}
```

---

## 🚀 Best Practices

### Template Design Guidelines

#### Naming Conventions

```
Good Template Names:
✅ "Arena - 15K+ Capacity - Premium Markets"
✅ "Theater - 2K-5K - Standard Touring" 
✅ "Festival - Outdoor - Summer Circuit"
✅ "Amphitheater - Shed Tour - Regional"

Poor Template Names:
❌ "Template 1"
❌ "John's Template"
❌ "Venue Template"
❌ "Good Venues"
```

#### Optimal Template Scope

**Too Narrow:** 
- ❌ "Madison Square Garden Only" (venue-specific)
- ❌ "Tuesday Shows Only" (day-specific)

**Too Broad:**
- ❌ "All Venues Template" (no specificity)
- ❌ "Any Show Template" (not useful)

**Just Right:**
- ✅ "Arena Venues - 10K-20K Capacity"
- ✅ "Theater Circuit - Premium Markets"
- ✅ "Festival Stage - Summer Circuit"

#### Template Maintenance

```
Monthly Template Review Checklist:
□ Update pricing based on current market rates
□ Review and update technical requirements
□ Check contract terms for legal compliance
□ Update crew requirements based on experience
□ Review template usage analytics
□ Archive unused templates
□ Version control for major changes
□ Team feedback incorporation
```

### Workflow Optimization

#### Progressive Template Building

1. **Start Simple:** Basic venue/pricing template
2. **Add Experience:** Incorporate lessons learned from actual shows
3. **Refine Details:** Add technical and logistical specifics
4. **Version Control:** Create new versions as standards evolve
5. **Team Input:** Collect feedback from tour managers and production

#### Template Hierarchy Strategy

```
Organization Template Strategy:
├── Master Templates (1-3 per venue type)
│   └── Detailed, comprehensive, admin-maintained
├── Regional Variants (2-5 per master)
│   └── Local market adjustments, language/currency
├── Seasonal Adjustments (as needed)
│   └── Summer festivals, holiday shows, etc.
└── Special Circumstances (as needed)
    └── COVID protocols, special events, etc.
```

---

## 📞 Support & Troubleshooting

### Common Issues

#### Template Application Failures

**Problem:** Template doesn't apply correctly to show
**Solutions:**
1. Check if template is compatible with target show type
2. Ensure all required variables are provided
3. Verify user has permission to use template
4. Check for conflicting existing show data

**Problem:** Variables not substituting correctly
**Solutions:**
1. Ensure variable names match exactly (case-sensitive)
2. Check for special characters in variable values
3. Verify conditional logic isn't overriding variables

#### Template Sharing Issues

**Problem:** Team can't see my templates
**Solutions:**
1. Check template visibility settings (Private vs Team vs Public)
2. Verify team members have appropriate permissions
3. Ensure template is saved (not still in draft mode)

### Getting Help

- **Template Creation:** Use in-app tutorial (Help → Template Guide)
- **Advanced Features:** Contact support@ontour.app
- **Training:** Schedule team training session
- **Custom Templates:** Premium support for complex template needs

---

## 🎯 Future Enhancements

### Roadmap v2.3.0 (Q2 2026)

- [ ] **AI-Powered Template Suggestions:** Recommend templates based on show characteristics
- [ ] **Template Marketplace:** Community sharing of successful templates
- [ ] **Advanced Conditional Logic:** More complex if/then rules
- [ ] **Template A/B Testing:** Compare template effectiveness
- [ ] **Integration Templates:** Pre-built integrations with major venues/promoters
- [ ] **Mobile Template Editor:** Create and edit templates on mobile devices

### Industry Integration

- [ ] **Venue-Provided Templates:** Direct integration with venue booking systems
- [ ] **Promoter Templates:** Standard templates from major promotion companies
- [ ] **Union Requirements:** Built-in templates for union contract compliance
- [ ] **Tax Jurisdiction Templates:** Automatic tax calculation integration

---

**Last Updated:** November 16, 2025  
**Document Version:** v2.2.1  
**Next Review:** February 2026