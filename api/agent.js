import Anthropic from '@anthropic-ai/sdk'
import { searchTour } from '../server/tour.js'
import { getWeather } from '../server/weather.js'
import { getVisitors } from '../server/visitors.js'
import { dummyReply } from '../server/dummyChat.js'
import { GODS, godById } from '../src/data/gods.js'

const CLAUDE_MODEL = 'claude-sonnet-5-5'
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'
const MAX_TURNS = 5

// ① 도구 설명서: AI 는 이 설명만 보고 "어떤 도구를 언제 쓸지" 스스로 정한다 (Claude·Gemini 공통)
const TOOLS = [
  {
    name: 'get_weather',
    description: '기상청 단기예보로 제주시/서귀포시의 앞으로 몇 시간 기온·하늘·강수·바람을 조회한다. 날씨나 오늘의 분위기를 말할 때 쓴다.',
    parameters: {
      type: 'object',
      properties: { place: { type: 'string', enum: ['제주시', '서귀포시'] } },
      required: ['place'],
    },
  },
  {
    name: 'search_places',
    description: '한국관광공사 TourAPI 로 제주의 장소(관광지·문화시설 등)를 이름으로 검색한다. 신과 이어지는 곳을 안내할 때 쓴다.',
    parameters: {
      type: 'object',
      properties: { keyword: { type: 'string', description: '장소 이름 (예: 삼성혈, 한라산, 해녀박물관)' } },
      required: ['keyword'],
    },
  },
  {
    name: 'get_visitors',
    description: '서귀포시 직영관광지 6곳(감귤박물관, 산방산·용머리, 정방폭포, 중문대포 주상절리대, 천제연폭포, 천지연폭포)의 월별 관람객 수를 조회한다. 어디가 붐비는지, 어느 달에 사람이 많은지 말할 때 쓴다.',
    parameters: {
      type: 'object',
      properties: { month: { type: 'integer', description: '보고 싶은 달(1~12). 비우면 가장 최근 달' } },
    },
  },
  {
    name: 'get_god',
    description: '제주 신화 속 신의 소개(역할·본풀이·이야기)를 조회한다. 다른 신에 대해 말하거나 이야기의 사실을 확인할 때 쓴다.',
    parameters: {
      type: 'object',
      properties: { name: { type: 'string', description: `신 이름. 가능한 값: ${GODS.map((g) => g.name).join(', ')}` } },
      required: ['name'],
    },
  },
]

// ② 도구 이름 → 실제로 실행할 함수
const runTool = {
  get_weather: ({ place }) => getWeather({ place }),
  search_places: async ({ keyword }) => ({ items: (await searchTour({ keyword })).slice(0, 5) }),
  get_visitors: async ({ month } = {}) => {
    const { months } = await getVisitors()
    const picked = month ? months.filter((m) => m.month === Number(month)).slice(-1)[0] : months[months.length - 1]
    if (!picked) return { error: `${month}월 자료가 없어요` }
    return { year: picked.year, month: picked.month, visitors: picked.sites }
  },
  get_god: async ({ name }) => {
    const g = GODS.find((x) => x.name.includes(name) || name.includes(x.name))
    if (!g) return { error: `없는 신이에요. 가능한 값: ${GODS.map((x) => x.name).join(', ')}` }
    return { name: g.name, role: g.role, tale: g.tale, text: g.text }
  },
}

// 도구를 실행하고, 화면에 보여줄 기록(steps)에도 남긴다
async function execTool(name, input, steps) {
  try {
    const output = await runTool[name](input ?? {})
    steps.push({ tool: name, input, ok: true })
    return { output, isError: false }
  } catch (e) {
    steps.push({ tool: name, input, ok: false })
    return { output: { error: e.message }, isError: true }
  }
}

