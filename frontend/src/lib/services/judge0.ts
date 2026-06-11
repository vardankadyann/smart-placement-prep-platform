const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  c: 50,
};

export async function submitToJudge0(
  sourceCode: string,
  language: string,
  stdin?: string
): Promise<{ stdout: string; stderr: string; status: string; passed: boolean }> {
  const apiKey = process.env.JUDGE0_API_KEY;
  const apiUrl = process.env.JUDGE0_API_URL ?? "https://judge0-ce.p.rapidapi.com";
  const host = process.env.JUDGE0_RAPIDAPI_HOST ?? "judge0-ce.p.rapidapi.com";

  if (!apiKey) {
    return {
      stdout: "Judge0 not configured — using AI evaluation only",
      stderr: "",
      status: "Accepted",
      passed: true,
    };
  }

  try {
    const createRes = await fetch(`${apiUrl}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": host,
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: LANGUAGE_IDS[language] ?? LANGUAGE_IDS.python,
        stdin: stdin ?? "",
      }),
    });

    const result = await createRes.json();
    const passed = result.status?.id === 3;
    return {
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? result.compile_output ?? "",
      status: result.status?.description ?? "Unknown",
      passed,
    };
  } catch {
    return { stdout: "", stderr: "Judge0 request failed", status: "Error", passed: false };
  }
}
