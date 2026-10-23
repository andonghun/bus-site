(function () {
  var form = document.getElementById('search')
  if (!form) return
  var fromCity = document.getElementById('from-city')
  var fromTerminal = document.getElementById('from-terminal')
  var toCity = document.getElementById('to-city')
  var toTerminal = document.getElementById('to-terminal')
  var button = form.querySelector('button')
  var hint = document.getElementById('search-hint')
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

  function load() {
    return fetch('/api/terminals.json').then(function (r) { return r.json() }).then(function (json) {
      data = json
      fill(fromCity, '도시 선택', cities(data.terminals))
    }).catch(function () {
      hint.textContent = '터미널 목록을 불러오지 못했습니다. 아래 지역별 터미널 목록에서 골라 주세요.'
      fromCity.disabled = true
    })
  }

  fromCity.addEventListener('change', function () {
    if (!data) return
    fill(fromTerminal, '터미널', terminalsIn(data.terminals, fromCity.value))
    fill(toCity, '도시 선택', [])
    fill(toTerminal, '터미널', [])
    button.disabled = true
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

  load()
})()
