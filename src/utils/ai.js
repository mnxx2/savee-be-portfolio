const chatGPT = async (prompt) => {
  const endPoint = process.env.CHAT_ENDPOINT;
  const apiKey = process.env.CHAT_KEY;
  const response = await fetch(endPoint, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "system", content: prompt }],
    }),
  });
  if (!response.ok) {
    const text = await response.text(); // JSON 아닌 경우 대비
    throw new Error(`AI 요청 실패: ${response.status} ${text}`);
  }
  const result = await response.json();
  return result.choices[0].message.content;
};

module.exports = { chatGPT };
