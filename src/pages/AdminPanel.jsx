
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function AdminPanel() {

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

  useEffect(() => {
    fetchVisaList();
  }, []);

  const fetchVisaList = async () => {
    const { data, error } = await supabase
      .from("visa_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setVisaList(data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    const { error } = await supabase
      .from("visa_records")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchVisaList();
      alert("Deleted ✅");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let photoUrl = null;

    // If new photo selected → upload
    if (photo) {
      const fileName = Date.now() + "-" + photo.name;

      const { error: uploadError } = await supabase.storage
        .from("visa-photos")
        .upload(fileName, photo, { upsert: true });

      if (uploadError) {
        alert("Photo upload failed ❌");
        return;
      }

      const { data } = supabase.storage
        .from("visa-photos")
        .getPublicUrl(fileName);

      photoUrl = data.publicUrl;
    }

    if (editId) {
      // UPDATE
      const { error } = await supabase
        .from("visa_records")
        .update({
          ...form,
          ...(photoUrl && { photo_url: photoUrl })
        })
        .eq("id", editId);

      if (!error) {
        alert("Updated Successfully ✅");
        setEditId(null);
      }

    } else {
      // INSERT
      if (!photoUrl) {
        alert("Please upload photo");
        return;
      }

      const { error } = await supabase
        .from("visa_records")
        .insert([
          {
            ...form,
            photo_url: photoUrl
          }
        ]);

      if (!error) {
        alert("Added Successfully ✅");
      }
    }

    setForm(emptyForm);
    setPhoto(null);
    fetchVisaList();
  };

  return (
    <>
  

      <div className="container">
        <h2>Admin Panel</h2>

        <form onSubmit={handleSubmit} className="admin-form">

          <input name="visa_number" placeholder="Visa Number" value={form.visa_number} onChange={handleChange} />
          <input name="surname" placeholder="Surname" value={form.surname} onChange={handleChange} />
          <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} />
          <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
          <input name="citizenship" placeholder="Citizenship" value={form.citizenship} onChange={handleChange} />
          <input name="passport_num" placeholder="Passport Number" value={form.passport_num} onChange={handleChange} />
          <input name="visa_status" placeholder="Visa Status" value={form.visa_status} onChange={handleChange} />
          <input type="date" name="visa_validity" value={form.visa_validity} onChange={handleChange} />
          <input name="visa_type" placeholder="Visa Type" value={form.visa_type} onChange={handleChange} />
          <input name="visit_purpose" placeholder="Visit Purpose" value={form.visit_purpose} onChange={handleChange} />

          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />

          <button type="submit" className="check-btn">
            {editId ? "Update Visa" : "Add Visa"}
          </button>
        </form>

        <hr />

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
                <td><img src={item.photo_url} width="60" /></td>
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

     
    </>
  );
}
