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

// API
const SONG_API = 'http://localhost:3000/songs'

// Tricks
const query = document.querySelector.bind(document)
const queryAll = document.querySelectorAll.bind(document)

// Element
const playerElement = query('.player')
const titleHeaderElement = query('.header h2')
const cdElement = query('.cd')
const cdThumbElement = query('.cd-thumb')
const playButtonElement = query('.btn-toggle-play')
const nextButtonElement = query('.btn-next')
const prevButtonElement = query('.btn-prev')
const progressElement = query('#progress')
const audioElement = query('#audio')

const cdWidth = cdElement.offsetWidth

// Fetch Data
function getData(api, cb) {
  fetch(api)
    .then((response) => response.json())
    .then(cb)
}

getData(SONG_API, begin)

function begin(data) {
  const app = {
    currentId: 0,
    songs: [],
    defineProperties() {
      Object.defineProperty(this, 'currentSong', {
        get() {
          return this.songs[this.currentId]
        },
      })
    },
    renderData() {
      const html = this.songs.map((song) => {
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
    },
    loadCurrentSong() {
      const songsElement = queryAll('.song')
      for (const song of songsElement) {
        if (song.getAttribute('data-index') == this.currentId) {
          song.classList.add('active')
        } else {
          if (song.classList.contains('active')) {
            song.classList.remove('active')
          }
        }
      }
      titleHeaderElement.innerText = this.currentSong['name']
      cdThumbElement.style = `background-image: url('${
        this.songs[this.currentId]['image']
      }');`
      audioElement.src = this.songs[this.currentId]['path']
    },
    handleEvent() {
      // Listen scroll
      document.onscroll = () => {
        const scrollTop = window.scrollY
        const newCdWidth = cdWidth - scrollTop
        cdElement.style.width = newCdWidth > 10 ? `${newCdWidth}px` : 0
        cdElement.style.opacity = newCdWidth / cdWidth
      }
      // CD Thumb
      const cdThumbAnimation = cdThumbElement.animate(
        [{ transform: 'rotate(360deg)' }],
        {
          duration: 10000,
          iterations: Infinity,
        }
      )
      cdThumbAnimation.pause()
      // Listen press keyboard
      document.onkeydown = (e) => {
        if (e.code === 'Space') {
          e.preventDefault()
          this.playingSong(cdThumbAnimation)
        }
      }
      // Listen playing button
      playButtonElement.onclick = () => {
        this.playingSong(cdThumbAnimation)
      }
      // Listen audio to asign value for input[range]
      audioElement.ontimeupdate = () => {
        var progress = Math.floor(
          (audioElement.currentTime / audioElement.duration) * 100
        )
        if (!isNaN(progress)) {
          progressElement.value = progress
        }
      }
      // Listen Input Range to change progress of song
      progressElement.onchange = (e) => {
        const seekTime = (audioElement.duration * e.target.value) / 100
        audioElement.currentTime = seekTime
      }
      // Listen Next Button song
      nextButtonElement.onclick = (e) => {
        this.currentId++
        if (this.currentId >= this.songs.length) {
          this.currentId = 0
        }
        this.loadCurrentSong()
        audioElement.play()
      }
      // Listen
      prevButtonElement.onclick = (e) => {
        this.currentId--
        if (this.currentId < 0) {
          this.currentId = this.songs.length - 1
        }
        this.loadCurrentSong()
        audioElement.play()
      }
    },
    playingSong(cdThumbAnimation) {
      if (audioElement.paused) {
        audioElement.play()
        cdThumbAnimation.play()
        playerElement.classList.add('playing')
      } else {
        audioElement.pause()
        cdThumbAnimation.pause()
        playerElement.classList.remove('playing')
      }
    },
    start() {
      this.songs.push(...data)
      this.defineProperties()
      this.renderData()
      this.loadCurrentSong()
      this.handleEvent()
    },
  }
  app.start()
}
