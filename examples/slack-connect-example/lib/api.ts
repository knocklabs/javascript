const headers = { "Content-Type": "application/json" };

export async function setToken(params = {}) {
  try {
    const resp = await fetch("/api/set_token", {
      method: "POST",
      body: JSON.stringify(params),
      headers,
    });

    const jsonResponse = await resp.json();

    return jsonResponse;
  } catch (e) {
    return { error: "Error sending request" };
  }
}
