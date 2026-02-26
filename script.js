// SGRC Core Script - Premium v2.0
document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
    initComplaints();
});

// Load shared components (Navbar, Sidebar)
async function loadComponents() {
    const navbarCont = document.getElementById('navbar-container');
    const sidebarCont = document.getElementById('sidebar-container');

    if (navbarCont) {
        try {
            const resp = await fetch('navbar.html');
            navbarCont.innerHTML = await resp.text();
            highlightActiveLink();

            if (sidebarCont) {
                initSidebarToggle();
            } else {
                const toggle = document.getElementById('sidebarToggle');
                if (toggle) toggle.classList.add('d-none');
            }
        } catch (err) { console.error('Navbar load failed:', err); }
    }

    if (sidebarCont) {
        try {
            const resp = await fetch('sidebar.html');
            sidebarCont.innerHTML = await resp.text();

            // Re-render specific admin views after sidebar loads
            const path = window.location.pathname;
            if (path.includes('dashboard')) updateDashboard();
            if (path.includes('gestion-reclamations')) renderManagementList();
            if (path.includes('statistiques')) renderStats();
        } catch (err) { console.error('Sidebar load failed:', err); }
    }
}

function initSidebarToggle() {
    setTimeout(() => {
        const toggleBtn = document.getElementById('sidebarToggle');
        const overlay = document.getElementById('sidebarOverlay');
        const sidebar = document.querySelector('.sidebar');

        const toggleFunc = () => {
            sidebar.classList.toggle('show');
            if (overlay) overlay.classList.toggle('show');
        };

        if (toggleBtn && sidebar) toggleBtn.addEventListener('click', toggleFunc);
        if (overlay) overlay.addEventListener('click', toggleFunc);
    }, 100);
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) link.classList.add('active');
    });
}

// Design Utilities
function getStatusBadgeSoft(s) {
    if (s === 'En attente') return 'bg-warning-soft';
    if (s === 'En cours') return 'bg-primary-soft-badge';
    if (s === 'Résolu') return 'bg-success-soft';
    return 'bg-danger-soft';
}

function getPriorityClass(p) {
    if (p === 'Haute') return 'bg-danger-soft text-danger';
    if (p === 'Moyenne') return 'bg-warning-soft text-warning';
    return 'bg-success-soft text-success';
}

// Data Management
function initComplaints() {
    if (!localStorage.getItem('complaints')) {
        const dummyData = [
            { id: 'REC-2401', client: 'Alice Vanda', email: 'alice@example.com', subject: 'Erreur Facturation Janvier', category: 'Facturation', description: 'Double prélèvement sur mon compte.', priority: 'Haute', date: '21/02/2026', status: 'En attente' },
            { id: 'REC-2402', client: 'Marc Lefebvre', email: 'marc@example.com', subject: 'Accès API bloqué', category: 'Technique', description: 'La clé API ne répond plus.', priority: 'Moyenne', date: '23/02/2026', status: 'En cours' },
            { id: 'REC-2403', client: 'Sophie Martin', email: 'sophie@example.com', subject: 'Question sur produit X', category: 'Produit', description: 'Comment utiliser la fonction Z ?', priority: 'Basse', date: '25/02/2026', status: 'Résolu' }
        ];
        localStorage.setItem('complaints', JSON.stringify(dummyData));
    }
}

function getComplaints() { return JSON.parse(localStorage.getItem('complaints') || '[]'); }
function saveComplaints(complaints) { localStorage.setItem('complaints', JSON.stringify(complaints)); }

function addComplaint(complaint) {
    const complaints = getComplaints();
    complaint.id = 'REC-' + Math.floor(1000 + Math.random() * 9000);
    complaint.date = new Date().toLocaleDateString();
    complaint.status = 'En attente';
    complaints.push(complaint);
    saveComplaints(complaints);
}

// Rendering Logic
function renderMyComplaints() {
    const myList = document.getElementById('my-list');
    if (!myList) return;
    const complaints = getComplaints();
    if (complaints.length === 0) {
        myList.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted small fw-600">Aucune réclamation trouvée.</td></tr>';
        return;
    }
    myList.innerHTML = complaints.map(c => `
        <tr>
            <td class="ps-0">
                <div class="fw-700 text-dark mb-1" style="font-size: 0.95rem;">${c.subject}</div>
                <span class="badge-premium bg-primary-soft-badge" style="font-size: 0.6rem; letter-spacing: 0.5px;">${c.category}</span>
            </td>
            <td><span class="badge-premium ${getPriorityClass(c.priority)}">${c.priority}</span></td>
            <td class="text-muted small fw-500">${c.date}</td>
            <td class="text-end pe-0">
                <span class="badge-premium ${getStatusBadgeSoft(c.status)}">${c.status}</span>
            </td>
        </tr>
    `).join('');
}

