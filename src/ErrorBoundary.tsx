// 루트 에러 바운더리: 렌더 예외 1건으로 전체 트리가 언마운트되어 백지가 되는 것을 방지.
// 사진·편집 상태는 메모리에만 있으므로(서버/디스크 잔존 없음) 복구는 새로고침으로 충분하다.
import { Component, type ErrorInfo, type ReactNode } from 'react'

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
          <strong>문제가 발생했어요</strong>
          <p>일시적인 오류로 화면을 표시할 수 없습니다. 처음 화면으로 돌아가 다시 시도해 주세요.</p>
          <button className="cta" onClick={() => window.location.reload()}>
            처음으로 돌아가기
          </button>
        </div>
      </div>
    )
  }
}
