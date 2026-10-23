/**
 * QA-скрипт: проходит по страницам сайта в headless Edge через CDP
 * и сохраняет скриншоты в .tmp/shots.
 *
 * Запуск: node scripts/qa.mjs [baseUrl]
 * Требует уже запущенный Edge с --remote-debugging-port=9333.
 */
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.argv[2] ?? 'http://127.0.0.1:4173/'
const OUT = path.resolve('.tmp/shots')
const DEBUG_PORT = Number(process.env.CDP_PORT ?? 9333)
fs.mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getBrowserWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)
      if (res.ok) {
        const data = await res.json()
        if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl
      }
    } catch {
      /* браузер ещё поднимается */
    }
    await sleep(500)
  }
  throw new Error('Не удалось подключиться к Edge по CDP')
}

const ws = new WebSocket(await getBrowserWs())
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = reject
})

let nextId = 1
let firstLoad = true
const pending = new Map()
const listeners = []
const consoleErrors = []

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(JSON.stringify(msg.error)))
    else resolve(msg.result)
    return
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(`exception: ${msg.params.exceptionDetails.text}`)
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(
      `console.error: ${msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ')}`,
    )
  }
  for (const l of listeners) l(msg)
}

function send(method, params = {}, sessionId) {
  const id = nextId++
  const payload = { id, method, params }
  if (sessionId) payload.sessionId = sessionId
  ws.send(JSON.stringify(payload))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

function waitEvent(method, sessionId, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting ${method}`)), timeout)
    const listener = (msg) => {
      if (msg.method === method && msg.sessionId === sessionId) {
        clearTimeout(timer)
        listeners.splice(listeners.indexOf(listener), 1)
        resolve(msg.params)
      }
    }
    listeners.push(listener)
  })
}

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const S = sessionId

await send('Page.enable', {}, S)
await send('Runtime.enable', {}, S)
await send('Log.enable', {}, S)
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
}, S)

async function evaluate(expression) {
  const res = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    S,
  )
  if (res.exceptionDetails) {
    throw new Error(`eval failed: ${res.exceptionDetails.text} ${expression.slice(0, 80)}`)
  }
  return res.result?.value
}

async function goto(hash, wait = 900) {
  if (!firstLoad) {
    // смена hash не перезагружает страницу — ждём только рендер роутера
    await evaluate(`location.hash = ${JSON.stringify(hash)}`)
    await sleep(wait)
    return
  }
  firstLoad = false
  const loaded = waitEvent('Page.loadEventFired', S)
  await send('Page.navigate', { url: `${BASE}${hash}` }, S)
  await loaded
  await sleep(wait)
}

async function reload(wait = 900) {
  const loaded = waitEvent('Page.loadEventFired', S)
  await send('Page.reload', {}, S)
  await loaded
  await sleep(wait)
}

async function screenshot(name, fullPage = false) {
  const { data } = await send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: fullPage, fromSurface: true },
    S,
  )
  fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(data, 'base64'))
  console.log(`shot: ${name}.png`)
}

/** Устанавливает залогиненного пользователя и открывает кабинет. */
async function loginAs(userId) {
  await evaluate(`(() => {
    const raw = localStorage.getItem('stupen.state.v1')
    const state = JSON.parse(raw)
    state.currentUserId = ${JSON.stringify(userId)}
    localStorage.setItem('stupen.state.v1', JSON.stringify(state))
  })()`)
  await reload(900)
  await goto('#/dashboard', 1100)
}

const results = []

// 0. Чистое демо-состояние: сбрасываем хранилище, приложение заново засеет данные
await goto('#/')
await evaluate(`localStorage.clear()`)
await reload(900)
await goto('#/', 700)
results.push(['тема', await evaluate('document.documentElement.dataset.theme')])

// 1. Главная
await goto('#/')
await screenshot('01-home')
await screenshot('01-home-full', true)
results.push(['home: карточек кейсов', await evaluate('document.querySelectorAll(".case-card").length')])

// 2. Каталог
await goto('#/cases')
await screenshot('02-cases')
results.push(['cases: карточек', await evaluate('document.querySelectorAll(".case-card").length')])

// 3. Каталог с фильтром «Диплом»
await goto('#/cases?type=diploma')
await screenshot('03-cases-filter')
results.push(['filter diploma: карточек', await evaluate('document.querySelectorAll(".case-card").length')])

// 4. Карточка кейса
await goto('#/cases/c-001')
await screenshot('04-case')
await screenshot('04-case-full', true)

// 5. Компании
await goto('#/companies')
await screenshot('05-companies')
await goto('#/companies/u-datacraft')
await screenshot('05-company')

// 5.1 Страницы «Как это работает» и «О проекте»
await goto('#/how')
await screenshot('05-how')
await goto('#/about')
await screenshot('05-about')

// 6. Вход
await goto('#/login')
await screenshot('06-login')

// 7. Регистрация
await goto('#/register')
await screenshot('07-register')

// 8. Вход по кнопке демо-студента (проверка реального сценария авторизации)
await goto('#/login')
await evaluate(`(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Войти как студент'))
  if (b) b.click()
})()`)
await sleep(1300)
await screenshot('08-dashboard-student')
results.push(['login: кабинет студента', await evaluate(`document.body.innerText.includes('Мои отклики')`)])

// 9. Портфолио
await evaluate(`(() => {
  const t = [...document.querySelectorAll('.tab')].find((el) => el.textContent.includes('Портфолио'))
  if (t) t.click()
})()`)
await sleep(500)
await screenshot('09-portfolio')
results.push(['portfolio: работ', await evaluate('document.querySelectorAll(".portfolio-item").length')])

// 10. Отклик на кейс: модальное окно и отправка
await goto('#/cases/c-013', 900)
await evaluate(`(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Откликнуться'))
  if (b) b.click()
})()`)
await sleep(500)
await evaluate(`(() => {
  const el = document.querySelector('.modal textarea')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
  setter.call(el, 'Пишу на Go, разбираюсь в PostgreSQL и высоконагруженных системах. Готов начать со следующей недели.')
  el.dispatchEvent(new Event('input', { bubbles: true }))
})()`)
await sleep(300)
await screenshot('10-apply-modal')
await evaluate(`(() => {
  const b = [...document.querySelectorAll('.modal button')].find((x) => x.textContent.includes('Отправить отклик'))
  if (b) b.click()
})()`)
await sleep(1000)
await screenshot('11-case-applied')
results.push(['apply: статус отклика', await evaluate(`document.body.innerText.includes('Отклик: Отправлен')`)])

// 11. Работодатель: вход по кнопке демо-работодателя
await evaluate(`(() => {
  const s = JSON.parse(localStorage.getItem('stupen.state.v1'))
  s.currentUserId = null
  localStorage.setItem('stupen.state.v1', JSON.stringify(s))
})()`)
await reload(700)
await goto('#/login', 800)
await evaluate(`(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Войти как работодатель'))
  if (b) b.click()
})()`)
await sleep(1300)
await screenshot('12-dashboard-employer')

// 12. Отклики работодателя
await evaluate(`(() => {
  const t = [...document.querySelectorAll('.tab')].find((el) => el.textContent.includes('Отклики'))
  if (t) t.click()
})()`)
await sleep(500)
await screenshot('13-employer-apps')

// 13. Форма нового кейса
await goto('#/case/new')
await screenshot('14-case-new')

// 14. Мобильная версия
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
}, S)
await goto('#/')
await screenshot('15-mobile-home')
await goto('#/cases')
await screenshot('15-mobile-cases')
await goto('#/dashboard')
await screenshot('15-mobile-dashboard')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
}, S)

// 15. Тёмная тема
await goto('#/')
await evaluate(`(() => {
  const s = JSON.parse(localStorage.getItem('stupen.state.v1'))
  s.currentUserId = null
  localStorage.setItem('stupen.state.v1', JSON.stringify(s))
})()`)
await reload(700)
await goto('#/', 700)
await evaluate(`(() => {
  const btn = document.querySelector('.header .icon-btn')
  if (btn) btn.click()
})()`)
await sleep(700)
await screenshot('16-dark-home')

console.log('\n--- проверки ---')
for (const [name, value] of results) console.log(`${name}: ${value}`)

const stored = await evaluate(`(() => {
  const s = JSON.parse(localStorage.getItem('stupen.state.v1'))
  return { users: s.users.length, cases: s.cases.length, apps: s.applications.length, current: s.currentUserId }
})()`)
console.log('state:', JSON.stringify(stored))

if (consoleErrors.length) {
  console.log('\n--- ошибки в консоли ---')
  for (const e of consoleErrors) console.log(e)
} else {
  console.log('\nОшибок в консоли нет')
}

await send('Target.closeTarget', { targetId })
ws.close()
