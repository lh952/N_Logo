const loginView = document.getElementById("login-view");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginMsg = document.getElementById("login-msg");
const uploadForm = document.getElementById("upload-form");
const uploadMsg = document.getElementById("upload-msg");
const adminEmail = document.getElementById("admin-email");
const adminGrid = document.getElementById("admin-grid");

function msg(el, text, type="info") {
  el.textContent = text;
  el.className = `message ${type}`;
}
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}
async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) showDashboard(data.session.user);
}
async function showDashboard(user) {
  loginView.classList.add("hidden");
  dashboard.classList.remove("hidden");
  adminEmail.textContent = user.email || "";
  await loadAdminLogos();
}
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg(loginMsg, "Logging in...");
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  });
  if (error) return msg(loginMsg, error.message, "error");
  msg(loginMsg, "");
  showDashboard(data.user);
});
document.getElementById("logout").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  dashboard.classList.add("hidden");
  loginView.classList.remove("hidden");
});
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg(uploadMsg, "Uploading...");
  const file = document.getElementById("logo-file").files[0];
  const name = document.getElementById("logo-name").value.trim();
  const description = document.getElementById("logo-description").value.trim();

  if (!file) return msg(uploadMsg, "Please choose a file.", "error");
  if (file.size > 5 * 1024 * 1024) return msg(uploadMsg, "File 5 MB से बड़ा है।", "error");

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const safeExt = ["png","jpg","jpeg","webp","svg"].includes(ext) ? ext : "png";
  const path = `${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("logos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return msg(uploadMsg, uploadError.message, "error");

  const { error: dbError } = await supabaseClient.from("logos").insert({
    name, description, storage_path: path
  });

  if (dbError) {
    await supabaseClient.storage.from("logos").remove([path]);
    return msg(uploadMsg, dbError.message, "error");
  }

  uploadForm.reset();
  msg(uploadMsg, "Logo successfully uploaded.", "success");
  await loadAdminLogos();
});
async function loadAdminLogos() {
  const { data, error } = await supabaseClient
    .from("logos")
    .select("id,name,description,storage_path,created_at")
    .order("created_at", { ascending: false });
  if (error) return;
  adminGrid.innerHTML = (data || []).map(l => {
    const url = supabaseClient.storage.from("logos").getPublicUrl(l.storage_path).data.publicUrl;
    return `<div class="admin-item">
      <img src="${esc(url)}" alt="${esc(l.name)}">
      <div><strong>${esc(l.name)}</strong><small>${new Date(l.created_at).toLocaleDateString()}</small></div>
      <button class="danger" data-id="${esc(l.id)}" data-path="${esc(l.storage_path)}">Delete</button>
    </div>`;
  }).join("") || `<p class="muted">अभी कोई logo नहीं है।</p>`;

  adminGrid.querySelectorAll(".danger").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("क्या आप इस logo को permanently delete करना चाहते हैं?")) return;
      const id = btn.dataset.id, path = btn.dataset.path;
      const { error: e1 } = await supabaseClient.from("logos").delete().eq("id", id);
      if (!e1) await supabaseClient.storage.from("logos").remove([path]);
      await loadAdminLogos();
    });
  });
}
checkSession();