function systemPrompt(god) {
  return `너는 제주 신화 속 "${god.name}"(${god.role})이다. 이 신의 말투로 사용자와 대화한다.
- 네 이야기(${god.tale}): ${god.text}
- 날씨, 장소, 다른 신의 이야기는 지어내지 말고 반드시 도구로 확인한 뒤 말한다.
- 도구 결과에 없는 장소는 말하지 않는다. 비가 오거나 바람이 센 날에는 그에 맞는 조언을 곁들인다.
- 신의 위엄은 있되 따뜻하고 쉬운 한국어로, 5문장 이내로 짧게 답한다.
- 마크다운(별표, 샵, 목록 기호)은 쓰지 않고 평범한 문장으로만 쓴다.
- 확실하지 않은 전승은 "전해지기로는"이라고 표현한다.`
}

// ③-A 에이전트 루프 (Claude): 생각 → 도구 호출 → 결과 확인 → (반복) → 최종 답
async function runClaude({ god, message, history, steps }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const tools = TOOLS.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters }))
  const messages = [...history.slice(-10), { role: 'user', content: message }] // 최근 10개만 보내 비용 절약

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const r = await client.messages.create({ model: CLAUDE_MODEL, max_tokens: 1024, system: systemPrompt(god), tools, messages })
    messages.push({ role: 'assistant', content: r.content })
    if (r.stop_reason !== 'tool_use') return r.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n')

    const results = []
    for (const block of r.content.filter((b) => b.type === 'tool_use')) {
      const { output, isError } = await execTool(block.name, block.input, steps)
      results.push({ type: 'tool_result', tool_use_id: block.id, is_error: isError, content: JSON.stringify(output).slice(0, 4000) })
    }
    messages.push({ role: 'user', content: results })
  }
  return null
}

// ③-B 에이전트 루프 (Gemini): 임시용. Claude 키가 없을 때 GEMINI_API_KEY 로 같은 일을 한다
async function runGemini({ god, message, history, steps }) {
  const contents = [
    ...history.slice(-10).map((h) => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
    { role: 'user', parts: [{ text: message }] },
  ]
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(god) }] },
        tools: [{ functionDeclarations: TOOLS }],
        contents,
      }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`Gemini 오류 (${r.status}) ${data.error?.message ?? ''} [model: ${GEMINI_MODEL}]`)

    const parts = data.candidates?.[0]?.content?.parts ?? []
    contents.push({ role: 'model', parts })
    const calls = parts.filter((p) => p.functionCall)
    if (!calls.length) return parts.filter((p) => p.text).map((p) => p.text).join('\n')

    const responses = []
    for (const { functionCall: fc } of calls) {
      const { output } = await execTool(fc.name, fc.args, steps)
      responses.push({ functionResponse: { name: fc.name, response: { result: output } } })
    }
    contents.push({ role: 'user', parts: responses })
  }
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const { message, history = [], godId = 'seolmundae' } = req.body ?? {}
  if (!message?.trim()) return res.status(400).json({ error: 'message 가 필요해요' })

  const god = godById(godId) ?? godById('seolmundae')
  const steps = [] // 화면에 "에이전트가 무엇을 했는지" 보여주기용

  // AI 를 쓸 수 없으면(키 없음·한도 초과·연결 오류) API 연동 없는 "데모 채팅"으로 대신 답한다.
  // 응답에 provider: 'demo' 와 이유를 실어서, 화면이 데모 응답임을 분명히 표시한다.
  const demo = (reason) => res.status(200).json({ answer: dummyReply({ god, message }), steps: [], provider: 'demo', demoReason: reason })

  const useClaude = Boolean(process.env.ANTHROPIC_API_KEY)
  if (process.env.AI_DEMO === '1') return demo('데모 모드로 실행 중이에요')
  if (!useClaude && !process.env.GEMINI_API_KEY) return demo('AI 키가 설정되지 않았어요')

  try {
    const answer = await (useClaude ? runClaude : runGemini)({ god, message, history, steps })
    res.status(200).json({ answer: answer ?? '이야기가 길어졌어요. 한 번만 더 물어봐 주세요.', steps, provider: useClaude ? 'claude' : 'gemini' })
  } catch (e) {
    console.error('agent error:', e.message)
    const msg = String(e.message)
    demo(/429|quota|rate/i.test(msg) ? 'AI 사용 한도를 넘었어요' : /401|403|api key/i.test(msg) ? 'AI 키가 올바르지 않아요' : 'AI 연결에 문제가 있어요')
  }
}
