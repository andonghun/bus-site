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

  function gap(min) {
    if (min < 60) return en ? min + ' min' : min + '분'
    var h = Math.floor(min / 60), m = min % 60
    return en ? h + 'h ' + m + 'm' : h + '시간 ' + m + '분'
  }

  var now = kstMinutes()
  var next = null
  for (var i = 0; i < cells.length; i++) {
    if (toMinutes(cells[i].getAttribute('data-dep')) >= now) { next = cells[i]; break }
  }
  if (next) {
    next.classList.add('is-next')
    var dep = next.getAttribute('data-dep')
    var grade = next.getAttribute('data-grade') || ''
    box.textContent = en
      ? 'Next bus ' + dep + ' (' + gap(toMinutes(dep) - now) + ' from now, ' + grade + ')'
      : '다음 버스 ' + dep + ' · ' + gap(toMinutes(dep) - now) + ' 뒤 · ' + grade
  } else {
    var first = cells[0].getAttribute('data-dep')
    box.textContent = en ? 'No more buses today. First bus tomorrow ' + first : '오늘 남은 버스 없음 · 내일 첫차 ' + first
  }
  box.hidden = false
})()
