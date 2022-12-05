/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / Pause / Seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Actice song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const SONG_API = 'http://localhost:3000/songs'
const query = document.querySelector.bind(document)
const queryAll = document.querySelectorAll.bind(document)

function start() {
  getData(SONG_API, renderData)
  handleEvent()
}

start()

function handleEvent() {
  const playerElement = query('.player')
  const audio = query('#audio')
  const playButtonElement = query('.btn-toggle-play')
  const progressElement = query('#progress')
  const cd = query('.cd')
  const cdThumb = query('.cd-thumb')
  const cdWidth = cd.offsetWidth

  // listen scroll
  document.onscroll = () => {
    const scrollTop = window.scrollY
    const newCdWidth = cdWidth - scrollTop
    cd.style.width = newCdWidth > 10 ? `${newCdWidth}px` : 0
    cd.style.opacity = newCdWidth / cdWidth
  }

  // cd Thumb
  const cdThumbAnimation = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
    duration: 10000,
    iterations: Infinity,
  })
  cdThumbAnimation.pause()

  // listen playing keyboard
  document.onkeydown = (e) => {
    if (e.code === 'Space') {
      e.preventDefault()
      playingSong(audio, playerElement, cdThumbAnimation)
    }
  }

  // listen playing button
  playButtonElement.onclick = () => {
    playingSong(audio, playerElement, cdThumbAnimation)
  }

  // listen audio
  audio.ontimeupdate = () => {
    var progress = Math.floor((audio.currentTime / audio.duration) * 100)
    if (!isNaN(progress)) {
      progressElement.value = progress
    }
  }

  // listen progress
  progressElement.onchange = (e) => {
    const seekTime = (audio.duration * e.target.value) / 100
    audio.currentTime = seekTime
  }
}

function getData(api, cb) {
  fetch(api)
    .then((response) => response.json())
    .then(cb)
}

function renderData(data) {
  let currentIndex = 0
  let html = data.map((song) => {
    return `
    <div class="song" data-index="${song['id']}">
      <div class="thumb"
           style="background-image: url('${song['image']}');">
      </div>
      <div class="body">
        <h3 class="title">${song['name']}</h3>
        <p class="author">${song['singer']}</p>
      </div>
      <div class="option">
        <i class="fas fa-ellipsis-h"></i>
      </div>
    </div>`
  })
  query('.playlist').innerHTML = html.join('')

  loadCurrentSong(data, currentIndex)
}

function loadCurrentSong(songs, id) {
  const audio = query('#audio')
  // add active
  query('.song').classList.add('active')
  // add title
  query('.header h2').innerText = songs[id]['name']
  // add image for cd
  query('.cd-thumb').style = `background-image: url('${songs[id]['image']}');`
  // add src to audio
  audio.src = songs[id]['path']
}

function playingSong(audio, player, cdThumb) {
  if (audio.paused) {
    audio.play()
    cdThumb.play()
  } else {
    audio.pause()
    cdThumb.pause()
  }
  // button
  player.classList.toggle('playing')
}
