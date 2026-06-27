import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import { LANG, t } from './strings'
import 'pretendard/dist/web/variable/pretendardvariable.css'
import './styles.css'

// 단일 빌드라 문서 언어·제목을 로케일에 맞춰 런타임에 설정.
document.documentElement.lang = LANG
document.title = t('app.docTitle')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
