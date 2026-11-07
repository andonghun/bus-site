(function () {
  var form = document.getElementById('search')
  if (!form) return
  var fromCity = document.getElementById('from-city')
  var fromTerminal = document.getElementById('from-terminal')
  var toCity = document.getElementById('to-city')
  var toTerminal = document.getElementById('to-terminal')
  var button = form.querySelector('button[type="submit"]')
  var hint = document.getElementById('search-hint')
  var firstHint = hint.textContent
  var seg = form.querySelector('[data-seg]')
  var kinds = form.querySelectorAll('input[name="kind"]')
  var data = null

  function option(value, label) {
    var o = document.createElement('option')
    o.value = value
    o.textContent = label
    return o
  }

  function fill(select, placeholder, items) {
    select.innerHTML = ''
    select.appendChild(option('', placeholder))
    items.forEach(function (it) { select.appendChild(option(it.value, it.label)) })
    select.disabled = items.length === 0
  }

  function cities(list) {
    var seen = {}
    return list.filter(function (t) { return seen[t.city] ? false : (seen[t.city] = true) })
      .map(function (t) { return { value: t.city, label: t.city } })
      .sort(function (a, b) { return a.label.localeCompare(b.label, 'ko') })
  }

  function terminalsIn(list, city) {
    return list.filter(function (t) { return t.city === city }).map(function (t) { return { value: t.id, label: t.name } })
  }

  function kind() {
    for (var i = 0; i < kinds.length; i++) if (kinds[i].checked) return kinds[i].value
    return ''
  }

  // 출발 노선이 있고 고른 종류(고속·시외)인 터미널만. 터미널 id가 'express:…', 'intercity:…' 꼴이다.
  function pool() {
    var k = kind()
    return data.terminals.filter(function (t) { return data.routes[t.id] && (!k || t.id.indexOf(k + ':') === 0) })
  }

  function clearAfterFrom() {
    fill(toCity, '도시 선택', [])
    fill(toTerminal, '터미널', [])
    button.disabled = true
  }

  // 흰 표시가 고른 탭 아래로 미끄러진다. 처음 한 번은 움직임 없이 자리만 잡는다.
  function placeIndicator(animate) {
    var ind = seg && seg.querySelector('.seg-indicator')
    var on = seg && seg.querySelector('input:checked')
    if (!ind || !on) return
    var label = on.parentNode
    if (!animate) ind.style.transition = 'none'
    ind.style.width = label.offsetWidth + 'px'
    ind.style.transform = 'translateX(' + label.offsetLeft + 'px)'
    if (!animate) { void ind.offsetWidth; ind.style.transition = '' }
    seg.classList.add('is-ready')
  }

  function load() {
    return fetch('/api/terminals.json').then(function (r) { return r.json() }).then(function (json) {
      data = json
      fill(fromCity, '도시 선택', cities(pool()))
    }).catch(function () {
      hint.textContent = '터미널 목록을 불러오지 못했습니다. 아래 지역별 터미널 목록에서 골라 주세요.'
      fromCity.disabled = true
    })
  }

  Array.prototype.forEach.call(kinds, function (input) {
    input.addEventListener('change', function () {
      placeIndicator(true)
      if (!data) return
      fill(fromCity, '도시 선택', cities(pool()))
      fill(fromTerminal, '터미널', [])
      clearAfterFrom()
      hint.textContent = firstHint
    })
  })

  fromCity.addEventListener('change', function () {
    if (!data) return
    fill(fromTerminal, '터미널', terminalsIn(pool(), fromCity.value))
    clearAfterFrom()
  })

  fromTerminal.addEventListener('change', function () {
    if (!data) return
    var dests = data.routes[fromTerminal.value] || []
    var byId = {}
    data.terminals.forEach(function (t) { byId[t.id] = t })
    var list = dests.map(function (id) { return byId[id] }).filter(Boolean)
    fill(toCity, '도시 선택', cities(list))
    fill(toTerminal, '터미널', [])
    button.disabled = true
    hint.textContent = list.length ? '갈 수 있는 도시 ' + cities(list).length + '곳' : '이 터미널의 노선 정보가 아직 없습니다.'
  })

  toCity.addEventListener('change', function () {
    if (!data) return
    var dests = data.routes[fromTerminal.value] || []
    var byId = {}
    data.terminals.forEach(function (t) { byId[t.id] = t })
    var list = dests.map(function (id) { return byId[id] }).filter(function (t) { return t && t.city === toCity.value })
    fill(toTerminal, '터미널', list.map(function (t) { return { value: t.id, label: t.name } }))
    if (list.length === 1) { toTerminal.value = list[0].id }
    button.disabled = !toTerminal.value
  })

  toTerminal.addEventListener('change', function () { button.disabled = !toTerminal.value })

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (!data) return
    var path = data.paths[fromTerminal.value + '>' + toTerminal.value]
    if (path) window.location.href = path
  })

  placeIndicator(false)
  // 탭 묶음의 폭이 바뀌면(화면 회전, 글꼴 로드) 표시를 다시 맞춘다.
  if (seg && 'ResizeObserver' in window) new ResizeObserver(function () { placeIndicator(false) }).observe(seg)
  else window.addEventListener('resize', function () { placeIndicator(false) })
  load()
})()
