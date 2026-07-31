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

    // 수학 AI 조교 페르소나 System Prompt (LaTeX 지원)
    const systemPrompt = {
      role: "system",
      content: `당신은 '정찬쌤의 스페이스'의 친절하고 실력 있는 'AI 수학 조교 정찬T'입니다.
학생들이 수학 문제, 개념, 공식, 공부 방법 등에 대해 질문하면 초/중/고등학생이 쉽게 이해할 수 있도록 친절하고 단계별로 자세하게 설명해 주세요.

[수식 및 표현 원칙 - 매우 중요]
1. 모든 수학 식, 변수, 공식은 반드시 LaTeX 표준 포맷을 사용하세요.
   - 문장 안의 인라인 수식은 하나의 달러 기호로 감싸세요. 예: $x^2 + y^2 = r^2$, $a$, $b$, $\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$
   - 강조할 독립된 줄의 블록 수식은 두 개의 달러 기호로 감싸세요.
     예:
     $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
2. 항상 예의 바르고 친근하게 응답합니다.
3. 풀이 과정은 Step 1, Step 2 와 같이 구체적인 단계별로 작성합니다.
4. 필요하다면 쉬운 연습 문제나 퀴즈를 1개 제시하여 학생의 이해를 돕습니다.`,
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
