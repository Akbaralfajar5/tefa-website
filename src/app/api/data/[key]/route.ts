import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "Akbaralfajar5";
const REPO_NAME = "tefa-data";

const FILE_MAP: Record<string, string> = {
  products: "products.json",
  contacts: "contacts.json",
  siteSettings: "settings.json",
  password: "password.json",
};

function githubUrl(file: string): string {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  const file = FILE_MAP[params.key];
  if (!file) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  try {
    const res = await fetch(githubUrl(file), {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`GitHub ${res.status}`);

    const ghData = await res.json();
    const content = Buffer.from(ghData.content, "base64").toString("utf-8");
    const data = JSON.parse(content);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        "X-GitHub-SHA": ghData.sha,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const file = FILE_MAP[params.key];
  if (!file) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  try {
    const body = await req.json();

    // First get current SHA (required for update)
    const getRes = await fetch(githubUrl(file), {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    if (!getRes.ok) throw new Error(`GitHub GET ${getRes.status}`);
    const current = await getRes.json();

    // Update file
    const content = Buffer.from(
      JSON.stringify(body, null, 2)
    ).toString("base64");

    const putRes = await fetch(githubUrl(file), {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `update: ${file} via admin panel`,
        content,
        sha: current.sha,
      }),
    });

    if (putRes.ok) {
      return NextResponse.json({ success: true });
    }

    const errData = await putRes.json();
    return NextResponse.json(
      { error: "Failed to save", detail: errData },
      { status: putRes.status }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save", detail: String(err) },
      { status: 500 }
    );
  }
}
