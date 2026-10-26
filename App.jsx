import { useState } from "react";

const EMERGENCIES = [
  {
    id: "shooter",
    icon: "🚨",
    label: "Tirador Activo",
    color: "#c62828",
    bg: "#ff3b3b",
    tips: [
      "🔒 Enciérrate y bloquea la puerta",
      "💡 Apaga las luces",
      "📵 Silencia tu teléfono",
      "🙈 Aléjate de ventanas y puertas",
      "🤫 Permanece en silencio",
      "🚪 NO abras hasta que llegue la policía",
    ],
    message: (loc, time, date) =>
      `🚨 ALERTA — TIRADOR ACTIVO 🚨\nUNIVERSIDAD EN EMERGENCIA\n📍 Ubicación: ${loc}\n🕐 ${time} - ${date}\n⚠️ REFUGÍATE DE INMEDIATO\n🔒 Enciérrate, silencia el teléfono\n📞 Llama al 133 (Carabineros)`,
  },
  {
    id: "fire",
    icon: "🔥",
    label: "Incendio",
    color: "#e65100",
    bg: "#ff6d00",
    tips: [
      "🚪 Evacúa por las salidas de emergencia",
      "🙅 NO uses ascensores",
      "👇 Agáchate si hay humo",
      "🚿 Cierra puertas para contener el fuego",
      "📍 Reúnete en el punto de encuentro",
      "🔙 NO vuelvas al edificio",
    ],
    message: (loc, time, date) =>
      `🔥 ALERTA — INCENDIO 🔥\nUNIVERSIDAD EN EMERGENCIA\n📍 Ubicación: ${loc}\n🕐 ${time} - ${date}\n⚠️ EVACÚA POR SALIDAS DE EMERGENCIA\n🙅 NO uses ascensores\n📞 Llama al 132 (Bomberos)`,
  },
  {
    id: "medical",
    icon: "🏥",
    label: "Emergencia Médica",
    color: "#1565c0",
    bg: "#1e88e5",
    tips: [
      "📞 Llama al 131 (SAMU) inmediatamente",
      "🧍 No muevas a la persona lesionada",
      "🩹 Si sabes RCP, aplícalo si es necesario",
      "🚪 Despeja el área alrededor",
      "📍 Indica la ubicación exacta al operador",
      "⏳ Permanece con la persona hasta que llegue ayuda",
    ],
    message: (loc, time, date) =>
      `🏥 ALERTA — EMERGENCIA MÉDICA 🏥\nUNIVERSIDAD — SE REQUIERE AYUDA\n📍 Ubicación: ${loc}\n🕐 ${time} - ${date}\n⚠️ SE NECESITA ASISTENCIA MÉDICA URGENTE\n📞 Llama al 131 (SAMU)`,
  },
  {
    id: "bomb",
    icon: "💣",
    label: "Amenaza de Bomba",
    color: "#4a148c",
    bg: "#7b1fa2",
    tips: [
      "🚶 Evacúa el edificio de inmediato",
      "🔍 NO toques objetos sospechosos",
      "📵 Evita usar el teléfono cerca del objeto",
      "🚪 Deja puertas y ventanas abiertas",
      "📍 Reúnete lejos del edificio",
      "🚔 Espera instrucciones de Carabineros",
    ],
    message: (loc, time, date) =>
      `💣 ALERTA — AMENAZA DE BOMBA 💣\nUNIVERSIDAD EN EMERGENCIA\n📍 Ubicación: ${loc}\n🕐 ${time} - ${date}\n⚠️ EVACÚA EL EDIFICIO INMEDIATAMENTE\n🔍 NO toques objetos sospechosos\n📞 Llama al 133 (Carabineros)`,
  },
  {
    id: "evacuation",
    icon: "🌊",
    label: "Evacuación General",
    color: "#00695c",
    bg: "#00897b",
    tips: [
      "🚶 Evacúa de forma ordenada y calmada",
      "🙅 NO corras ni empujes",
      "📍 Dirígete al punto de encuentro",
      "🧍 Ayuda a personas con movilidad reducida",
      "📵 Mantén las líneas de emergencia libres",
      "✅ Espera instrucciones del personal",
    ],
    message: (loc, time, date) =>
      `🌊 ALERTA — EVACUACIÓN GENERAL 🌊\nUNIVERSIDAD EN EMERGENCIA\n📍 Ubicación: ${loc}\n🕐 ${time} - ${date}\n⚠️ EVACÚA DE FORMA ORDENADA\n📍 Ve al punto de encuentro designado\n📞 Llama al 133 (Carabineros)`,
  },
];

const LOCATIONS = [
  "Edificio A — Aulas", "Edificio B — Laboratorios",
  "Biblioteca", "Cafetería",
  "Gimnasio", "Estacionamiento",
  "Administración", "Otra ubicación",
];

