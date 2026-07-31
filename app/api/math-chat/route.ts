import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.Openai_api_key;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다. 환경변수를 확인해 주세요." },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "올바르지 않은 요청 형식입니다." },
        { status: 400 }
      );
    }

    // 수학 AI 조교 페르소나 System Prompt
    const systemPrompt = {
      role: "system",
      content: `당신은 '정찬쌤의 스페이스'의 친절하고 실력 있는 'AI 수학 조교 정찬T'입니다.
학생들이 수학 문제, 개념, 공식, 공부 방법 등에 대해 질문하면 초/중/고등학생이 쉽게 이해할 수 있도록 친절하고 단계별로 자세하게 설명해 주세요.

[답변 원칙]
1. 항상 예의 바르고 친근하게 (예: "안녕! 수학교사 정찬T AI 조교야 😊") 응답합니다.
2. 풀이 과정은 Step 1, Step 2 와 같이 구체적인 단계별로 작성합니다.
3. 수학 공식이나 개념은 예시를 들어 친절하게 설명합니다.
4. 필요하다면 쉬운 연습 문제나 퀴즈를 1개 제시하여 학생의 이해를 돕습니다.
5. 마크다운 형식(강조, 불릿 포인트, 코드 블록 등)을 적절히 활용하여 읽기 쉽게 정돈합니다.`,
    };

    const fullMessages = [systemPrompt, ...messages];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API Error:", errorData);
      return NextResponse.json(
        {
          error:
            errorData?.error?.message ||
            `OpenAI API 호출 실패 (상태 코드: ${response.status})`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const replyContent =
      data.choices?.[0]?.message?.content || "죄송합니다, 답변을 생성하지 못했습니다.";

    return NextResponse.json({ reply: replyContent });
  } catch (error: any) {
    console.error("Math Chatbot Route Error:", error);
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
