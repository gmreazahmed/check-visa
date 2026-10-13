import { useState, useEffect, useCallback, useMemo } from "react";

import "./AdminPanel.css";

// PHP files are in the subdomain document root, not in /api/.

const API = (
  import.meta.env.VITE_API_BASE_URL || "https://moldova.fragavenuebd.com"
).replace(/\/+$/, "");

const emptyForm = {
  visa_number: "",

  surname: "",

  first_name: "",

  date_of_birth: "",

  citizenship: "",

  passport_num: "",

  visa_status: "",

  visa_validity: "",

  visa_type: "",

  visit_purpose: "",
};

const handleLogout = () => {
  localStorage.removeItem("visa_admin_logged_in");

  window.location.href = "/admin-login";
};

async function apiRequest(url, options = {}) {
  const response = await fetch(`${API}${url}`, {
    credentials: "same-origin",

    ...options,

    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),

      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function statusClass(status = "") {
  const value = String(status).toLowerCase();

  if (
    value.includes("approv") ||
    value.includes("valid") ||
    value.includes("active")
  )
    return "status-pill status-success";

  if (
    value.includes("reject") ||
    value.includes("expir") ||
    value.includes("invalid")
  )
    return "status-pill status-danger";

  if (value.includes("pending") || value.includes("process"))
    return "status-pill status-pending";

  return "status-pill";
}

export default function AdminPanel() {
  const [form, setForm] = useState(emptyForm);

  const [photo, setPhoto] = useState(null);

  const [visaList, setVisaList] = useState([]);

  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const fetchVisaList = useCallback(async () => {
    try {
      setPageError("");

      const data = await apiRequest("/visa-records.php");

      setVisaList(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      setPageError(error.message || "Could not load visa records.");
    }
  }, []);

  useEffect(() => {
    fetchVisaList();
  }, [fetchVisaList]);

  const filteredList = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return visaList;

    return visaList.filter((item) =>
      [
        item.visa_number,
        item.first_name,
        item.surname,
        item.passport_num,
        item.visa_status,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [visaList, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditId(null);

    setForm(emptyForm);

    setPhoto(null);
    setFormOpen(false);

    const fileInput = document.getElementById("visa-photo");

    if (fileInput) fileInput.value = "";
  };

  const handleEdit = (item) => {
    setForm({
      ...emptyForm,

      ...item,

      date_of_birth: item.date_of_birth?.slice(0, 10) || "",

      visa_validity: item.visa_validity?.slice(0, 10) || "",
    });

    setPhoto(null);

    setEditId(item.id);
    setFormOpen(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record? This action cannot be undone."))
      return;

    try {
      setPageError("");

      await apiRequest(`/visa-records.php?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (String(editId) === String(id)) resetForm();

      await fetchVisaList();
    } catch (error) {
      setPageError(error.message || "Delete failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setPageError("");

    try {
      let photoUrl = form.photo_url || null;

      if (photo) {
        const uploadForm = new FormData();

        uploadForm.append("photo", photo);

        const uploaded = await apiRequest("/upload-photo.php", {
          method: "POST",

          body: uploadForm,
        });

        if (!uploaded.photo_url)
          throw new Error("Photo upload did not return a photo URL.");

        photoUrl = uploaded.photo_url;
      }

      if (!editId && !photoUrl) throw new Error("Please upload a photo.");

      const payload = { ...form, photo_url: photoUrl };

      if (editId) {
        await apiRequest(`/visa-records.php?id=${encodeURIComponent(editId)}`, {
          method: "PUT",

          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/visa-records.php", {
          method: "POST",

          body: JSON.stringify(payload),
        });
      }

      resetForm();

      await fetchVisaList();
    } catch (error) {
      setPageError(error.message || "Could not save visa record.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, name, type = "text", required = true) => (
    <div className="visa-field" key={name}>
      <label htmlFor={name}>
        {label}
        {required && <span className="required-mark"> *</span>}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={form[name] ?? ""}
        onChange={handleChange}
        required={required}
        placeholder={type === "date" ? "" : `Enter ${label.toLowerCase()}`}
      />
    </div>
  );

  if (localStorage.getItem("visa_admin_logged_in") !== "true") {
    window.location.replace("/admin-login");

    return null;
  }

  return (
    <main className="visa-admin-shell">
      <aside className="visa-sidebar">
        <div className="visa-sidebar-brand">
          <div className="visa-brand-mark">V</div>

          <div>
            <strong>
              VISA<span>DESK</span>
            </strong>
            <small>ADMIN WORKSPACE</small>
          </div>
        </div>

        <div className="visa-sidebar-label">WORKSPACE</div>

        <div className="visa-nav-item visa-nav-item-active">
          <span className="visa-nav-icon">▦</span> Dashboard
        </div>

        <div className="visa-nav-item">
          <span className="visa-nav-icon">▤</span> Visa records{" "}
          <span className="visa-nav-count">{visaList.length}</span>
        </div>

        <div className="visa-sidebar-bottom">
          <div className="visa-profile-avatar">AD</div>

          <div className="visa-profile-copy">
            <strong>Administrator</strong>
            <small>Workspace access</small>
          </div>

          <button
            className="visa-logout-icon"
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            ↗
          </button>
        </div>
      </aside>

      <section className="visa-admin-main">
        <header className="visa-topbar">
          <div className="visa-breadcrumb">
            Workspace <span>/</span> <strong>Dashboard</strong>
          </div>

          <div className="visa-topbar-right">
            <span className="visa-system-status">
              <span className="visa-live-dot" /> System online
            </span>
            <button
              type="button"
              className="visa-logout-button"
              onClick={handleLogout}
            >
              Log out <span>↗</span>
            </button>
          </div>
        </header>

        <div className="visa-dashboard-content">
          <div className="visa-page-heading">
            <div>
              <span className="visa-eyebrow">OVERVIEW</span>
              <h1>Dashboard</h1>
              <p>Manage visa records from one simple workspace.</p>
            </div>

            <button
              type="button"
              className="visa-refresh-button"
              onClick={fetchVisaList}
              disabled={loading}
            >
              <span>↻</span> Refresh data
            </button>
          </div>

          {pageError && (
            <div className="visa-alert visa-alert-error" role="alert">
              <span>!</span>
              <div>{pageError}</div>
              <button
                type="button"
                onClick={() => setPageError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div className="visa-stats-grid">
            <article className="visa-stat-card">
              <div className="visa-stat-top">
                <span>Total records</span>
                <span className="visa-stat-icon icon-blue">▤</span>
              </div>

              <div className="visa-stat-value">{visaList.length}</div>

              <div className="visa-stat-note">All saved visa entries</div>
            </article>

            <article className="visa-stat-card">
              <div className="visa-stat-top">
                <span>Showing now</span>
                <span className="visa-stat-icon icon-purple">⌕</span>
              </div>

              <div className="visa-stat-value">{filteredList.length}</div>

              <div className="visa-stat-note">Records matching your search</div>
            </article>

            <article className="visa-stat-card">
              <div className="visa-stat-top">
                <span>Workspace status</span>
                <span className="visa-stat-icon icon-green">✓</span>
              </div>

              <div className="visa-stat-value visa-stat-word">Active</div>

              <div className="visa-stat-note">
                <span className="visa-live-dot" /> Ready to manage records
              </div>
            </article>
          </div>

          <section className="visa-panel visa-form-panel">
            <div className="visa-panel-heading">
              <div className="visa-panel-title-icon">{editId ? "✎" : "+"}</div>

              <div>
                <h2>{editId ? "Edit visa record" : "Add a visa record"}</h2>
                <p>
                  {editId
                    ? "Update the details below and save your changes."
                    : "Enter applicant information to create a new record."}
                </p>
              </div>

              {editId && (
                <span className="visa-edit-badge">
                  EDITING RECORD #{editId}
                </span>
              )}
              <button
                type="button"
                className="visa-form-toggle"
                onClick={() => setFormOpen((open) => !open)}
                aria-expanded={formOpen}
              >
                {formOpen
                  ? "Close form"
                  : editId
                    ? "Continue editing"
                    : "Add data"}
                <span aria-hidden="true">{formOpen ? "−" : "+"}</span>
              </button>
            </div>

            {formOpen && (
              <form onSubmit={handleSubmit} className="visa-record-form">
                <div className="visa-form-section-label">
                  <span>01</span> VISA INFORMATION
                </div>

                <div className="visa-form-grid">
                  {renderInput("Visa number", "visa_number")}

                  <div className="visa-field">
                    <label htmlFor="visa_status">
                      Visa status <span className="required-mark">*</span>
                    </label>
                    <select
                      id="visa_status"
                      name="visa_status"
                      value={form.visa_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  {renderInput("Visa type", "visa_type")}

                  {renderInput("Visa validity", "visa_validity", "date")}

                  {renderInput("Visit purpose", "visit_purpose")}
                </div>

                <div className="visa-form-section-label visa-section-spaced">
                  <span>02</span> APPLICANT DETAILS
                </div>

                <div className="visa-form-grid">
                  {renderInput("First name", "first_name")}

                  {renderInput("Surname", "surname")}

                  {renderInput("Date of birth", "date_of_birth", "date")}

                  {renderInput("Citizenship", "citizenship")}

                  {renderInput("Passport number", "passport_num")}
                </div>

                <div className="visa-form-section-label visa-section-spaced">
                  <span>03</span> APPLICANT PHOTO
                </div>

                <div className="visa-photo-upload">
                  <div className="visa-photo-preview">
                    {photo ? (
                      <img
                        src={URL.createObjectURL(photo)}
                        alt="Selected applicant"
                      />
                    ) : form.photo_url ? (
                      <img src={form.photo_url} alt="Current applicant" />
                    ) : (
                      <span>▧</span>
                    )}
                  </div>

                  <div className="visa-photo-copy">
                    <strong>
                      {photo
                        ? photo.name
                        : form.photo_url
                          ? "Current photo selected"
                          : "Upload applicant photo"}
                    </strong>
                    <p>JPG, PNG or WebP. Choose a clear, readable image.</p>
                    <label className="visa-upload-button" htmlFor="visa-photo">
                      Choose image
                    </label>
                    <input
                      className="visa-file-input"
                      id="visa-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    />
                    {form.photo_url && !photo && (
                      <small>
                        Existing photo will be retained if no new image is
                        selected.
                      </small>
                    )}
                  </div>
                </div>

                <div className="visa-form-actions">
                  {editId && (
                    <button
                      type="button"
                      className="visa-secondary-button"
                      onClick={resetForm}
                    >
                      Cancel edit
                    </button>
                  )}

                  <button
                    type="submit"
                    className="visa-primary-button"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editId
                        ? "Save changes"
                        : "Add visa record"}{" "}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="visa-panel visa-records-panel">
            <div className="visa-records-heading">
              <div>
                <span className="visa-eyebrow">DATABASE</span>
                <h2>
                  Visa records{" "}
                  <span className="visa-total-chip">{visaList.length}</span>
                </h2>
                <p>Review, search and manage saved entries.</p>
              </div>

              <div className="visa-search-box">
                <span>⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search visa, name, passport..."
                  aria-label="Search records"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="visa-table-wrap">
              <table className="visa-records-table">
                <thead>
                  <tr>
                    <th>APPLICANT</th>
                    <th>VISA NUMBER</th>
                    <th>STATUS</th>
                    <th>PASSPORT NO.</th>
                    <th>VALID UNTIL</th>
                    <th className="visa-actions-heading">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="visa-applicant-cell">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt="" />
                          ) : (
                            <div className="visa-table-avatar">
                              {String(item.first_name || "V")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div>
                            <strong>
                              {item.first_name} {item.surname}
                            </strong>
                            <small>
                              {item.citizenship || "Citizenship not set"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="visa-number-text">
                          {item.visa_number || "—"}
                        </span>
                      </td>

                      <td>
                        <span className={statusClass(item.visa_status)}>
                          <span />
                          {item.visa_status || "Not set"}
                        </span>
                      </td>

                      <td>{item.passport_num || "—"}</td>

                      <td>{item.visa_validity || "—"}</td>

                      <td>
                        <div className="visa-row-actions">
                          <button
                            type="button"
                            className="visa-edit-button"
                            onClick={() => handleEdit(item)}
                          >
                            <span>✎</span> Edit
                          </button>
                          <button
                            type="button"
                            className="visa-delete-button"
                            onClick={() => handleDelete(item.id)}
                            aria-label={`Delete ${item.visa_number}`}
                            title="Delete record"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="visa-empty-state">
                          <div>▤</div>
                          <strong>
                            {search
                              ? "No matching records"
                              : "No visa records yet"}
                          </strong>
                          <p>
                            {search
                              ? "Try a different visa number, name or passport number."
                              : "Add your first visa record using the form above."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="visa-table-footer">
              <span>
                Showing <strong>{filteredList.length}</strong> of{" "}
                <strong>{visaList.length}</strong> records
              </span>
              <span>
                VisaDesk <span className="visa-footer-dot">•</span> Admin
                workspace
              </span>
            </div>
          </section>

          <footer className="visa-dashboard-footer">
            © {new Date().getFullYear()} VisaDesk Admin Workspace{" "}
            <span>Built for simple record management</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
