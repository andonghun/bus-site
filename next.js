(function () {
  var box = document.querySelector('[data-next]')
  var cells = document.querySelectorAll('.grid-min[data-dep]')
  if (!box || !cells.length) return
  var en = document.documentElement.lang === 'en'

  function kstMinutes() {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
    var hm = parts.split(':')
    return Number(hm[0]) % 24 * 60 + Number(hm[1])
  }

  function toMinutes(hm) {
    var p = hm.split(':')
    return Number(p[0]) * 60 + Number(p[1])
  }

  // 셀은 운행일 순서다. data-min은 운행일 기준 분이라 자정 넘어 떠나는 전날 밤 편은 1440 이상이다.
  function minOf(cell) {
    var m = cell.getAttribute('data-min')
    return m === null ? toMinutes(cell.getAttribute('data-dep')) : Number(m)
  }

  function firstFrom(t) {
    for (var i = 0; i < cells.length; i++) if (minOf(cells[i]) >= t) return cells[i]
    return null
  }

  function gap(min) {
    if (min < 60) return en ? min + ' min' : min + '분'
    var h = Math.floor(min / 60), m = min % 60
    return en ? h + 'h ' + m + 'm' : h + '시간 ' + m + '분'
  }

  // 첫차 전 새벽이면 아직 남은 전날 밤 편(24시 뒤)부터 찾고, 없으면 오늘 첫차부터 찾는다.
  var now = kstMinutes()
  var base = now
  var next = null
  if (now < minOf(cells[0])) {
    next = firstFrom(now + 1440)
    if (next) base = now + 1440
  }
  if (!next) next = firstFrom(now)
  if (next) {
    next.classList.add('is-next')
    var dep = next.getAttribute('data-dep')
    var grade = next.getAttribute('data-grade') || ''
    var wait = minOf(next) - base
    box.textContent = en
      ? 'Next bus ' + dep + ' (' + gap(wait) + ' from now, ' + grade + ')'
      : '다음 버스 ' + dep + ' · ' + gap(wait) + ' 뒤 · ' + grade
  } else {
    var first = cells[0].getAttribute('data-dep')
    box.textContent = en ? 'No more buses today. First bus tomorrow ' + first : '오늘 남은 버스 없음 · 내일 첫차 ' + first
  }
  box.hidden = false
})()
