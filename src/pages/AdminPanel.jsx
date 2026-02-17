import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function AdminPanel() {

  /* ================= PASSWORD PROTECTION ================= */

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  const [authorized, setAuthorized] = useState(
    localStorage.getItem("adminAuth") === "true"
  );
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      localStorage.setItem("adminAuth", "true");
      setErrorMsg("");
    } else {
      setErrorMsg("Wrong Password ❌");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setAuthorized(false);
    setPassword("");
  };

  /* ================= FORM STATE ================= */

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
    visit_purpose: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [visaList, setVisaList] = useState([]);
  const [editId, setEditId] = useState(null);

  /* ================= FETCH ================= */

  const fetchVisaList = useCallback(async () => {
    const { data } = await supabase
      .from("visa_records")
      .select("*")
      .order("created_at", { ascending: false });

    setVisaList(data || []);
  }, []);

  useEffect(() => {
    if (authorized) fetchVisaList();
  }, [authorized, fetchVisaList]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await supabase.from("visa_records").delete().eq("id", id);
    fetchVisaList();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let photoUrl = form.photo_url || null;

    if (photo) {
      const fileName = `${Date.now()}-${photo.name}`;

      const { error } = await supabase.storage
        .from("visa-photos")
        .upload(fileName, photo, { upsert: true });

      if (error) return alert("Photo upload failed ❌");

      const { data } = supabase.storage
        .from("visa-photos")
        .getPublicUrl(fileName);

      photoUrl = data.publicUrl;
    }

    const payload = { ...form, photo_url: photoUrl };

    if (editId) {
      await supabase.from("visa_records").update(payload).eq("id", editId);
      setEditId(null);
    } else {
      if (!photoUrl) return alert("Please upload photo");
      await supabase.from("visa_records").insert([payload]);
    }

    setForm(emptyForm);
    setPhoto(null);
    fetchVisaList();
  };

  const renderInput = (label, name, type = "text") => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
      />
    </div>
  );

  /* ================= LOGIN SCREEN ================= */

  if (!authorized) {
    return (
      <div className="admin-login-wrapper">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <h2>Admin Access</h2>
          <p>Please enter your password to continue</p>

          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMsg && <div className="login-error">{errorMsg}</div>}

          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  /* ================= ADMIN PANEL ================= */

  return (
    <div className="container">

      <div className="admin-header">
        <h2>Admin Panel</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">

        {renderInput("Visa Number", "visa_number")}
        {renderInput("Surname", "surname")}
        {renderInput("First Name", "first_name")}
        {renderInput("Date of Birth", "date_of_birth", "date")}
        {renderInput("Citizenship", "citizenship")}
        {renderInput("Passport Number", "passport_num")}
        {renderInput("Visa Status", "visa_status")}
        {renderInput("Visa Validity", "visa_validity", "date")}
        {renderInput("Visa Type", "visa_type")}
        {renderInput("Visit Purpose", "visit_purpose")}

        <div className="form-group full-width">
          <label>Photo</label>
          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
        </div>

        <button type="submit" className="submit-btn">
          {editId ? "Update Visa" : "Add Visa"}
        </button>

      </form>

      <h3>All Visa Records</h3>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Visa No</th>
            <th>Name</th>
            <th>Status</th>
            <th>Passport</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visaList.map((item) => (
            <tr key={item.id}>
              <td><img src={item.photo_url} width="60" alt="" /></td>
              <td>{item.visa_number}</td>
              <td>{item.first_name} {item.surname}</td>
              <td>{item.visa_status}</td>
              <td>{item.passport_num}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
