const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");
const message = document.getElementById("message");
let logos = [];

function showMessage(text, type="info") {
  message.textContent = text;
  message.className = `message ${type}`;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}
function render(list) {
  count.textContent = `${list.length} logo${list.length === 1 ? "" : "s"}`;
  if (!list.length) {
    grid.innerHTML = `<div class="empty">कोई logo नहीं मिला।</div>`;
    return;
  }
  grid.innerHTML = list.map(l => `
    <article class="card">
      <div class="logo-box">
        <img src="${escapeHtml(l.public_url)}" alt="${escapeHtml(l.name)}" loading="lazy">
      </div>
      <div class="card-body">
        <h3>${escapeHtml(l.name)}</h3>
        ${l.description ? `<p>${escapeHtml(l.description)}</p>` : ""}
        <a class="btn primary download" href="${escapeHtml(l.public_url)}" download="${escapeHtml(l.name)}">Download</a>
      </div>
    </article>
  `).join("");
}
async function loadLogos() {
  try {
    const { data, error } = await supabaseClient
      .from("logos")
      .select("id,name,description,storage_path,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    logos = (data || []).map(l => ({
      ...l,
      public_url: supabaseClient.storage.from("logos").getPublicUrl(l.storage_path).data.publicUrl
    }));
    render(logos);
  } catch (e) {
    console.error(e);
    showMessage("Logo library load नहीं हो सकी। पहले Supabase configuration check करें।", "error");
    count.textContent = "";
  }
}
search.addEventListener("input", () => {
  const q = search.value.trim().toLowerCase();
  render(logos.filter(l => `${l.name} ${l.description || ""}`.toLowerCase().includes(q)));
});
loadLogos();
