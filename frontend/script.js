// Integration-ready constants
const API_BASE_URL = "http://localhost:3000"; // Adjust when backend is ready

// In-memory fallback data for demo before backend is connected
let items = [
  {
    id: "1",
    title: "Black Wallet",
    description: "Leather wallet with a blue sticker inside. Lost near library.",
    contact: "jane@example.com",
    imageUrl: "https://images.unsplash.com/photo-1518445699137-7b95c4b9f53b?w=800&q=80&auto=format&fit=crop",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: "2",
    title: "Keys with Red Keychain",
    description: "Set of car and house keys on a red keychain.",
    contact: "+1 (555) 123-4567",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&auto=format&fit=crop",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

// Elements
const itemsListEl = document.getElementById("items-list");
const searchInputEl = document.getElementById("search");
const formEl = document.getElementById("upload-form");
const formMessageEl = document.getElementById("form-message");
const submitBtnEl = document.getElementById("submit-btn");
const resultsCountEl = document.getElementById("results-count");
const imageInputEl = document.getElementById("image");

document.addEventListener("DOMContentLoaded", () => {
  loadItems();
});

// Fetch helpers (integration-ready)
async function fetchItemsFromBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    // Fall back to local demo data
    console.warn("Using demo items due to error fetching backend:", err.message);
    return items;
  }
}

async function postItemToBackend(formData) {
  // If your backend expects JSON instead of multipart:
  // const payload = Object.fromEntries(formData.entries());
  // return fetch(`${API_BASE_URL}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: "POST",
      body: formData
    });
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    // Simulate success by writing to in-memory list for demo
    const now = new Date().toISOString();
    const newItem = {
      id: String(Date.now()),
      title: formData.get("title"),
      description: formData.get("description"),
      contact: formData.get("contact"),
      imageUrl: await readImageAsDataUrl(formData.get("image")),
      createdAt: now
    };
    items.unshift(newItem);
    return newItem;
  }
}

// Utilities
function formatRelativeDate(iso) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function createItemCard(item) {
  const div = document.createElement("div");
  div.className = "col-md-6 col-lg-4";
  const imageSrc = item.imageUrl || "";
  div.innerHTML = `
    <div class="card item-card h-100">
      <img src="${imageSrc}" class="card-img-top" alt="${escapeHtml(item.title)}" onerror="this.style.display='none'" />
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${escapeHtml(item.title)}</h5>
        <p class="card-text">${escapeHtml(item.description)}</p>
        <div class="mt-auto">
          <a class="contact-btn" href="${escapeHtml(getContactHref(item.contact))}">Contact</a>
        </div>
        <small class="text-muted mt-2">Posted ${formatRelativeDate(item.createdAt)}</small>
      </div>
    </div>
  `;
  return div;
}

function renderItems(list) {
  itemsListEl.innerHTML = "";
  if (!list || list.length === 0) {
    itemsListEl.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="text-muted">
          <i class="bi bi-search" style="font-size: 3rem; opacity: 0.3;"></i>
          <p class="mt-3">No items to display.</p>
        </div>
      </div>
    `;
    updateResultsCount(0);
    return;
  }
  const fragment = document.createDocumentFragment();
  list.forEach((item) => fragment.appendChild(createItemCard(item)));
  itemsListEl.appendChild(fragment);
  updateResultsCount(list.length);
}

async function loadItems() {
  const data = await fetchItemsFromBackend();
  // Normalize expected fields
  const normalized = (data || []).map((x) => ({
    id: x.id || String(Math.random()),
    title: x.title || "Untitled",
    description: x.description || "",
    contact: x.contact || "",
    imageUrl: x.imageUrl || x.image || "",
    createdAt: x.createdAt || x.date || new Date().toISOString()
  }));
  items = normalized;
  renderItems(items);
}

// Form handling
formEl?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();
  const formData = new FormData(formEl);

  // Basic validation
  const title = formData.get("title");
  const description = formData.get("description");
  const contact = formData.get("contact");
  if (!title || !description || !contact) {
    showMessage("Please fill in Title, Description, and Contact.", "error");
    return;
  }

  setSubmitting(true);
  try {
    const created = await postItemToBackend(formData);
    showMessage("Item submitted successfully!", "success");
    // Reset form
    formEl.reset();
    // Re-render list (already updated in demo mode)
    renderItems(items);
  } catch (err) {
    showMessage("Failed to submit item.", "error");
  } finally {
    setSubmitting(false);
  }
});

function setSubmitting(isSubmitting) {
  submitBtnEl.disabled = isSubmitting;
  submitBtnEl.textContent = isSubmitting ? "Submitting..." : "Submit Report";
  if (isSubmitting) {
    submitBtnEl.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...';
  } else {
    submitBtnEl.innerHTML = 'Submit Report';
  }
}

function showMessage(text, type) {
  formMessageEl.textContent = text;
  formMessageEl.className = type ? `alert alert-${type === 'success' ? 'success' : 'danger'}` : "";
  formMessageEl.id = "form-message"; // keep id set
}

function clearMessage() {
  showMessage("", "");
}

// Search filter
const debouncedFilter = debounce((q) => {
  if (!q) return renderItems(items);
  const filtered = items.filter((it) => (it.title || "").toLowerCase().includes(q));
  renderItems(filtered);
}, 150);

searchInputEl?.addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  debouncedFilter(q);
});

// Helpers
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readImageAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function getContactHref(contact = ""){
  const c = String(contact).trim();
  if(!c) return "#";
  if(c.includes("@")) return `mailto:${c}`;
  const digits = c.replace(/[^0-9+]/g, "");
  if(digits) return `tel:${digits}`;
  return "#";
}

function updateResultsCount(n){
  if(!resultsCountEl) return;
  resultsCountEl.textContent = n ? `${n}` : "";
}


function debounce(fn, wait){
  let t; return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), wait); };
}


