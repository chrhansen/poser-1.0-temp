const template1 = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
<tr><td align="center" style="padding:0;">
<table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;font-family:'Work Sans',Arial,Helvetica,sans-serif;color:#171717;">
  <tr><td style="padding:32px 24px 24px;">
    <img src="https://poser.pro/logo-email.png" alt="Poser" width="28" height="28" style="display:inline-block;vertical-align:middle;border:0;" />
    <span style="display:inline-block;vertical-align:middle;margin-left:8px;font-size:18px;font-weight:700;color:#171717;letter-spacing:-0.3px;">poser</span>
  </td></tr>
  <tr><td style="padding:0 24px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>
  <tr><td style="padding:40px 24px;">
    <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#171717;line-height:1.3;">Your verification code</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#666666;line-height:1.6;">Enter this code in the app to verify your email address:</p>
    <div style="background-color:#f5f5f5;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:700;color:#171717;letter-spacing:6px;">847291</span>
    </div>
    <p style="margin:0 0 8px;font-size:14px;color:#666666;line-height:1.5;">This code expires in 10 minutes.</p>
    <p style="margin:0;font-size:13px;color:#999999;line-height:1.5;">If you didn't request this code, you can safely ignore this email.</p>
  </td></tr>
  <tr><td style="padding:0 24px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>
  <tr><td style="padding:20px 24px 32px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#999999;line-height:1.5;">&copy; 2026 Poser &middot; <a href="https://poser.pro" style="color:#999999;text-decoration:underline;">poser.pro</a></p>
  </td></tr>
</table>
</td></tr>
</table>`;

const template5 = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
<tr><td align="center" style="padding:0;">
<table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;font-family:'Work Sans',Arial,Helvetica,sans-serif;color:#171717;">
  <tr><td style="padding:32px 24px 24px;">
    <img src="https://poser.pro/logo-email.png" alt="Poser" width="28" height="28" style="display:inline-block;vertical-align:middle;border:0;" />
    <span style="display:inline-block;vertical-align:middle;margin-left:8px;font-size:18px;font-weight:700;color:#171717;letter-spacing:-0.3px;">poser</span>
  </td></tr>
  <tr><td style="padding:0 24px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>
  <tr><td style="padding:40px 24px;">
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#171717;line-height:1.3;">Your clip is ready</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#666666;line-height:1.6;">Your clip has finished processing. View your replay outputs below.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td align="center">
      <a href="https://poser.pro/clips/clip_abc123" target="_blank" style="display:inline-block;background-color:#039e6a;color:#ffffff;font-family:'Work Sans',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">View Clip</a>
    </td></tr></table>
    <p style="margin:32px 0 0;font-size:13px;color:#999999;line-height:1.5;">If you didn't request this, you can safely ignore this email.</p>
  </td></tr>
  <tr><td style="padding:0 24px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>
  <tr><td style="padding:20px 24px 32px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#999999;line-height:1.5;">&copy; 2026 Poser &middot; <a href="https://poser.pro" style="color:#999999;text-decoration:underline;">poser.pro</a></p>
  </td></tr>
</table>
</td></tr>
</table>`;

const template10 = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
<tr><td align="center" style="padding:0;">
<table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;font-family:'Work Sans',Arial,Helvetica,sans-serif;color:#171717;">
  <tr><td style="padding:32px 24px 24px;">
    <img src="https://poser.pro/logo-email.png" alt="Poser" width="28" height="28" style="display:inline-block;vertical-align:middle;border:0;" />
    <span style="display:inline-block;vertical-align:middle;margin-left:8px;font-size:18px;font-weight:700;color:#171717;letter-spacing:-0.3px;">poser</span>
  </td></tr>
  <tr><td style="padding:0 24px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>
  <tr><td style="padding:40px 24px;">
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#171717;line-height:1.3;">Confirm your clip</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#666666;line-height:1.6;">Please confirm your email to start processing your clip. Once confirmed, we'll begin generating your replay outputs.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td align="center">
      <a href="https://poser.pro/api/embed/confirm?token=abc123" target="_blank" style="display:inline-block;background-color:#039e6a;color:#ffffff;font-family:'Work Sans',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">Confirm and Start</a>
    </td></tr></table>
    <p style="margin:32px 0 0;font-size:13px;color:#999999;line-height:1.5;">If you didn't request this, you can safely ignore this email.</p>
  </td></tr>
  <tr><td style="padding:0 24px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>
  <tr><td style="padding:20px 24px 32px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#999999;line-height:1.5;">&copy; 2026 Poser &middot; <a href="https://poser.pro" style="color:#999999;text-decoration:underline;">poser.pro</a></p>
  </td></tr>
</table>
</td></tr>
</table>`;

const templates = [
  { label: "#1 — auth_verification_code (OTP code)", html: template1 },
  { label: "#5 — direct_clip_finished_user (Clip ready)", html: template5 },
  { label: "#10 — embed_clip_confirmation (Confirm clip)", html: template10 },
];

export default function EmailTemplatePreview() {
  return (
    <div style={{ background: "#e5e5e5", minHeight: "100vh", padding: "40px 20px" }}>
      <h1 style={{ textAlign: "center", fontFamily: "Arial, sans-serif", fontSize: 20, color: "#666", marginBottom: 40 }}>
        Email Template Previews
      </h1>
      {templates.map((t) => (
        <div key={t.label} style={{ marginBottom: 60 }}>
          <p style={{ maxWidth: 520, margin: "0 auto 8px", fontSize: 13, fontWeight: "bold", color: "#999", textTransform: "uppercase", letterSpacing: 1, fontFamily: "Arial, sans-serif" }}>
            {t.label}
          </p>
          <div dangerouslySetInnerHTML={{ __html: t.html }} />
        </div>
      ))}
    </div>
  );
}
