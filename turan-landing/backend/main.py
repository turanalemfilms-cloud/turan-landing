from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional

from database import engine, get_db, Base
from models import Lead
from schemas import LeadCreate, LeadResponse, LeadList

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Turan Landing API", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Turan Landing API", "version": "2.0.0"}

@app.post("/api/leads", response_model=LeadResponse)
async def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    db_lead = Lead(
        name=lead.name,
        business_name=lead.businessName,
        business_type=lead.businessType,
        business_description=lead.businessDescription,
        target_audience=lead.targetAudience,
        email=lead.email,
        phone=lead.phone,
        selected_theme=lead.selectedTheme,
        preferred_colors=lead.preferredColors,
        website_goal=lead.websiteGoal,
        features_needed=lead.featuresNeeded,
        has_logo=lead.hasLogo,
        has_content=lead.hasContent,
        has_photos=lead.hasPhotos,
        competitors=lead.competitors,
        additional_notes=lead.additionalNotes,
        budget_range=lead.budgetRange,
        deadline=lead.deadline,
        agreed_to_terms=lead.agreedToTerms,
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@app.get("/api/leads", response_model=LeadList)
async def get_leads(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    leads = db.query(Lead).order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(Lead).count()
    return LeadList(leads=leads, total=total)

@app.get("/api/leads/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@app.delete("/api/leads/{lead_id}")
async def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"message": "Lead deleted successfully"}

# Admin dashboard HTML
ADMIN_HTML = '''
<!DOCTYPE html>
<html lang="kk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Turan Admin - Complete Briefs</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        turan: {
                            gold: '#D4AF37',
                            bronze: '#CD7F32',
                            dark: '#1A1A2E',
                            navy: '#16213E',
                            accent: '#0F3460',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
        }
        .modal {
            display: none;
        }
        .modal.active {
            display: flex;
        }
    </style>
</head>
<body class="min-h-screen text-white">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-turan-gold to-turan-bronze bg-clip-text text-transparent">
                Turan Admin
            </h1>
            <p class="text-white/60 mt-2">Complete Brief Management Dashboard</p>
        </header>

        <div class="mb-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <span class="text-white/60">Total briefs:</span>
                <span id="totalCount" class="text-2xl font-bold text-turan-gold">0</span>
            </div>
            <button onclick="loadLeads()" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                Refresh
            </button>
        </div>

        <div class="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-white/10">
                            <th class="px-4 py-4 text-left text-sm font-semibold text-white/80">ID</th>
                            <th class="px-4 py-4 text-left text-sm font-semibold text-white/80">Name</th>
                            <th class="px-4 py-4 text-left text-sm font-semibold text-white/80">Business</th>
                            <th class="px-4 py-4 text-left text-sm font-semibold text-white/80">Contact</th>
                            <th class="px-4 py-4 text-left text-sm font-semibold text-white/80">Theme</th>
                            <th class="px-4 py-4 text-left text-sm font-semibold text-white/80">Budget</th>
                            <th class="px-4 py-4 text-left text-sm font-semibold text-white/80">Date</th>
                            <th class="px-4 py-4 text-left text-sm font-semibold text-white/80">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="leadsTable">
                        <tr>
                            <td colspan="8" class="px-4 py-8 text-center text-white/40">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Detail Modal -->
    <div id="detailModal" class="modal fixed inset-0 bg-black/80 backdrop-blur-sm z-50 items-center justify-center p-4">
        <div class="bg-turan-navy rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-turan-navy z-10">
                <h2 class="text-2xl font-bold text-turan-gold">Brief Details</h2>
                <button onclick="closeModal()" class="text-white/60 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <div id="modalContent" class="p-6 space-y-6">
                <!-- Content will be injected here -->
            </div>
        </div>
    </div>

    <script>
        let allLeads = [];

        async function loadLeads() {
            try {
                const response = await fetch('/api/leads');
                const data = await response.json();
                allLeads = data.leads;

                document.getElementById('totalCount').textContent = data.total;

                const tbody = document.getElementById('leadsTable');

                if (data.leads.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" class="px-4 py-8 text-center text-white/40">
                                No briefs yet. Share your landing page to start collecting leads!
                            </td>
                        </tr>
                    `;
                    return;
                }

                tbody.innerHTML = data.leads.map(lead => `
                    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="px-4 py-4 text-white/60">#${lead.id}</td>
                        <td class="px-4 py-4 font-medium">${lead.name}</td>
                        <td class="px-4 py-4 text-white/80">
                            <div class="font-medium">${lead.business_name || '-'}</div>
                            <div class="text-xs text-white/50">${lead.business_type || ''}</div>
                        </td>
                        <td class="px-4 py-4">
                            <a href="mailto:${lead.email}" class="text-turan-gold hover:underline block text-sm">${lead.email}</a>
                            <a href="tel:${lead.phone}" class="text-white/60 hover:text-white text-sm">${lead.phone}</a>
                        </td>
                        <td class="px-4 py-4">
                            <span class="px-2 py-1 rounded-full text-xs bg-white/10 capitalize">${lead.selected_theme}</span>
                        </td>
                        <td class="px-4 py-4 text-white/80 text-sm">${lead.budget_range || '-'}</td>
                        <td class="px-4 py-4 text-white/60 text-sm">
                            ${new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td class="px-4 py-4 flex gap-2">
                            <button
                                onclick="viewDetails(${lead.id})"
                                class="text-turan-gold hover:text-turan-bronze text-sm flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                View
                            </button>
                            <button
                                onclick="deleteLead(${lead.id})"
                                class="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                Delete
                            </button>
                        </td>
                    </tr>
                `).join('');
            } catch (error) {
                console.error('Error loading leads:', error);
                document.getElementById('leadsTable').innerHTML = `
                    <tr>
                        <td colspan="8" class="px-4 py-8 text-center text-red-400">
                            Error loading leads. Please try again.
                        </td>
                    </tr>
                `;
            }
        }

        function viewDetails(id) {
            const lead = allLeads.find(l => l.id === id);
            if (!lead) return;

            const features = lead.features_needed ? JSON.parse(lead.features_needed) : [];

            const content = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Contact Info -->
                    <div class="bg-white/5 rounded-xl p-4">
                        <h3 class="text-turan-gold font-semibold mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Contact Information
                        </h3>
                        <div class="space-y-2 text-sm">
                            <p><span class="text-white/50">Name:</span> <span class="text-white">${lead.name}</span></p>
                            <p><span class="text-white/50">Email:</span> <a href="mailto:${lead.email}" class="text-turan-gold hover:underline">${lead.email}</a></p>
                            <p><span class="text-white/50">Phone:</span> <a href="tel:${lead.phone}" class="text-white hover:text-turan-gold">${lead.phone}</a></p>
                        </div>
                    </div>

                    <!-- Business Info -->
                    <div class="bg-white/5 rounded-xl p-4">
                        <h3 class="text-turan-gold font-semibold mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            Business Details
                        </h3>
                        <div class="space-y-2 text-sm">
                            <p><span class="text-white/50">Business Name:</span> <span class="text-white">${lead.business_name || '-'}</span></p>
                            <p><span class="text-white/50">Type:</span> <span class="text-white">${lead.business_type || '-'}</span></p>
                            <p><span class="text-white/50">Target Audience:</span> <span class="text-white">${lead.target_audience || '-'}</span></p>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="bg-white/5 rounded-xl p-4 md:col-span-2">
                        <h3 class="text-turan-gold font-semibold mb-3">Business Description</h3>
                        <p class="text-white/80 text-sm">${lead.business_description || 'No description provided'}</p>
                    </div>

                    <!-- Site Preferences -->
                    <div class="bg-white/5 rounded-xl p-4">
                        <h3 class="text-turan-gold font-semibold mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                            Site Preferences
                        </h3>
                        <div class="space-y-2 text-sm">
                            <p><span class="text-white/50">Theme:</span> <span class="px-2 py-0.5 rounded bg-white/10 capitalize">${lead.selected_theme}</span></p>
                            <p><span class="text-white/50">Colors:</span> <span class="text-white">${lead.preferred_colors || '-'}</span></p>
                            <p><span class="text-white/50">Goal:</span> <span class="text-white capitalize">${lead.website_goal || '-'}</span></p>
                        </div>
                    </div>

                    <!-- Resources -->
                    <div class="bg-white/5 rounded-xl p-4">
                        <h3 class="text-turan-gold font-semibold mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                            Available Resources
                        </h3>
                        <div class="space-y-2 text-sm">
                            <p class="flex items-center gap-2">
                                ${lead.has_logo ? '<span class="text-green-400">✓</span>' : '<span class="text-white/30">✗</span>'}
                                <span class="${lead.has_logo ? 'text-white' : 'text-white/50'}">Logo</span>
                            </p>
                            <p class="flex items-center gap-2">
                                ${lead.has_content ? '<span class="text-green-400">✓</span>' : '<span class="text-white/30">✗</span>'}
                                <span class="${lead.has_content ? 'text-white' : 'text-white/50'}">Content/Text</span>
                            </p>
                            <p class="flex items-center gap-2">
                                ${lead.has_photos ? '<span class="text-green-400">✓</span>' : '<span class="text-white/30">✗</span>'}
                                <span class="${lead.has_photos ? 'text-white' : 'text-white/50'}">Photos</span>
                            </p>
                        </div>
                    </div>

                    <!-- Features -->
                    ${features.length > 0 ? `
                    <div class="bg-white/5 rounded-xl p-4 md:col-span-2">
                        <h3 class="text-turan-gold font-semibold mb-3">Requested Features</h3>
                        <div class="flex flex-wrap gap-2">
                            ${features.map(f => `<span class="px-3 py-1 rounded-full bg-turan-gold/20 text-turan-gold text-sm">${f}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Budget & Timeline -->
                    <div class="bg-white/5 rounded-xl p-4">
                        <h3 class="text-turan-gold font-semibold mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Budget & Timeline
                        </h3>
                        <div class="space-y-2 text-sm">
                            <p><span class="text-white/50">Budget:</span> <span class="text-white">${lead.budget_range || '-'}</span></p>
                            <p><span class="text-white/50">Deadline:</span> <span class="text-white">${lead.deadline || '-'}</span></p>
                        </div>
                    </div>

                    <!-- Competitors -->
                    <div class="bg-white/5 rounded-xl p-4">
                        <h3 class="text-turan-gold font-semibold mb-3">Competitors / References</h3>
                        <p class="text-white/80 text-sm">${lead.competitors || 'None specified'}</p>
                    </div>

                    <!-- Notes -->
                    ${lead.additional_notes ? `
                    <div class="bg-white/5 rounded-xl p-4 md:col-span-2">
                        <h3 class="text-turan-gold font-semibold mb-3">Additional Notes</h3>
                        <p class="text-white/80 text-sm whitespace-pre-wrap">${lead.additional_notes}</p>
                    </div>
                    ` : ''}
                </div>

                <div class="pt-4 border-t border-white/10 text-sm text-white/50">
                    Submitted: ${new Date(lead.created_at).toLocaleString()}
                </div>
            `;

            document.getElementById('modalContent').innerHTML = content;
            document.getElementById('detailModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('detailModal').classList.remove('active');
        }

        async function deleteLead(id) {
            if (!confirm('Are you sure you want to delete this brief?')) return;

            try {
                await fetch(`/api/leads/${id}`, { method: 'DELETE' });
                loadLeads();
            } catch (error) {
                console.error('Error deleting lead:', error);
                alert('Error deleting brief');
            }
        }

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // Close modal on backdrop click
        document.getElementById('detailModal').addEventListener('click', (e) => {
            if (e.target.id === 'detailModal') closeModal();
        });

        // Load leads on page load
        loadLeads();
    </script>
</body>
</html>
'''

@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard():
    return ADMIN_HTML

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
