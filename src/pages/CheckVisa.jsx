import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function CheckVisa() {

  const [visaNumber, setVisaNumber] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);

  /* ================= CAPTCHA DRAW ================= */

  const drawCaptcha = useCallback((text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#d6e5e5";
    ctx.fillRect(0, 0, width, height);

    // Heavy Noise
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = `rgba(0,0,150,${Math.random() * 0.3})`;
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }

    // Random Lines
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = "rgba(0,0,120,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Text
    ctx.font = "bold 28px Georgia";
    ctx.fillStyle = "#2f5fa0";
    ctx.shadowColor = "rgba(0,0,100,0.4)";
    ctx.shadowBlur = 2;

    for (let i = 0; i < text.length; i++) {
      const x = 20 + i * 30;
      const y = 35;
      const angle = (Math.random() - 0.5) * 0.6;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

  }, []);

  /* ================= CAPTCHA GENERATE ================= */

  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    setCaptcha(code);
    setUserCaptcha("");
  }, []);

  useEffect(() => {
    if (captcha) drawCaptcha(captcha);
  }, [captcha, drawCaptcha]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!visaNumber.trim()) {
      alert("Please enter visa number");
      return;
    }

    if (userCaptcha.trim().toUpperCase() !== captcha) {
      alert("Wrong verification code");
      generateCaptcha();
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("visa_records")
        .select("*")
        .eq("visa_number", visaNumber.trim())
        .single();

      if (error || !data) {
        alert("Visa not found");
        generateCaptcha();
        return;
      }

      setResult(data);

    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const btnAltaCautareClick = () => {
    setResult(null);
    setVisaNumber("");
    generateCaptcha();
  };

  /* ================= JSX ================= */

  return (
    <>
      <div id="header-wrapper">
        <div id="header-emblem">
          <a id="header-title" href="#">
            <span>
              MINISTRY OF FOREIGN AFFAIRS AND EUROPEAN INTEGRATION
              OF THE REPUBLIC OF MOLDOVA
            </span>
          </a>
        </div>

        <div id="header-right">
          <span>
            <img src="/Images/eVisa.png" width="187" height="79" alt="eVisa" />
          </span>

          <div className="languages">
            <a href="#" className="langRO-passive">&nbsp;</a>
            <a href="#" className="langEN">&nbsp;</a>
          </div>
        </div>

        <ul id="horizontal-menu" className="sf-menu">
          <li className="menu-item-level1 col1"><a href="#">Start</a></li>
          <li className="menu-item-level1 col2"><a href="#">Do I need a visa?</a></li>
          <li className="menu-item-level1 col3"><a href="#">Apply now</a></li>
          <li className="menu-item-level1 col4"><a href="#">Continue application</a></li>
          <li className="menu-item-level1 col5"><a href="#">Check your application status</a></li>
          <li className="menu-item-level1 col6"><a href="#">Check visa</a></li>
        </ul>
      </div>

      <div id="body-wrapper" className="inner">
        <div id="sidebar">
          <div className="sidebar-item">
            Things you should know
            <a href="#">10 things you should know about the eVisa</a>
          </div>
        </div>

        <div id="content">
          <div className="page-title-content"></div>
          <div id="masterMainContent">

            {!result && (
              <form id="formVerificaViza" onSubmit={handleSubmit}>
                <fieldset className="app-panel">

                  <div className="app-left-panel">
                    Seeking visa
                  </div>

                  <div className="app-content-panel">
                    <div className="content-left">

                      <div className="app-content-data">
                        <label htmlFor="NumarViza">Visa number</label>
                        <input
                          id="NumarViza"
                          type="text"
                          value={visaNumber}
                          onChange={(e) => setVisaNumber(e.target.value)}
                        />
                      </div>

                      <div className="app-content-data">

                        <canvas
                          ref={canvasRef}
                          width="220"
                          height="50"
                          className="captcha-canvas"
                        />

                        <br />

                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          generateCaptcha();
                        }}>
                          Refresh
                        </a>

                        <br />

                        Verification code
                        <br />

                        <input
                          type="text"
                          value={userCaptcha}
                          onChange={(e) => setUserCaptcha(e.target.value)}
                        />

                      </div>

                      <div className="app-content-data">
                        <button type="submit" disabled={loading}>
                          {loading ? "Checking..." : "Check"}
                        </button>
                      </div>

                    </div>

                    <div className="content-right"></div>

                  </div>
                </fieldset>
              </form>
            )}

            {result && (
              <div id="rezVerificaViza">
                <fieldset className="app-panel">

                  <div className="app-left-panel">
                    Seeking visa
                  </div>

                  <div className="app-content-panel">

                    <div style={{ display: "flex", gap: "10px", margin: "10px", marginRight: "50px" }}>

                      <div>
                        {result.photo_url ? (
                          <img
                            src={result.photo_url}
                            alt=""
                            style={{
                              width: "120px",
                              height: "120px",
                              border: "1px solid #333",
                              objectFit: "cover"
                            }}
                          />
                        ) : (
                          <div style={{
                            width: "120px",
                            height: "120px",
                            border: "1px solid #333",
                            background: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            color: "#666"
                          }}>
                            Photo not found
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
                        <div>Surname: <strong>{result.surname}</strong></div>
                        <div>First name: <strong>{result.first_name}</strong></div>
                        <div>Date of birth: <strong>{result.date_of_birth}</strong></div>
                        <div>Citizenship: <strong>{result.citizenship}</strong></div>
                        <div>Passport number: <strong>{result.passport_num}</strong></div>
                      </div>

                    </div>

                    <div style={{ fontSize: "14px", lineHeight: "1.8", margin: "10px" }}>
                      <div>
                        <span style={{ color: "red" }}>Visa status: </span>
                        <strong style={{ color: "red" }}>{result.visa_status}</strong>
                      </div>
                      <div>Visa validity: <strong>{result.visa_validity}</strong></div>
                      <div>Visa type: <strong>{result.visa_type}</strong></div>
                      <div>Visit purpose: <strong>{result.visit_purpose}</strong></div>
                    </div>

                    <div style={{ textAlign: "center", margin: "0 10px 10px 10px" }}>
                      <button type="button" onClick={btnAltaCautareClick}>
                        Another search
                      </button>
                    </div>

                  </div>
                </fieldset>
              </div>
            )}

          </div>
        </div>
      </div>

      <div id="footer-wrapper"> 
        <span style={{ color: "LightGray" }}>Version: 1.6.1.0</span> 
        <table id="contact-info"> 
          <tbody> 
            <tr> 
              <td style={{ width: "210px" }}>&nbsp;</td> 
              <td><strong>E-mail:</strong></td> 
              <td> <a href="mailto:evisa@mfa.gov.md"> evisa@mfa.gov.md </a> </td> 
            </tr> 
          </tbody> 
        </table> 
      </div>
    </>
  );
}