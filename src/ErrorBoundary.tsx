// 루트 에러 바운더리: 렌더 예외 1건으로 전체 트리가 언마운트되어 백지가 되는 것을 방지.
// 사진·편집 상태는 메모리에만 있으므로(서버/디스크 잔존 없음) 복구는 새로고침으로 충분하다.
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { t } from './strings'

type Props = { children: ReactNode }
type State = { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[렌더 오류]', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="app">
        <div className="panel error-fallback">
          <strong>{t('error.title')}</strong>
          <p>{t('error.body')}</p>
          <button className="cta" onClick={() => window.location.reload()}>
            {t('error.back')}
          </button>
        </div>
      </div>
    )
  }
}
