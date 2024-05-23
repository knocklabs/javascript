const headers = { "Content-Type": "application/json" };

export async function identify(params = {}) {
  try {
    const resp = await fetch("/api/identify", {
      method: "POST",
      body: JSON.stringify(params),
      headers,
    });

    const jsonResponse = await resp.json();
    return jsonResponse;
  } catch (e) {
    console.error(e);
    return { error: "Error sending request" };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function notify(params: any) {
  try {
    const resp = await fetch("/api/notify", {
      method: "POST",
      body: JSON.stringify(params),
      headers,
    });

    const jsonResponse = await resp.json();
    return jsonResponse;
  } catch (e) {
    console.error(e);
    return { error: "Error sending request" };
  }
}