export default function App() {
  const [tab, setTab] = useState("alert");
  const [selected, setSelected] = useState(null);
  const [location, setLocation] = useState("");
  const [customLoc, setCustomLoc] = useState("");
  const [step, setStep] = useState("main");
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState(null);

  const emergency = EMERGENCIES.find(e => e.id === selected);
  const finalLocation = location === "Otra ubicación" ? customLoc : location;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("es-CL");
  const alertMsg = emergency ? emergency.message(finalLocation || "No especificada", timeStr, dateStr) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(alertMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    setSending(true);
    setWebhookStatus(null);
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            emergencia: emergency.label,
            ubicacion: finalLocation || "No especificada",
            hora: timeStr,
            fecha: dateStr,
            mensaje: alertMsg,
          }),
        });
        setWebhookStatus("ok");
      } catch {
        setWebhookStatus("error");
      }
    }
    setSending(false);
    setStep("sent");
  };

  const reset = () => {
    setSelected(null);
    setLocation("");
    setCustomLoc("");
    setStep("main");
    setWebhookStatus(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", fontFamily: "sans-serif", maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 0", textAlign: "center" }}>
        <div style={{ fontSize: "36px" }}>🏫</div>
        <h1 style={{ fontSize: "17px", margin: "4px 0 2px", color: "#fff", letterSpacing: "1px", textTransform: "uppercase" }}>Sistema de Alertas</h1>
        <p style={{ color: "#777", fontSize: "12px", margin: 0 }}>Emergencias Universitarias</p>
      </div>

      <div style={{ display: "flex", margin: "14px 16px 0", background: "#222", borderRadius: "10px", padding: "4px" }}>
        {["alert", "config"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold",
            background: tab === t ? "#333" : "transparent", color: tab === t ? "#fff" : "#777"
          }}>{t === "alert" ? "🚨 Alertas" : "⚙️ Configuración"}</button>
        ))}
      </div>

      <div style={{ padding: "16px", flex: 1 }}>

        {tab === "config" && (
          <div>
            <div style={{ background: "#1e1e1e", borderRadius: "12px", padding: "16px", marginBottom: "14px" }}>
              <p style={{ color: "#ffcc00", fontWeight: "bold", fontSize: "14px", margin: "0 0 8px" }}>🔗 Webhook URL (Make.com)</p>
              <p style={{ color: "#888", fontSize: "12px", margin: "0 0 10px" }}>Pega aquí la URL de tu webhook de Make.com para enviar alertas automáticas vía Twilio.</p>
              <input
                placeholder="https://hook.make.com/..."
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "#2a2a2a", color: "#fff", fontSize: "13px", boxSizing: "border-box" }}
              />
              {webhookUrl && <p style={{ color: "#4caf50", fontSize: "12px", marginTop: "8px" }}>✅ Webhook configurado</p>}
            </div>
            <div style={{ background: "#1e1e1e", borderRadius: "12px", padding: "16px" }}>
              <p style={{ color: "#4fc3f7", fontWeight: "bold", fontSize: "14px", margin: "0 0 10px" }}>📋 Cómo configurar Make.com</p>
              {[
                "1. Crea una cuenta en make.com",
                "2. Crea un nuevo escenario",
                "3. Agrega módulo: Webhooks → Custom Webhook",
                "4. Copia la URL generada y pégala arriba",
                "5. Agrega módulo: Twilio → Send SMS",
                "6. Conecta tu cuenta Twilio y activa el escenario"
              ].map((s, i) => (
                <p key={i} style={{ fontSize: "12px", color: "#ccc", margin: "6px 0" }}>{s}</p>
              ))}
            </div>
          </div>
        )}

        {tab === "alert" && step === "main" && (
          <>
            {!selected && (
              <>
                <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "12px" }}>Selecciona el tipo de emergencia:</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                  {EMERGENCIES.map(e => (
                    <button key={e.id} onClick={() => setSelected(e.id)} style={{
                      background: "#1e1e1e", border: `2px solid ${e.bg}`, borderRadius: "12px",
                      padding: "16px 8px", cursor: "pointer", textAlign: "center"
                    }}>
                      <div style={{ fontSize: "28px" }}>{e.icon}</div>
                      <div style={{ color: "#fff", fontSize: "12px", fontWeight: "bold", marginTop: "6px" }}>{e.label}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {selected && emergency && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <button onClick={() => setSelected(null)} style={{ background: "#333", border: "none", color: "#aaa", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}>← Volver</button>
                  <span style={{ fontSize: "20px" }}>{emergency.icon}</span>
                  <span style={{ fontWeight: "bold", color: emergency.bg }}>{emergency.label}</span>
                </div>

                <div style={{ background: "#1e1e1e", borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
                  <p style={{ color: "#ffcc00", fontWeight: "bold", fontSize: "13px", margin: "0 0 10px" }}>📍 ¿Dónde ocurre?</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                    {LOCATIONS.map(loc => (
                      <button key={loc} onClick={() => setLocation(loc)} style={{
                        background: location === loc ? emergency.bg : "#2a2a2a",
                        color: "#fff", border: "none", borderRadius: "8px",
                        padding: "9px 6px", fontSize: "11px", cursor: "pointer"
                      }}>{loc}</button>
                    ))}
                  </div>
                  {location === "Otra ubicación" && (
                    <input
                      placeholder="Describe tu ubicación..."
                      value={customLoc}
                      onChange={e => setCustomLoc(e.target.value)}
                      style={{ marginTop: "10px", width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#333", color: "#fff", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  )}
                </div>

                <div style={{ background: "#1e1e1e", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
                  <p style={{ color: "#4fc3f7", fontWeight: "bold", fontSize: "13px", margin: "0 0 8px" }}>🛡️ Instrucciones</p>
                  {emergency.tips.map((t, i) => <p key={i} style={{ fontSize: "12px", color: "#ddd", margin: "5px 0" }}>{t}</p>)}
                </div>

                <button onClick={() => setStep("confirm")} style={{
                  width: "100%", padding: "18px", background: emergency.bg, color: "#fff",
                  fontSize: "16px", fontWeight: "bold", border: "none", borderRadius: "12px", cursor: "pointer",
                  letterSpacing: "1px"
                }}>{emergency.icon} ENVIAR ALERTA — {emergency.label.toUpperCase()}</button>
                <p style={{ textAlign: "center", fontSize: "11px", color: "#555", marginTop: "6px" }}>Se pedirá confirmación antes de enviar</p>
              </>
            )}
          </>
        )}

        {tab === "alert" && step === "confirm" && emergency && (
          <div style={{ background: "#1e1e1e", borderRadius: "14px", padding: "18px" }}>
            <p style={{ color: "#ffcc00", fontWeight: "bold", fontSize: "15px", textAlign: "center", marginBottom: "14px" }}>⚠️ ¿Confirmas el envío?</p>
            <div style={{ background: "#111", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px", color: "#eee", margin: 0, lineHeight: "1.7" }}>{alertMsg}</pre>
            </div>
            {webhookUrl && <p style={{ color: "#4caf50", fontSize: "12px", textAlign: "center", marginBottom: "10px" }}>📡 Se enviará automáticamente vía Make.com</p>}
            {!webhookUrl && <p style={{ color: "#888", fontSize: "12px", textAlign: "center", marginBottom: "10px" }}>📋 Sin webhook — podrás copiar el mensaje</p>}
            <button onClick={handleSend} disabled={sending} style={{
              width: "100%", padding: "16px", background: sending ? "#555" : emergency.bg,
              color: "#fff", fontWeight: "bold", fontSize: "15px", border: "none", borderRadius: "10px", cursor: "pointer", marginBottom: "10px"
            }}>{sending ? "⏳ Enviando..." : "✅ Confirmar alerta"}</button>
            <button onClick={() => setStep("main")} style={{
              width: "100%", padding: "12px", background: "#2a2a2a", color: "#888",
              fontSize: "13px", border: "none", borderRadius: "10px", cursor: "pointer"
            }}>← Cancelar</button>
          </div>
        )}

        {tab === "alert" && step === "sent" && emergency && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "56px", marginBottom: "8px" }}>✅</div>
            <h2 style={{ color: "#4caf50", marginBottom: "4px", fontSize: "18px" }}>Alerta enviada</h2>
            {webhookStatus === "ok" && <p style={{ color: "#4caf50", fontSize: "13px" }}>📡 Enviado a Make.com correctamente</p>}
            {webhookStatus === "error" && <p style={{ color: "#ff5252", fontSize: "13px" }}>⚠️ Error con el webhook — copia el mensaje manualmente</p>}
            {!webhookUrl && <p style={{ color: "#aaa", fontSize: "13px" }}>Copia el mensaje y envíalo manualmente</p>}
            <div style={{ background: "#1e1e1e", borderRadius: "10px", padding: "14px", margin: "14px 0", textAlign: "left" }}>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px", color: "#eee", margin: 0, lineHeight: "1.7" }}>{alertMsg}</pre>
            </div>
            <button onClick={handleCopy} style={{
              width: "100%", padding: "14px", background: copied ? "#4caf50" : "#1565c0",
              color: "#fff", fontWeight: "bold", fontSize: "15px", border: "none", borderRadius: "10px", cursor: "pointer", marginBottom: "10px"
            }}>{copied ? "✅ ¡Copiado!" : "📋 Copiar mensaje"}</button>
            <button onClick={reset} style={{
              width: "100%", padding: "12px", background: "#2a2a2a", color: "#aaa",
              fontSize: "13px", border: "none", borderRadius: "10px", cursor: "pointer"
            }}>🔄 Nueva alerta</button>
            <div style={{ background: "#0a1a0a", borderRadius: "10px", padding: "14px", marginTop: "16px" }}>
              <p style={{ color: "#4caf50", fontWeight: "bold", fontSize: "13px", margin: "0 0 8px" }}>📞 Emergencias Chile</p>
              <p style={{ fontSize: "13px", color: "#ddd", margin: "4px 0" }}>🚔 Carabineros: <strong>133</strong></p>
              <p style={{ fontSize: "13px", color: "#ddd", margin: "4px 0" }}>🚑 SAMU: <strong>131</strong></p>
              <p style={{ fontSize: "13px", color: "#ddd", margin: "4px 0" }}>🚒 Bomberos: <strong>132</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
