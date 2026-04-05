const CONTACT_EMAIL = "contact@mightyblessing.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InquiryPayload = {
  name?: string;
  email?: string;
  organization?: string;
  message?: string;
  company?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildMailBody(payload: Required<Pick<InquiryPayload, "name" | "email" | "message">> & InquiryPayload) {
  return [
    "새 프로젝트 문의가 도착했습니다.",
    "",
    `이름: ${payload.name}`,
    `이메일: ${payload.email}`,
    `단체명: ${payload.organization || "-"}`,
    "",
    "[문의 내용]",
    payload.message,
  ].join("\n");
}

function buildMailHtml(payload: Required<Pick<InquiryPayload, "name" | "email" | "message">> & InquiryPayload) {
  const rows = [
    ["이름", payload.name],
    ["이메일", payload.email],
    ["단체명", payload.organization || "-"],
  ];

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827">
      <h2 style="margin:0 0 16px">새 프로젝트 문의가 도착했습니다.</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="padding:8px 0;color:#6b7280;width:140px;vertical-align:top">${escapeHtml(label)}</td>
                  <td style="padding:8px 0">${escapeHtml(value)}</td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
      <div>
        <p style="margin:0 0 8px;color:#6b7280">문의 내용</p>
        <div style="white-space:pre-wrap">${escapeHtml(payload.message)}</div>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as InquiryPayload;

    if (payload.company) {
      return Response.json({ ok: true }, { status: 200 });
    }

    const name = payload.name?.trim() || "";
    const email = payload.email?.trim() || "";
    const message = payload.message?.trim() || "";

    if (!name || !email || !message) {
      return Response.json({ error: "이름, 이메일, 문의 내용은 꼭 입력해 주세요." }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return Response.json({ error: "올바른 이메일 형식을 입력해 주세요." }, { status: 400 });
    }

    const subjectBase = payload.organization?.trim() || name;
    const subject = `[프로젝트 문의] ${subjectBase}`;
    const normalizedPayload = { ...payload, name, email, message };

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.INQUIRY_FROM_EMAIL;
    const toEmail = process.env.INQUIRY_TO_EMAIL || CONTACT_EMAIL;

    if (!resendApiKey || !fromEmail) {
      return Response.json(
        {
          ok: true,
          delivery: "mailto",
          to: toEmail,
          subject,
        },
        { status: 200 },
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject,
        text: buildMailBody(normalizedPayload),
        html: buildMailHtml(normalizedPayload),
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      return Response.json({ error: `메일 전송에 실패했습니다. ${errorText}` }, { status: 502 });
    }

    return Response.json({ ok: true, delivery: "email" }, { status: 200 });
  } catch {
    return Response.json({ error: "문의 전송 중 오류가 발생했습니다." }, { status: 500 });
  }
}
