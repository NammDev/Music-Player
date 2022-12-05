/**
 * 11. Hạn chế lặp lại danh sách
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
const repeatBtnElement = query('.btn-repeat')
const playButtonElement = query('.btn-toggle-play')
const nextButtonElement = query('.btn-next')
const prevButtonElement = query('.btn-prev')
const randomButtonElement = query('.btn-random')
const progressElement = query('#progress')
const audioElement = query('#audio')
const playlistElement = query('.playlist')
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
    isRandom: false,
    isRepeat: false,
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
      const songs = queryAll('.song')
      for (const song of songs) {
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
        this.playNextSong(true)
      }
      // Listen Prev Button Song
      prevButtonElement.onclick = (e) => {
        this.playNextSong(false)
      }
      // Feature Random
      randomButtonElement.onclick = (e) => {
        this.isRandom = !this.isRandom
        randomButtonElement.classList.toggle('active', this.isRandom)
      }
      // Feature Repeat Song
      repeatBtnElement.onclick = (e) => {
        this.isRepeat = !this.isRepeat
        repeatBtnElement.classList.toggle('active', this.isRepeat)
      }
      // Handle when song end
      audioElement.onended = () => {
        if (!this.isRepeat) {
          this.playNextSong(true)
        } else {
          this.loadCurrentSong()
          audioElement.play()
          this.scrollToView()
        }
      }
      // Listen click on Song Element
      playlistElement.onclick = (e) => {
        if (
          e.target.closest('.song:not(.active)') &&
          !e.target.closest('.option')
        ) {
          this.currentId = e.target.closest('.song').getAttribute('data-index')
          this.loadCurrentSong()
          audioElement.play()
          this.scrollToView()
        }
      }
    },
    playingSong(animation) {
      if (audioElement.paused) {
        audioElement.play()
        animation.play()
        playerElement.classList.add('playing')
      } else {
        audioElement.pause()
        animation.pause()
        playerElement.classList.remove('playing')
      }
    },
    randomSong() {
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * this.songs.length)
      } while (newIndex === this.currentId)
      this.currentId = newIndex
    },
    playNextSong(isNext) {
      if (!this.isRandom) {
        if (isNext) {
          this.currentId++
          if (this.currentId >= this.songs.length) {
            this.currentId = 0
          }
        } else {
          this.currentId--
          if (this.currentId < 0) {
            this.currentId = this.songs.length - 1
          }
        }
      } else {
        this.randomSong()
      }
      this.loadCurrentSong()
      audioElement.play()
      this.scrollToView()
    },
    scrollToView() {
      setTimeout(() => {
        query('.song.active').scrollIntoView()
      }, 200)
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
