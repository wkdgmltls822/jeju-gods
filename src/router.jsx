import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Myths from './pages/Myths'
import Agent from './pages/Agent'
import My from './pages/My'
import NotFound from './pages/NotFound'

// 페이지를 추가할 때: ① pages/ 에 파일 만들기 ② NAV_ITEMS 한 줄 ③ routes 한 줄
// 아이콘 이름: https://icons.getbootstrap.com
export const NAV_ITEMS = [
  { to: '/', label: '홈', icon: 'house' },
  { to: '/myths', label: '별자리', icon: 'stars' },
  { to: '/agent', label: '신과 대화', icon: 'chat-quote' },
  { to: '/my', label: '내 신 기록', icon: 'bookmark-star' },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'myths', element: <Myths /> },
      { path: 'agent', element: <Agent /> },
      { path: 'my', element: <My /> },
    ],
  },
])