function renderManagementList() {
    const list = document.getElementById('complaints-list');
    if (!list) return;
    const complaints = getComplaints();
    if (complaints.length === 0) {
        list.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted small fw-600">Aucun ticket à gérer.</td></tr>';
        return;
    }
    list.innerHTML = complaints.map(c => `
        <tr>
            <td class="ps-4">
                <div class="fw-700 text-dark" style="font-size: 0.95rem;">${c.client}</div>
                <small class="text-muted fw-500" style="font-size: 0.75rem;">${c.email}</small>
            </td>
            <td class="fw-600 text-dark" style="font-size: 0.9rem;">${c.subject}</td>
            <td><span class="badge-premium ${getPriorityClass(c.priority)}">${c.priority}</span></td>
            <td class="text-muted small fw-500">${c.date}</td>
            <td class="text-end pe-4">
                <div class="dropdown d-inline-block">
                    <button class="btn btn-sm btn-light border-0 px-3 py-2 fw-700 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        ${c.status}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2">
                        <li><button class="dropdown-item rounded-3 fw-600 mb-1" onclick="updateStatus('${c.id}','En attente')">En attente</button></li>
                        <li><button class="dropdown-item rounded-3 fw-600 mb-1" onclick="updateStatus('${c.id}','En cours')">En cours</button></li>
                        <li><button class="dropdown-item rounded-3 fw-600 mb-1" onclick="updateStatus('${c.id}','Résolu')">Résolu</button></li>
                        <li><hr class="dropdown-divider mx-2"></li>
                        <li><button class="dropdown-item rounded-3 fw-600 text-danger" onclick="deleteComplaint('${c.id}')">Supprimer</button></li>
                    </ul>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateStatus(id, stat) {
    const data = getComplaints();
    const idx = data.findIndex(c => c.id === id);
    if (idx !== -1) { data[idx].status = stat; saveComplaints(data); renderManagementList(); }
}

function deleteComplaint(id) {
    if (confirm('Souhaitez-vous vraiment supprimer ce ticket ?')) {
        saveComplaints(getComplaints().filter(c => c.id !== id));
        renderManagementList();
    }
}

function updateDashboard() {
    const data = getComplaints();
    const el = (id) => document.getElementById(id);
    if (el('total-count')) el('total-count').textContent = data.length;
    if (el('pending-count')) el('pending-count').textContent = data.filter(c => c.status === 'En attente').length;
    if (el('resolved-count')) el('resolved-count').textContent = data.filter(c => c.status === 'Résolu').length;

    const recent = el('recent-list');
    if (recent) {
        if (data.length === 0) {
            recent.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted small fw-600">Aucune activité récente.</td></tr>';
            return;
        }
        recent.innerHTML = data.slice(-5).reverse().map(c => `
            <tr>
                <td class="ps-4">
                    <div class="fw-700 text-dark">${c.client}</div>
                    <small class="text-muted" style="font-size: 0.75rem;">${c.email}</small>
                </td>
                <td class="fw-600 text-dark" style="font-size: 0.9rem;">${c.subject}</td>
                <td><span class="badge-premium ${getPriorityClass(c.priority)}">${c.priority}</span></td>
                <td class="text-muted small">${c.date}</td>
                <td class="text-end pe-4"><span class="badge-premium ${getStatusBadgeSoft(c.status)}">${c.status}</span></td>
            </tr>
        `).join('');
    }
}

function renderStats() {
    const data = getComplaints();
    const cont = document.getElementById('priority-stats');
    if (!cont) return;
    const items = ['Haute', 'Moyenne', 'Basse'];
    const total = data.length || 1;
    cont.innerHTML = items.map(p => {
        const count = data.filter(c => c.priority === p).length;
        const color = p === 'Haute' ? 'hsl(0, 84%, 60%)' : p === 'Moyenne' ? 'hsl(38, 92%, 50%)' : 'hsl(142, 71%, 45%)';
        return `
            <div class="mb-4">
                <div class="d-flex justify-content-between mb-2">
                    <span class="fw-800 text-uppercase small text-muted">${p}</span>
                    <span class="fw-800 text-primary">${Math.round((count / total) * 100)}%</span>
                </div>
                <div class="progress rounded-pill" style="height: 12px; background: rgba(0,0,0,0.03);">
                    <div class="progress-bar rounded-pill" style="width: ${(count / total) * 100}%; background: ${color}; transition: width 1s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
    if (typeof initCharts === 'function') initCharts(data);
}

function initCharts(data) {
    const el = (id) => document.getElementById(id);
    if (el('categoryChart') && typeof Chart !== 'undefined') {
        const cats = [...new Set(data.map(c => c.category))];
        const counts = cats.map(cat => data.filter(c => c.category === cat).length);
        new Chart(el('categoryChart'), {
            type: 'doughnut',
            data: { labels: cats, datasets: [{ data: counts, backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], borderWidth: 0 }] },
            options: { cutout: '80%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: '600' } } } } }
        });
    }
    if (el('evolutionChart') && typeof Chart !== 'undefined') {
        new Chart(el('evolutionChart'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{ data: [12, 19, 15, 25, 22, 10, 8], borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.05)' }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
        });
    }
}

// Initial Handlers
window.addEventListener('load', () => {
    const path = window.location.pathname;
    if (path.includes('mes-reclamations')) renderMyComplaints();
});

document.addEventListener('submit', (e) => {
    if (e.target.id === 'complaint-form') {
        e.preventDefault();
        addComplaint({
            client: document.getElementById('client').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            category: document.getElementById('category').value,
            priority: document.getElementById('priority').value,
            description: document.getElementById('description').value
        });
        alert('Votre ticket a été soumis avec succès !');
        window.location.href = 'mes-reclamations.html';
    }
});
