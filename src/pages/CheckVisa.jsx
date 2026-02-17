import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function CheckVisa() {

  const [visaNumber, setVisaNumber] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    setCaptcha(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userCaptcha.trim() !== captcha) {
      alert("Wrong verification code");
      generateCaptcha();
      return;
    }

    const { data } = await supabase
      .from("visa_records")
      .select("*")
      .eq("visa_number", visaNumber.trim())
      .single();

    if (!data) {
      alert("Visa not found");
      return;
    }

    setResult(data);
  };

  const resetSearch = () => {
    setResult(null);
    setVisaNumber("");
    setUserCaptcha("");
    generateCaptcha();
  };

  return (
    <>
  {/* ================= HEADER + NAVBAR ================= */}
    <div className="top-header">

    <div className="header-container">
        <div className="header-left">
        <img src="/images/national-emblem.gif" alt="Emblem" className="emblem" />
        <div className="header-text">
            MINISTRY OF FOREIGN AFFAIRS AND EUROPEAN INTEGRATION
            <br />
            OF THE REPUBLIC OF MOLDOVA
        </div>
        </div>

        <div>
        <div className="flags">
            <img src="/images/MLD-passive.png" alt="RO" />
            <img src="/images/ENG.png" alt="EN" />
        </div>
        <img src="/images/eVisa.png" alt="eVisa" className="visa-logo" />
        </div>
    </div>

    {/* NAVBAR inside header */}
    <div className="navbar">
        <div className="navbar-inner">
        <a href="#">START</a>
        <a href="#">DO I NEED A VISA?</a>
        <a href="#">APPLY NOW</a>
        <a href="#">CONTINUE APPLICATION</a>
        <a href="#">CHECK YOUR APPLICATION STATUS</a>
        <a href="#">CHECK VISA</a>
        </div>
    </div>

    </div>


{/* ================= SIDEBAR ================= */}
      <div id="body-wrapper" className="inner">
        <div id="sidebar">
          <div className="sidebar-item">
            <div className="sidebar-title">
              Things you should know
            </div>
            <a href="#" className="sidebar-link">
              10 things you should know about the eVisa
            </a>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div id="content">

          {/* ================= FORM ================= */}
          {!result && (
            <form onSubmit={handleSubmit}>
              <fieldset className="app-panel">

                <div className="app-left-panel">
                  Seeking visa
                </div>

                <div className="app-content-panel">
                  <div className="content-left">

                    <div className="app-content-data">
                      <label>Visa number</label>
                      <input
                        type="text"
                        value={visaNumber}
                        onChange={(e) => setVisaNumber(e.target.value)}
                      />
                    </div>

                    <div className="app-content-data">
                      <div className="captcha-image">{captcha}</div>

                      <div className="refresh-link">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            generateCaptcha();
                          }}
                        >
                          Refresh
                        </a>
                      </div>

                      <label>Verification code</label>
                      <input
                        type="text"
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                      />
                    </div>

                    <div className="app-content-data">
                      <button type="submit" className="blue-btn">
                        Check
                      </button>
                    </div>

                  </div>
                </div>

              </fieldset>
            </form>
          )}

          {/* ================= RESULT ================= */}
          {result && (
            <fieldset className="app-panel">

              <div className="app-left-panel">
                Seeking visa
              </div>

              <div className="app-content-panel">
                <div className="result-wrapper">

                  <div className="result-photo-box">
                    <img
                      src={result.photo_url}
                      alt="Photo"
                      className="result-photo"
                    />
                  </div>

                  <div className="result-details">

                    <div className="result-top">
                      <p><strong>Surname:</strong> {result.surname}</p>
                      <p><strong>First name:</strong> {result.first_name}</p>
                      <p><strong>Date of birth:</strong> {result.date_of_birth}</p>
                      <p><strong>Citizenship:</strong> {result.citizenship}</p>
                      <p><strong>Passport number:</strong> {result.passport_num}</p>
                    </div>

                    <div className="result-bottom">
                      <p className="status">
                        Visa status: {result.visa_status}
                      </p>
                      <p>Visa validity: {result.visa_validity}</p>
                      <p>Visa type: {result.visa_type}</p>
                      <p>Visit purpose: {result.visit_purpose}</p>

                      <div className="result-btn-box">
                        <button
                          className="blue-btn"
                          onClick={resetSearch}
                        >
                          Another search
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </fieldset>
          )}

        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="footer">
        <div className="footer-container">
          <div>Version: 1.6.1.0</div>
          <div>
            E-mail: <a href="#">evisa@mfa.gov.md</a>
          </div>
        </div>
      </div>
    </>
  );
}
