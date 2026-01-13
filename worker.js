// Cloudflare Worker for Claude API Summarization
// このWorkerはOCRテキストを受け取り、Claude APIで要約を生成します

export default {
  async fetch(request, env) {
    // CORSヘッダーを設定
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONSリクエスト（プリフライト）に対応
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // POSTリクエストのみ受け付ける
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // リクエストボディからOCRテキストを取得
      const { text } = await request.json();

      if (!text || text.trim().length === 0) {
        return new Response(JSON.stringify({
          summary: 'テキストが認識できませんでした'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Claude APIに要約リクエストを送信
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: `以下のOCRで認識されたテキストを、1〜2文で簡潔に要約してください。重要な情報（店名、日付、金額、主要な内容）を含めてください。

OCRテキスト:
${text.substring(0, 2000)}

要約（50文字以内）:`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const summary = data.content[0].text.trim();

      return new Response(JSON.stringify({ summary }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({
        error: error.message,
        summary: 'エラーが発生しました'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
