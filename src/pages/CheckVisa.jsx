import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function CheckVisa() {

  const [visaNumber, setVisaNumber] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [result, setResult] = useState(null);

  const canvasRef = useRef(null);

  /* ================= CAPTCHA ================= */

  const drawCaptcha = useCallback((text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d6e5e5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#2f5fa0";

    for (let i = 0; i < text.length; i++) {
      const x = 25 + i * 30;
      const y = 35;
      const angle = (Math.random() - 0.5) * 0.6;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  }, []);

  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    setCaptcha(code);
    setTimeout(() => drawCaptcha(code), 50);
  }, [drawCaptcha]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userCaptcha !== captcha) {
      alert("Wrong verification code");
      generateCaptcha();
      return;
    }

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
  };

  const btnAltaCautareClick = () => {
    setResult(null);
    setVisaNumber("");
    setUserCaptcha("");
    generateCaptcha();
  };

  /* ================= JSX ================= */

  return (
    <>
      {/* HEADER */}
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
            <img src="/Images/eVisa.png" width="187" height="79" alt="eVisa"/>
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

      {/* BODY */}
      <div id="body-wrapper" className="inner">

        {/* SIDEBAR */}
        <div id="sidebar">
          <div className="sidebar-item">
            Things you should know
            <a href="#">10 things you should know about the eVisa</a>
          </div>
        </div>

        {/* CONTENT */}
        <div id="content">
          <div id="masterMainContent">

            {/* FORM */}
            {!result && (
              <form id="formVerificaViza" onSubmit={handleSubmit}>
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
                        <br/>
                        <canvas
                          ref={canvasRef}
                          width="220"
                          height="50"
                          style={{ border: "1px solid #333" }}
                        />
                        <br/>
                        <a href="#" onClick={(e)=>{e.preventDefault();generateCaptcha();}}>
                          Refresh
                        </a>
                        <br/>
                        Verification code
                        <br/>
                        <input
                          type="text"
                          value={userCaptcha}
                          onChange={(e)=>setUserCaptcha(e.target.value)}
                        />
                        <br/>
                      </div>

                      <div className="app-content-data">
                        <button type="submit">Check</button>
                      </div>

                    </div>

                    <div className="content-right"></div>
                  </div>
                </fieldset>
              </form>
            )}

            {/* RESULT */}
            {result && (
              <div id="rezVerificaViza">
                <fieldset className="app-panel">
                  <div className="app-left-panel">
                    Seeking visa
                  </div>

                  <div className="app-content-panel">

                    <div style={{ display: "flex", gap: "10px", margin: "10px", marginRight:"50px" }}>

                      <div id="divFotografie">
                        {result.photo_url ? (
                          <img
                            src={result.photo_url}
                            alt=""
                            style={{
                              width:"120px",
                              height:"120px",
                              border:"1px solid #333",
                              objectFit:"cover"
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width:"120px",
                              height:"120px",
                              border:"1px solid #333",
                              background:"#f5f5f5",
                              display:"flex",
                              alignItems:"center",
                              justifyContent:"center",
                              fontSize:"14px",
                              color:"#666"
                            }}
                          >
                            Photo not found
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize:"14px", lineHeight:"1.8" }}>
                        <div>Surname: <strong>{result.surname}</strong></div>
                        <div>First name: <strong>{result.first_name}</strong></div>
                        <div>Date of birth: <strong>{result.date_of_birth}</strong></div>
                        <div>Citizenship: <strong>{result.citizenship}</strong></div>
                        <div>Passport number: <strong>{result.passport_num}</strong></div>
                      </div>

                    </div>

                    <div style={{ fontSize:"14px", lineHeight:"1.8", margin:"10px" }}>
                      <div>
                        <span style={{ color:"red" }}>Visa status: </span>
                        <strong style={{ color:"red" }}>{result.visa_status}</strong>
                      </div>
                      <div>Visa validity: <strong>{result.visa_validity}</strong></div>
                      <div>Visa type: <strong>{result.visa_type}</strong></div>
                      <div>Visit purpose: <strong>{result.visit_purpose}</strong></div>
                    </div>

                    <div style={{ textAlign:"center", margin:"0 10px 10px 10px" }}>
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

      {/* FOOTER */}
      <div id="footer-wrapper">
        <span style={{ color:"LightGray" }}>Version: 1.6.1.0</span>
        <table id="contact-info">
          <tbody>
            <tr>
              <td style={{ width:"210px" }}>&nbsp;</td>
              <td><strong>E-mail:</strong></td>
              <td>
                <a href="mailto:evisa@mfa.gov.md">evisa@mfa.gov.md</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}