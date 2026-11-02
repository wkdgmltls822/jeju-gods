import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchWeather, askAgent } from '../api/client'
import { supabase } from '../lib/supabase'

// 앱 전체가 함께 쓰는 상태. 여러 페이지가 같이 쓰는 데이터만 여기에 둡니다.
// 사용법: const weather = useAppStore((s) => s.weather)
export const useAppStore = create(
  persist(
    (set, get) => ({
      // 닉네임: 로그인 없이 "누구의 기록인지" 구분하는 이름 (localStorage 에 저장)
      nickname: '',
      setNickname: (nickname) => set({ nickname: nickname.trim(), favorites: [], logs: [] }),
      who: () => get().nickname || '익명',

      // 오늘 제주 날씨 (홈 배지와 "오늘의 신"이 함께 씀)
      weather: null,          // 지금 시각 예보 한 줄
      weatherError: '',
      loadWeather: async () => {
        if (get().weather) return
        try {
          const d = await fetchWeather('제주시')
          set({ weather: d.hours[0], weatherError: '' })
        } catch (e) {
          set({ weatherError: e.message })
        }
      },

      // 즐겨찾기 신 — Supabase favorite_gods 테이블과 동기화
      favorites: [],            // god_id 문자열 목록
      dbError: '',
      loadFavorites: async () => {
        if (!supabase) return set({ dbError: 'Supabase 설정(.env.local)이 필요해요' })
        const { data, error } = await supabase
          .from('favorite_gods').select('god_id').eq('nickname', get().who()).order('created_at', { ascending: false })
        if (error) return set({ dbError: error.message })
        set({ favorites: data.map((r) => r.god_id), dbError: '' })
      },
      toggleFavorite: async (godId) => {
        if (!supabase) return set({ dbError: 'Supabase 설정(.env.local)이 필요해요' })
        const nickname = get().who()
        const has = get().favorites.includes(godId)
        const { error } = has
          ? await supabase.from('favorite_gods').delete().eq('nickname', nickname).eq('god_id', godId)
          : await supabase.from('favorite_gods').insert({ nickname, god_id: godId })
        if (error) return set({ dbError: error.message })
        set({ favorites: has ? get().favorites.filter((id) => id !== godId) : [godId, ...get().favorites], dbError: '' })
      },

      // 대화 기록 — Supabase chat_logs 테이블
      logs: [],                 // { id, god_id, role, text, created_at }
      loadLogs: async () => {
        if (!supabase) return set({ dbError: 'Supabase 설정(.env.local)이 필요해요' })
        const { data, error } = await supabase
          .from('chat_logs').select('*').eq('nickname', get().who()).order('created_at', { ascending: false }).limit(60)
        if (error) return set({ dbError: error.message })
        set({ logs: data, dbError: '' })
      },
      saveChat: async (godId, rows) => { // rows: [{ role, text }]
        if (!supabase) return
        const nickname = get().who()
        const { error } = await supabase.from('chat_logs').insert(rows.map((r) => ({ nickname, god_id: godId, ...r })))
        if (error) set({ dbError: error.message })
      },

      // 신과의 대화 — 페이지를 옮겨도 대화가 남도록 store 에 둡니다
      chatGodId: 'seolmundae',
      setChatGod: (id) => set({ chatGodId: id, messages: [] }), // 신을 바꾸면 새 대화
      messages: [],          // { role: 'user' | 'assistant', text, steps }
      chatLoading: false,
      chatError: '',
      sendMessage: async (text) => {
        const history = get().messages.map((m) => ({ role: m.role, content: m.text }))
        const godId = get().chatGodId
        set({ messages: [...get().messages, { role: 'user', text }], chatLoading: true, chatError: '' })
        try {
          const { answer, steps, provider, demoReason } = await askAgent(text, history, godId)
          const demo = provider === 'demo' // API 연동 없는 데모 응답인지
          set({ messages: [...get().messages, { role: 'assistant', text: answer, steps, demo, demoReason }] })
          get().saveChat(godId, [{ role: 'user', text }, { role: 'assistant', text: answer }]) // 기다리지 않고 저장
        } catch (e) {
          set({ chatError: e.message })
        } finally {
          set({ chatLoading: false })
        }
      },
    }),
    { name: 'tamra-store', partialize: (s) => ({ nickname: s.nickname }) }, // 닉네임만 저장
  ),
)
