(function () {
  var dark = matchMedia('(prefers-color-scheme: dark)').matches
  try { var t = localStorage.getItem('theme'); if (t) dark = t === 'dark' } catch (e) {}
  document.documentElement.classList.toggle('dark', dark)
})()
