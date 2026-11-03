// 공공데이터 서버 호출 캐시 (공공데이터포털 하루 호출 한도를 아끼려고)
//  - 같은 요청이 동시에 오면 한 번만 보낸다(중복 호출 방지)
//  - 유효 시간(ttl) 안에는 저장해 둔 값을 그대로 준다
//  - 원본이 실패하면(한도 초과 등) 예전에 받아 둔 값이 있으면 그걸 대신 주고, 없으면 잠깐 동안은 다시 묻지 않고 같은 오류를 준다
// 서버 인스턴스가 살아 있는 동안만 기억한다. (Vercel CDN 캐시와는 별개로 한 겹 더 막아 주는 용도)
const store = new Map() // key -> { value, exp, at, err, errExp, pending }
const FAIL_MS = 30_000

export function memo(key, ttlMs, load) {
  const now = Date.now()
  const hit = store.get(key)
  if (hit?.value !== undefined && hit.exp > now) return Promise.resolve(hit.value)
  if (hit?.pending) return hit.pending
  if (hit?.err && hit.errExp > now && hit.value === undefined) return Promise.reject(hit.err)

  const pending = load().then(
    (value) => { store.set(key, { value, exp: Date.now() + ttlMs, at: Date.now() }); return value },
    (err) => {
      const old = store.get(key)
      if (old?.value !== undefined) { store.set(key, { ...old, pending: undefined, exp: Date.now() + FAIL_MS }); return old.value } // 예전 값으로 버틴다
      store.set(key, { err, errExp: Date.now() + FAIL_MS })
      throw err
    },
  )
  store.set(key, { ...(hit ?? {}), pending })
  return pending
}

export const cacheSize = () => store.size
