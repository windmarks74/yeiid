// 배경 제거 모델/런타임을 public/imgly 로 내려받아 로컬(같은 출처)에서 서빙한다.
// 완전 오프라인 동작 + 프로덕션 배포 가능. 한 번만 실행하면 된다.
//   node scripts/fetch-model.mjs
import { mkdir, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const VERSION = '1.7.0'
const BASE = `https://staticimgly.com/@imgly/background-removal-data/${VERSION}/dist/`
const OUT = new URL('../public/imgly/', import.meta.url)

// 오프라인에서 쓸 리소스 (빠름 fp16 + 고품질 isnet + onnxruntime 변형들)
const WANT = [
  '/models/isnet_fp16',
  '/models/isnet',
  '/onnxruntime-web/ort-wasm-simd-threaded.wasm',
  '/onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm',
  '/onnxruntime-web/ort-wasm-simd-threaded.mjs',
  '/onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs',
]

await mkdir(OUT, { recursive: true })

console.log('resources.json 다운로드…')
const resources = await (await fetch(BASE + 'resources.json')).json()
await writeFile(new URL('resources.json', OUT), JSON.stringify(resources))

// 받아야 할 청크 해시 수집 (중복 제거)
const hashes = new Set()
for (const key of WANT) {
  if (!resources[key]) throw new Error(`resources.json에 ${key} 없음`)
  for (const c of resources[key].chunks) hashes.add(c.name)
}

// 이미 받은 파일은 건너뜀 (재실행 안전)
const existing = existsSync(OUT) ? new Set(await readdir(OUT)) : new Set()
const todo = [...hashes].filter((h) => !existing.has(h))
console.log(`청크 ${hashes.size}개 중 ${todo.length}개 다운로드 필요`)

let done = 0
let bytes = 0
for (const h of todo) {
  const buf = Buffer.from(await (await fetch(BASE + h)).arrayBuffer())
  await writeFile(new URL(h, OUT), buf)
  done++
  bytes += buf.length
  process.stdout.write(`\r  ${done}/${todo.length}  (${(bytes / 1e6).toFixed(0)}MB)   `)
}
console.log('\n완료:', OUT.pathname)
