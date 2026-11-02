import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 개발 중에 /api/* 를 api/ 폴더의 서버 함수로 연결합니다 (Vercel 에서는 같은 파일이 그대로 서버 함수가 됨)
function apiDev(env) {
  return {
    name: 'api-dev',
    configureServer(server) {
      Object.assign(process.env, env) // .env.local 의 비밀 키를 서버 함수에서 읽게 함
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next()
        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.slice('/api/'.length)
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`)
          req.query = Object.fromEntries(url.searchParams)
          if (req.method === 'POST') { // Vercel 처럼 JSON 본문을 req.body 로 읽어 줌
            let raw = ''
            for await (const chunk of req) raw += chunk
            req.body = raw ? JSON.parse(raw) : {}
          }
          res.status = (code) => { res.statusCode = code; return res }
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(data))
          }
          await mod.default(req, res)
        } catch (e) {
          res.statusCode = e.code === 'ERR_LOAD_URL' ? 404 : 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), apiDev(loadEnv(mode, process.cwd(), ''))],
}))
