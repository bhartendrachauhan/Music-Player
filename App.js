
class PlaylistStorage{
    static getAllPlaylists(){
        const playlists = JSON.parse(localStorage.getItem("playlists") || "[]")
        return playlists
    }

    static savePlaylist(playlistToSave){
        const playlists = PlaylistStorage.getAllPlaylists()
        const existing = playlists.find(playlist => playlist.id == playlistToSave.id)
        if(existing){
            existing.songList = playlistToSave.songList
        }
        else{
            playlistToSave.id = Math.floor(Math.random() * 1000000)
            playlists.push(playlistToSave)
        }
        localStorage.setItem("playlists", JSON.stringify(playlists))
    }
    static deletePlaylist(id){
        const playlists = PlaylistStorage.getAllPlaylists()
        const updatedPlaylists = playlists.filter(playlist => playlist.id != id)
        localStorage.setItem("playlists", JSON.stringify(updatedPlaylists))
    }
}

let currentSongUrl = ''

const fetchHomeData = async function (){
    const api = await fetch('http://api.napster.com/v2.2/tracks/top?apikey=ZmFmOTMzZDYtYzU4MC00YjhmLWE0NDQtY2RlYjgxOTljZDE0')
    const result = await api.json()
    return result["tracks"]
}
let throttleTimer;
const throttle = (callback, time) => {
  if (throttleTimer) return;
  throttleTimer = true;
  setTimeout(() => {
    callback();
    throttleTimer = false;
  }, time);
};
function search(){
    throttle(()=>{
        const search = document.querySelector('#search-text')
        const searchValue = search.value
        if(searchValue !== ""){
            document.getElementById('filter').style.display = 'flex'
            document.querySelector('#container-topline').setAttribute('style',"display:none;")
            document.querySelector('#add-playlist').setAttribute('style',"display:none;")
            allScreenOff()
            document.querySelector('#search').setAttribute('style',"display:flex;")
            const searchLoaders = document.querySelectorAll('.search-loader')
            searchLoaders[0].setAttribute('style',"display:flex;")
            searchLoaders[1].setAttribute('style',"display:flex;")
            document.querySelector('#search-song-display').setAttribute('style',"display:none;")
            document.querySelector('#search-artist-display').setAttribute('style',"display:none;")
            async function fetchSearchTrack(){
                const api = await fetch(`http://api.napster.com/v2.2/search?apikey=ZmFmOTMzZDYtYzU4MC00YjhmLWE0NDQtY2RlYjgxOTljZDE0&query=${searchValue}&type=track`)
                const response = await api.json()
                searchLoaders[0].setAttribute('style',"display:none;")
                document.querySelector('#search-song-display').setAttribute('style',"display:flex;")
                const trackList = response["search"]["data"]["tracks"]
                const trackLimit = trackList.length
                const trackIncrease = 4
                const pageCount = Math.ceil(trackLimit/trackIncrease)
                let currentPage = 1
                const createTrack = (i)=>{
                    const trackContainer = document.querySelector("#search-song-display");
                    const track = document.createElement('div')
                    track.classList.add('searched-song')
                    track.style.backgroundImage = `url('http://direct.rhapsody.com/imageserver/v2/albums/${trackList[i]["albumId"]}/images/300x300.jpg')`
                    const span = document.createElement('span')
                    span.classList.add("search-song-name")
                    span.innerHTML = `${trackList[i]["name"]}`
                    const div = document.createElement('div')
                    div.classList.add('song-buttons')
                    const OptionBtn = document.createElement('i')
                    OptionBtn.classList.add("fa-solid", "fa-bars")
                    OptionBtn.setAttribute('id',`search-song-option${i}`)
                    const playBtn = document.createElement('i')
                    playBtn.classList.add("fa-solid", "fa-play")
                    playBtn.setAttribute('id',`search-song-play${i}`)
                    const optDiv = document.createElement('div')
                    optDiv.classList.add("search-option-div")
                    optDiv.setAttribute('id',`search-option-div-${i}`)
                    let qa = document.createElement('a')
                    let pa = document.createElement('a')
                    qa.className = "menu-options"
                    pa.className = "menu-options"
                    qa.setAttribute('id',`search-addToQueue${i}`)
                    pa.setAttribute('id',`search-addToPlaylist${i}`)
                    qa.innerHTML = 'Add to queue'
                    pa.innerHTML = 'Playlists<i class="fa-solid fa-arrow-right"></i>'
                    const playlistDiv = document.createElement('div')
                    playlistDiv.className = "search-playlist-div"
                    playlistDiv.setAttribute('id',`search-playlist-div-${i}`)
                    const createplaylist = document.createElement('a')
                    createplaylist.innerHTML = "Create New Playlist"
                    createplaylist.className = 'menu-options'
                    createplaylist.setAttribute('id','search-create-new-playlist')
                    optDiv.appendChild(qa)
                    optDiv.appendChild(pa)
                    playlistDiv.appendChild(createplaylist)
                    div.appendChild(playBtn)
                    div.appendChild(OptionBtn)
                    div.appendChild(optDiv)
                    div.appendChild(playlistDiv)
                    track.appendChild(span)
                    track.appendChild(div)
                    trackContainer.appendChild(track)
                }
                const addTrack = (pageIndex)=>{
                    const display = document.querySelector("#search-song-display")
                    if(display.innerHTML !== ""){
                        display.innerHTML = ""
                    }
                    currentPage = pageIndex
        
                    const startRange = (currentPage-1)*trackIncrease
                    const endRange = currentPage == pageCount ? trackLimit : currentPage*trackIncrease

                    for(let i=startRange;i<endRange;i++){
                        createTrack(i)
                    }
                    for(let i=startRange;i<endRange;i++){
                        document.getElementById(`search-song-play${i}`).addEventListener('click',()=>{
                            music.src = trackList[i]["previewURL"]
                            currentSongUrl = trackList[i]["previewURL"]
                            music.play()
                            document.getElementById('player-image-container').style.display = "block"
                            document.querySelector('#songImage').src = `http://direct.rhapsody.com/imageserver/v2/albums/${trackList[i]["albumId"]}/images/50x50.jpg`
                            document.querySelector('#songTitle').innerHTML = `${trackList[i]["name"]}`
                            document.querySelector('#artistTitle').innerHTML = `${trackList[i]["artistName"]}`
                            document.querySelector('#player-play').classList.remove('fa-circle-play')
                            document.querySelector('#player-play').classList.add('fa-circle-pause')
                        })
                        document.getElementById(`search-song-option${i}`).addEventListener('click',()=>{
                            document.getElementById(`search-playlist-div-${i}`).classList.remove("show")
                            const div = document.getElementById(`search-option-div-${i}`)
                            if(div.classList.contains("show")){
                                div.classList.remove("show")
                            }
                            else{
                                div.classList.add("show")
                            }
                        })
                        document.getElementById(`search-addToQueue${i}`).addEventListener('click',()=>{
                            queue.push(trackList[i]["id"])
                            document.getElementById(`search-playlist-div-${i}`).classList.remove("show")
                            document.getElementById(`search-option-div-${i}`).classList.remove("show")
                            alert("Song added to queue")
                        })
                        document.getElementById(`search-addToPlaylist${i}`).addEventListener('click',()=>{
                            const playlist = document.getElementById(`search-playlist-div-${i}`)
                            if(playlist.classList.contains("show")){
                                playlist.classList.remove("show")
                            }
                            else{
                                playlist.classList.add("show")
                            }
                            const allPlaylists = PlaylistStorage.getAllPlaylists()
                            for(const eachPlaylist of allPlaylists){
                                const playlistName = eachPlaylist.name
                                if(!playlist.contains(document.getElementById(`search-add-to-${playlistName}-${i}`))){
                                    const pl = document.createElement('a')
                                    pl.className = "menu-options"
                                    pl.setAttribute('id',`search-add-to-${playlistName}-${i}`)
                                    pl.innerHTML = playlistName
                                    playlist.appendChild(pl)
                                    pl.addEventListener('click',()=>{
                                        eachPlaylist.songList.push(trackList[i]["id"])
                                        PlaylistStorage.savePlaylist(eachPlaylist)
                                        playlist.classList.remove("show")
                                        document.getElementById(`search-option-div-${i}`).classList.remove("show")
                                        alert(`Song saved to ${playlistName}`)
                                    })
                                }
                            }
                        })
                    }
                }
                if(trackList.length !==0){
                    addTrack(currentPage)
                }
                else{
                    const display = document.querySelector("#search-song-display")
                        if(display.innerHTML !== ""){
                            display.innerHTML = ""
                        }
                        const noResultDiv = document.createElement('div')
                        noResultDiv.className = 'no-result'
                        noResultDiv.style.height = '140px'
                        noResultDiv.style.width = '100%'
                        noResultDiv.innerHTML = '<span>No Song Found</span>'
                        display.appendChild(noResultDiv)
                }
                
                document.querySelector('#song-next').addEventListener('click',()=>{
                    const nextPage = currentPage+1
                    if(nextPage<=pageCount){

                        if(trackList.length !==0){
                            addTrack(nextPage)
                        }
                        else{
                            const display = document.querySelector("#search-song-display")
                            if(display.innerHTML !== ""){
                                display.innerHTML = ""
                            }
                            const noResultDiv = document.createElement('div')
                            noResultDiv.className = 'no-result'
                            noResultDiv.style.height = '140px'
                            noResultDiv.style.width = '100%'
                            noResultDiv.innerHTML = '<span>No Song Found</span>'
                            display.appendChild(noResultDiv)
                        }
                    }
                })
                document.querySelector('#song-prev').addEventListener('click',()=>{
                    const prevPage = currentPage-1
                    if(prevPage>=1){

                        if(trackList.length !==0){
                            addTrack(prevPage)
                        }
                        else{
                            const display = document.querySelector("#search-song-display")
                            if(display.innerHTML !== ""){
                                display.innerHTML = ""
                            }
                            const noResultDiv = document.createElement('div')
                            noResultDiv.className = 'no-result'
                            noResultDiv.style.height = '140px'
                            noResultDiv.style.width = '100%'
                            noResultDiv.innerHTML = '<span>No Song Found</span>'
                            display.appendChild(noResultDiv)
                        }
                    }
                })
            }
            async function fetchSearchArtist(){
                const api = await fetch(`http://api.napster.com/v2.2/search?apikey=ZmFmOTMzZDYtYzU4MC00YjhmLWE0NDQtY2RlYjgxOTljZDE0&query=${searchValue}&type=artist`)
                const response = await api.json()
                searchLoaders[1].setAttribute('style',"display:none;")
                document.querySelector('#search-artist-display').setAttribute('style',"display:flex;")
                const artistList = response["search"]["data"]["artists"]
                const trackLimit = artistList.length
                const trackIncrease = 4
                const pageCount = Math.ceil(trackLimit/trackIncrease)
                let currentPage = 1
                const createArtist = (i)=>{
                    const artistContainer = document.querySelector("#search-artist-display");
                    const artist = document.createElement('div')
                    artist.classList.add('searched-artist')
                    artist.setAttribute('id',`search-artist-${i}`)
                    artist.style.backgroundImage = `url('https://api.napster.com/imageserver/v2/artists/${artistList[i]["id"]}/images/300x300.jpg')`
                    const span = document.createElement('span')
                    span.classList.add("songName")
                    span.innerHTML = `${artistList[i]["name"]}`
                    artist.appendChild(span)
                    artistContainer.appendChild(artist)
                }
                const addArtist = (pageIndex)=>{
                    const display = document.querySelector("#search-artist-display")
                    if(display.innerHTML !== ""){
                        display.innerHTML = ""
                    }
                    currentPage = pageIndex
        
                    const startRange = (currentPage-1)*trackIncrease
                    const endRange = currentPage == pageCount ? trackLimit : currentPage*trackIncrease

                    for(let i=startRange;i<endRange;i++){
                        createArtist(i)
                    }
                    for(let i=startRange;i<endRange;i++){
                        document.getElementById(`search-artist-${i}`).addEventListener('click',()=>{
                            allScreenOff()
                            document.getElementById('playlist-open-page').style.display = 'grid'
                            document.querySelector('#container-topline').setAttribute('style',"display:flex;")
                            const topline = document.getElementById('topline-text')
                            topline.innerHTML = `<i class="fa-solid fa-caret-left" id='back-to-search'></i> ${artistList[i]["name"]}`
                            topline.addEventListener('click',()=>{
                                allScreenOff()
                                document.querySelector('#container-topline').setAttribute('style',"display:none;")
                                document.querySelector('#search').setAttribute('style',"display:flex;")
                            })
                            const playlistImageContainer = document.getElementById('playlist-open-image')
                            playlistImageContainer.style.backgroundImage = `url('https://api.napster.com/imageserver/v2/artists/${artistList[i]["id"]}/images/300x300.jpg')`
                            const playlistDesContainer = document.getElementById('playlist-open-des')
                            playlistDesContainer.innerHTML = `${artistList[i]["blurbs"][0]}`
                            const openPlaylistContainer = document.querySelector('#playlist-open')
                            async function parseArtistSongs(){
                                const api = await fetch(`http://api.napster.com/v2.2/artists/${artistList[i]["id"]}/tracks/top?apikey=ZmFmOTMzZDYtYzU4MC00YjhmLWE0NDQtY2RlYjgxOTljZDE0`)
                                const response = await api.json()
                                const artistTopSongs = response["tracks"]
                                openPlaylistContainer.innerHTML = ''
                                for(let i in artistTopSongs){
                                    openPlaylistContainer.innerHTML += `<div class="playlist-open-each-song" id='artist-open-each-song-${i}'>
                                                                            <img class="playlist-open-each-song-image" src='http://direct.rhapsody.com/imageserver/v2/albums/${artistTopSongs[i]["albumId"]}/images/50x50.jpg'>
                                                                            <div class="playlist-open-each-song-details">
                                                                                <span class="playlist-open-each-song-name">${artistTopSongs[i]["name"]}</span>
                                                                                <span>${artistTopSongs[i]["artistName"]}</span>
                                                                            </div>
                                                                            <div class="playlist-open-each-song-btns">
                                                                                <i class="fa-solid fa-2x fa-play" id='open-artist-play-${i}'></i>
                                                                            </div>
                                                                        </div>`
                                }
                                document.getElementById('circle-play-btn').addEventListener('click',()=>{
                                    musicURLs = []
                                    queue = []
                                    for(let i in artistTopSongs){
                                        musicURLs.push(artistTopSongs[i]["previewURL"])
                                        queue.push(artistTopSongs[i]["id"])
                                    }
                                    music.src = artistTopSongs[0]["previewURL"]
                                    currentSongUrl = artistTopSongs[0]["previewURL"]
                                    music.play()
                                    document.getElementById('player-image-container').style.display = "block"
                                    document.querySelector('#songImage').src = `http://direct.rhapsody.com/imageserver/v2/albums/${artistTopSongs[0]["albumId"]}/images/50x50.jpg`
                                    document.querySelector('#songTitle').innerHTML = `${artistTopSongs[0]["name"]}`
                                    document.querySelector('#artistTitle').innerHTML = `${artistTopSongs[0]["artistName"]}`
                                    document.querySelector('#player-play').classList.remove('fa-circle-play')
                                    document.querySelector('#player-play').classList.add('fa-circle-pause')
                                })
                                for(let i in artistTopSongs){
                                    document.getElementById(`open-artist-play-${i}`).addEventListener('click',()=>{
                                        musicURLs = []
                                        queue = []
                                        for(let i in artistTopSongs){
                                            musicURLs.push(artistTopSongs[i]["previewURL"])
                                            queue.push(artistTopSongs[i]["id"])
                                        }
                                        music.src = artistTopSongs[i]["previewURL"]
                                        currentSongUrl = artistTopSongs[i]["previewURL"]
                                        music.play()
                                        document.getElementById('player-image-container').style.display = "block"
                                        document.querySelector('#songImage').src = `http://direct.rhapsody.com/imageserver/v2/albums/${artistTopSongs[i]["albumId"]}/images/50x50.jpg`
                                        document.querySelector('#songTitle').innerHTML = `${artistTopSongs[i]["name"]}`
                                        document.querySelector('#artistTitle').innerHTML = `${artistTopSongs[i]["artistName"]}`
                                        document.querySelector('#player-play').classList.remove('fa-circle-play')
                                        document.querySelector('#player-play').classList.add('fa-circle-pause')
                                    })
                                }
                            }
                            parseArtistSongs()
                        })
                    }
                }
                if(artistList.length !==0){
                    addArtist(currentPage)
                }
                else{
                    const display = document.querySelector("#search-artist-display")
                    if(display.innerHTML !== ""){
                        display.innerHTML = ""
                    }
                    const noResultDiv = document.createElement('div')
                    noResultDiv.className = 'no-result'
                    noResultDiv.style.height = '140px'
                    noResultDiv.style.width = '100%'
                    noResultDiv.innerHTML = '<span>No Artist Found</span>'
                    display.appendChild(noResultDiv)
                }
                
                document.querySelector('#artist-next').addEventListener('click',()=>{
                    const nextPage = currentPage+1
                    if(nextPage<=pageCount){

                        if(artistList.length !==0){
                            addArtist(nextPage)
                        }
                        else{
                            const display = document.querySelector("#search-artist-display")
                            if(display.innerHTML !== ""){
                                display.innerHTML = ""
                            }
                            const noResultDiv = document.createElement('div')
                            noResultDiv.className = 'no-result'
                            noResultDiv.style.height = '140px'
                            noResultDiv.style.width = '100%'
                            noResultDiv.innerHTML = '<span>No Artist Found</span>'
                            display.appendChild(noResultDiv)
                        }
                    }
                })
                document.querySelector('#artist-prev').addEventListener('click',()=>{
                    const prevPage = currentPage-1
                    if(prevPage>=1){
                        if(artistList.length !==0){
                        addArtist(prevPage)
                        }
                        else{
                            const display = document.querySelector("#search-artist-display")
                            if(display.innerHTML !== ""){
                                display.innerHTML = ""
                            }
                            const noResultDiv = document.createElement('div')
                            noResultDiv.className = 'no-result'
                            noResultDiv.style.height = '140px'
                            noResultDiv.style.width = '100%'
                            noResultDiv.innerHTML = '<span class="">No Aritst Found</span>'
                            display.appendChild(noResultDiv)
                        }
                    }
                })
            }
            fetchSearchTrack()
            fetchSearchArtist()
        }
        else{
            document.querySelector('#container-topline').setAttribute('style',"display:flex;")
            document.querySelector('#home').setAttribute('style',"display:flex;")
            document.querySelector('#search').setAttribute('style',"display:none;")
            document.getElementById('filter').style.display = 'none'
        }
    },1500)
    
}
document.getElementById('filter').addEventListener('click',()=>{
    if(document.getElementById('filter-option-div').style.display == 'none'){
        document.getElementById('filter-option-div').style.display = 'block'
    }
    else{
        document.getElementById('filter-option-div').style.display = 'none'
    }
    
})
document.getElementById('filter-opt1').addEventListener('click',()=>{
    document.getElementById('search-top-song-heading').style.display = 'none'
    document.getElementById('search-song-result').style.display = 'none'
    document.getElementById('search-top-artist-heading').style.display = 'inline'
    document.getElementById('search-artist-result').style.display = 'flex'
})
document.getElementById('filter-opt2').addEventListener('click',()=>{
    document.getElementById('search-top-artist-heading').style.display = 'none'
    document.getElementById('search-artist-result').style.display = 'none'
    document.getElementById('search-top-song-heading').style.display = 'inline'
    document.getElementById('search-song-result').style.display = 'flex'
})
document.getElementById('filter-opt3').addEventListener('click',()=>{
    document.getElementById('search-top-song-heading').style.display = 'inline'
    document.getElementById('search-song-result').style.display = 'flex'
    document.getElementById('search-top-artist-heading').style.display = 'inline'
    document.getElementById('search-artist-result').style.display = 'flex'
})
const music = new Audio()
let queue = []
let musicURLs = []
document.addEventListener('DOMContentLoaded', ()=>{
    try{
        const display = async ()=>{
            const trackList =  await fetchHomeData()
            const loader = document.getElementById("loader");
            const trackLimit = trackList.length
            const trackIncrease = 6
            const pageCount = Math.ceil(trackLimit/trackIncrease)
            let currentPage = 1
            for(let i in trackList){
                musicURLs.push(trackList[i]["previewURL"])
                queue.push(trackList[i]["id"])
            }
    
            const createTrack = (i)=>{
                const trackContainer = document.querySelector("#home-tracks");
                const track = document.createElement('div')
                track.classList.add('tracks')
                track.style.backgroundImage = `url('http://direct.rhapsody.com/imageserver/v2/albums/${trackList[i]["albumId"]}/images/300x300.jpg')`
                const div1 = document.createElement('div')
                div1.classList.add("home-content-div")
                const span = document.createElement('span')
                span.classList.add("song-name")
                span.innerHTML = `${trackList[i]["name"]}`
                const div = document.createElement('div')
                div.classList.add('song-buttons')
                const OptionBtn = document.createElement('i')
                OptionBtn.classList.add("fa-solid", "fa-bars")
                OptionBtn.setAttribute('id',`option${i}`)
                const playBtn = document.createElement('i')
                playBtn.classList.add("fa-solid", "fa-play")
                playBtn.setAttribute('id',`play${i}`)
                const playlistDiv = document.createElement('div')
                const optDiv = document.createElement('div')
                optDiv.classList.add("option-div")
                optDiv.setAttribute('id',`option-div-${i}`)
                let qa = document.createElement('a')
                let pa = document.createElement('a')
                qa.className = "menu-options"
                pa.className = "menu-options"
                qa.innerHTML = 'Add to queue'
                qa.setAttribute('id',`addToQueue${i}`)
                pa.setAttribute('id',`addToPlaylist${i}`)
                pa.innerHTML = 'Playlists<i class="fa-solid fa-arrow-right"></i>'
                optDiv.appendChild(qa)
                optDiv.appendChild(pa)
                playlistDiv.className = "playlist-div"
                playlistDiv.setAttribute('id',`playlist-div-${i}`)
                const createplaylist = document.createElement('a')
                createplaylist.innerHTML = "Create New Playlist"
                createplaylist.className = 'menu-options'
                createplaylist.setAttribute('id','create-new-playlist')
                playlistDiv.appendChild(createplaylist)
                div.appendChild(playBtn)
                div.appendChild(OptionBtn)
                div.appendChild(optDiv)
                div.appendChild(playlistDiv)
                div1.appendChild(span)
                div1.appendChild(div)
                track.appendChild(div1)
                trackContainer.appendChild(track)
            }
    
            const addTrack = (pageIndex)=>{
                currentPage = pageIndex
    
                const startRange = (currentPage-1)*trackIncrease
                const endRange = currentPage == pageCount ? trackLimit : currentPage*trackIncrease
    
                for(let i=startRange;i<endRange;i++){
                    createTrack(i)
                }
                for(let i=startRange;i<endRange;i++){
                    document.getElementById(`play${i}`).addEventListener('click',()=>{
                        music.src = trackList[i]["previewURL"]
                        currentSongUrl = trackList[i]["previewURL"]
                        music.play()
                        document.getElementById('player-image-container').style.display = "block"
                        document.querySelector('#songImage').src = `http://direct.rhapsody.com/imageserver/v2/albums/${trackList[i]["albumId"]}/images/50x50.jpg`
                        document.querySelector('#songTitle').innerHTML = `${trackList[i]["name"]}`
                        document.querySelector('#artistTitle').innerHTML = `${trackList[i]["artistName"]}`
                        document.querySelector('#player-play').classList.remove('fa-circle-play')
                        document.querySelector('#player-play').classList.add('fa-circle-pause')
                    })
                    document.getElementById(`option${i}`).addEventListener('click',()=>{
                        document.getElementById(`playlist-div-${i}`).classList.remove("show")
                        const div = document.getElementById(`option-div-${i}`)
                        if(div.classList.contains("show")){
                            div.classList.remove("show")
                        }
                        else{
                            div.classList.add("show")
                        }
                    })
                    document.getElementById(`addToQueue${i}`).addEventListener('click',()=>{
                        if(queue.find(x => x == trackList[i]["id"])){
                            alert("Song already exist in queue")
                        }
                        else{
                            queue.push(trackList[i]["id"])
                            document.getElementById(`playlist-div-${i}`).classList.remove("show")
                            document.getElementById(`option-div-${i}`).classList.remove("show")
                            alert("Song added to queue")
                        }
                    })
                    document.getElementById(`addToPlaylist${i}`).addEventListener('click',()=>{
                        const playlist = document.getElementById(`playlist-div-${i}`)
                        if(playlist.classList.contains("show")){
                            playlist.classList.remove("show")
                        }
                        else{
                            playlist.classList.add("show")
                        }
                        const allPlaylists = PlaylistStorage.getAllPlaylists()
                        for(const eachPlaylist of allPlaylists){
                            const playlistName = eachPlaylist.name
                            if(!playlist.contains(document.getElementById(`add-to-${playlistName}-${i}`))){
                                const pl = document.createElement('a')
                                pl.className = "menu-options"
                                pl.setAttribute('id',`add-to-${playlistName}-${i}`)
                                pl.innerHTML = playlistName
                                playlist.appendChild(pl)
                                pl.addEventListener('click',()=>{
                                    eachPlaylist.songList.push(trackList[i]["id"])
                                    PlaylistStorage.savePlaylist(eachPlaylist)
                                    playlist.classList.remove("show")
                                    document.getElementById(`option-div-${i}`).classList.remove("show")
                                    alert(`Song saved to ${playlistName}`)
                                })
                            }
                        }
                    })
                }
            }
            addTrack(currentPage)
    
            const handleInfiniteScroll = () => {
                throttle(()=>{
                    const { scrollTop, scrollHeight, clientHeight } = document.querySelector('.screen')
                    if(scrollTop+clientHeight >= scrollHeight-1){
                        addTrack(currentPage+1)
                    }
                    if(currentPage==pageCount){
                        loader.remove()
                        document.querySelector('.screen').removeEventListener("scroll", handleInfiniteScroll)
                    }
                },1000)
            }
            document.querySelector('.screen').addEventListener("scroll", handleInfiniteScroll)
            document.querySelector('#create-new-playlist').addEventListener('click',()=>{
                document.getElementById('add-playlist').style.display = 'grid'
            })
        }
        display()
        parsePlaylist()
    }
    catch(e){
        console.log(e)
    }
})

music.addEventListener('timeupdate',()=>{
    let mus_curr = music.currentTime
    let mus_dur = music.duration

    let min1 = Math.floor(mus_dur/60)
    let sec1 = Math.floor(mus_dur%60)

    if(sec1<10){
        sec1 = `0${sec1}`
    }
    if(min1<10){
        min1 = `0${min1}`
    }

    let min2 = Math.floor(mus_curr/60)
    let sec2 = Math.floor(mus_curr%60)

    if(sec2<10){
        sec2 = `0${sec2}`
    }
    if(min2<10){
        min2 = `0${min2}`
    }

    document.querySelector('#currentEnd').innerHTML = `${min1}:${sec1}`
    document.querySelector('#currentStart').innerHTML = `${min2}:${sec2}`

    let barValue = parseInt((mus_curr/mus_dur)*100)
    document.querySelector('#audioProgress').value = barValue

    if(mus_curr === mus_dur){
        document.querySelector('#player-play').classList.remove('fa-circle-pause')
        document.querySelector('#player-play').classList.add('fa-circle-play')
    }
})

document.querySelector('#audioProgress').addEventListener('change', ()=>{
    let value = document.querySelector('#audioProgress').value
    let mus_dur = music.duration
    let mus_curr = (value/100)*mus_dur
    music.currentTime = mus_curr
    
})

document.querySelector('#option-1').addEventListener('click',()=>{
    allScreenOff()
    document.getElementById('filter').style.display = 'none'
    document.getElementById('search-text').value = ''
    document.querySelector('#home').style.display = 'flex'
    const toplineContainer = document.getElementById('container-topline')
    toplineContainer.setAttribute('style',"display:flex;")
    const topline = document.getElementById('topline-text')
    topline.innerHTML = 'Top Songs'
})
document.querySelector('#option-2').addEventListener('click',()=>{
    document.getElementById('search-text').value = ''
    allScreenOff()
    document.getElementById('filter').style.display = 'none'
    document.querySelector('#playlist').style.display = 'flex'
    parsePlaylist()
    const topline = document.getElementById('topline-text')
    topline.innerHTML = '<i class="fa-solid fa-caret-left"></i> Playlists'
    topline.addEventListener('click',()=>{
        document.querySelector('#playlist').style.display = 'none'
        document.querySelector('#home').style.display = 'flex'
        topline.innerHTML = 'Top Songs'
    })
})

function allScreenOff(){
    const screens = document.querySelectorAll('.screen')
    for(let i=0;i<screens.length;i++){
        screens[i].setAttribute('style',"display:none;")
    }
}




document.querySelector('#add-playlist-button').addEventListener('click',()=>{
    document.getElementById('add-playlist').style.display = 'grid'
})

document.querySelector('#add-playlist-cancel').addEventListener('click',()=>{
    const playlistName = document.querySelector('#add-playlist-input-name')
    const playlistDes = document.querySelector('#add-playlist-description')
    const playlistImage = document.getElementById('add-playlist-image')
    document.getElementById('add-playlist').style.display = 'none'
    playlistName.value = ""
    playlistDes.value = ""
    playlistImage.style.backgroundImage = 'none'
})

document.querySelector('#add-playlist-image').addEventListener('click',()=>{
    document.getElementById('playlist-image-file').click()
})
let photo;
document.getElementById('playlist-image-file').addEventListener('change',()=>{
    let file = document.getElementById('playlist-image-file').files[0]
    const reader = new FileReader()
    reader.addEventListener('load',()=>{
        photo = JSON.stringify(reader.result)
        document.getElementById('add-playlist-image').style.backgroundImage = `url('${reader.result}')`
    },false)
    if(file){
        reader.readAsDataURL(file)
    }
})

document.getElementById('add-playlist-save-btn').addEventListener('click',()=>{
    const playlistName = document.querySelector('#add-playlist-input-name')
    const playlistDes = document.querySelector('#add-playlist-description')
    const playlistImage = document.getElementById('add-playlist-image')
    const playlistNameValue = document.querySelector('#add-playlist-input-name').value
    const playlistDesValue = document.querySelector('#add-playlist-description').value
    const obj = {}
    if(playlistNameValue){
        obj.name = playlistNameValue
        if(playlistDesValue){
            obj.description = playlistDesValue
        }
        if(photo){
            obj.image = photo
        }
        obj.songList = []
        obj.previewURL = []

        PlaylistStorage.savePlaylist(obj)
        photo = ""
        parsePlaylist()
        playlistName.value = ""
        playlistDes.value = ""
        playlistImage.style.backgroundImage = 'none'
        document.getElementById('add-playlist').style.display = 'none'
    }
    else{
        alert("Playlist Name is a compulsory field")
        document.getElementById('add-playlist').style.display = 'grid'
    }
})

function parsePlaylist(){
    const playlistContainer = document.querySelector('#playlist-page-id')
    const allPlaylists = PlaylistStorage.getAllPlaylists()
    playlistContainer.innerHTML = ""
    for(const playlist of allPlaylists){
        let playlistImage;
        if(playlist.image){
            playlistImage = JSON.parse(playlist.image)
        }
        else{
            playlistImage = ''
        }
        playlistContainer.innerHTML += `<div class="each-added-playlist" id="${playlist.id}" style="background-image: url(${playlistImage});">
                                            <div class="each-added-playlist-content">
                                                <span class="songName">${playlist.name}</span>
                                                <i class="fa-solid fa-trash" id="remove-${playlist.id}"></i>
                                            </div>
                                        </div>`
        
    }
    document.querySelectorAll('.each-added-playlist').forEach(playlist => {
        document.getElementById(`remove-${playlist.id}`).addEventListener('click',(e)=>{
            e.stopPropagation()
            const itemToRemove = document.getElementById(`${playlist.id}`)
            itemToRemove.remove()
            PlaylistStorage.deletePlaylist(playlist.id)
        })
    })
    document.querySelectorAll('.each-added-playlist').forEach(playlist =>{
        playlist.addEventListener('click',()=>{
            const playlistId = playlist.getAttribute('id')
            const playlists = PlaylistStorage.getAllPlaylists()
            const playlistData = playlists.find(playlist => playlist.id == playlistId)
            let songList = playlistData.songList
            allScreenOff()
            document.getElementById('playlist-open-page').style.display = 'grid'
            document.querySelector('#container-topline').setAttribute('style',"display:flex;")
            const topline = document.getElementById('topline-text')
            topline.innerHTML = `<i class="fa-solid fa-caret-left" id='back-to-playlist'></i> ${playlistData.name}`
            topline.addEventListener('click',()=>{
                document.getElementById('search-text').value = ''
                allScreenOff()
                document.getElementById('filter').style.display = 'none'
                document.querySelector('#playlist').style.display = 'flex'
                parsePlaylist()
                const topline = document.getElementById('topline-text')
                topline.innerHTML = '<i class="fa-solid fa-caret-left"></i> Playlists'
                topline.addEventListener('click',()=>{
                    document.querySelector('#playlist').style.display = 'none'
                    document.querySelector('#home').style.display = 'flex'
                    topline.innerHTML = 'Top Songs'
                })
            })
            const playlistImageContainer = document.getElementById('playlist-open-image')
            if(playlistData.image){
                playlistImageContainer.style.backgroundImage = `url('${JSON.parse(playlistData.image)}')`
            }
            else{
                playlistImageContainer.style.backgroundImage = 'url(./res/playlist_image.jpg)'
            }
            const playlistDesContainer = document.getElementById('playlist-open-des')
            if(playlistData.description){
                playlistDesContainer.innerHTML = `${playlistData.description}`
            }
            else{
                playlistDesContainer.innerHTML = "<i>NO DESCRIPTION AVAILABLE</i>"
            }

            
            let query = ''
            for(let i in songList){
                query += `${songList[i]},`
            }
            const openPlaylistContainer = document.querySelector('#playlist-open')
            async function parsePlaylistSongs(){
                if(songList.length){
                    const api = await fetch(`http://api.napster.com/v2.2/tracks/${query}?apikey=ZmFmOTMzZDYtYzU4MC00YjhmLWE0NDQtY2RlYjgxOTljZDE0`)
                    const response = await api.json()
                    const trackList = response["tracks"]
                    openPlaylistContainer.innerHTML = ''
                    for(let i in trackList){
                        openPlaylistContainer.innerHTML += `<div class="playlist-open-each-song" id='playlist-open-each-song-${i}'>
                                                                <img class="playlist-open-each-song-image" src='http://direct.rhapsody.com/imageserver/v2/albums/${trackList[i]["albumId"]}/images/50x50.jpg'>
                                                                <div class="playlist-open-each-song-details">
                                                                    <span class="playlist-open-each-song-name">${trackList[i]["name"]}</span>
                                                                    <span>${trackList[i]["artistName"]}</span>
                                                                </div>
                                                                <div class="playlist-open-each-song-btns">
                                                                    <i class="fa-solid fa-2x fa-play" id='open-playlist-play-${i}'></i>
                                                                    <i class="fa-solid fa-2x fa-xmark" id='open-playlist-remove-${i}'></i>
                                                                </div>
                                                            </div>`
                    }
                    document.getElementById('circle-play-btn').addEventListener('click',()=>{
                        if(songList.length){
                            musicURLs = []
                            for(let i in trackList){
                                musicURLs.push(trackList[i]["previewURL"])
                            }
                            queue = songList
                            music.src = trackList[0]["previewURL"]
                            currentSongUrl = trackList[0]["previewURL"]
                            music.play()
                            document.getElementById('player-image-container').style.display = "block"
                            document.querySelector('#songImage').src = `http://direct.rhapsody.com/imageserver/v2/albums/${trackList[0]["albumId"]}/images/50x50.jpg`
                            document.querySelector('#songTitle').innerHTML = `${trackList[0]["name"]}`
                            document.querySelector('#artistTitle').innerHTML = `${trackList[0]["artistName"]}`
                            document.querySelector('#player-play').classList.remove('fa-circle-play')
                            document.querySelector('#player-play').classList.add('fa-circle-pause')
                        }
                    })
                    for(let i in trackList){
                        document.getElementById(`open-playlist-play-${i}`).addEventListener('click',()=>{
                            queue = songList
                            musicURLs = []
                            for(let i in trackList){
                                musicURLs.push(trackList[i]["previewURL"])
                            }
                            music.src = trackList[i]["previewURL"]
                            currentSongUrl = trackList[i]["previewURL"]
                            music.play()
                            document.getElementById('player-image-container').style.display = "block"
                            document.querySelector('#songImage').src = `http://direct.rhapsody.com/imageserver/v2/albums/${trackList[i]["albumId"]}/images/50x50.jpg`
                            document.querySelector('#songTitle').innerHTML = `${trackList[i]["name"]}`
                            document.querySelector('#artistTitle').innerHTML = `${trackList[i]["artistName"]}`
                            document.querySelector('#player-play').classList.remove('fa-circle-play')
                            document.querySelector('#player-play').classList.add('fa-circle-pause')
                        })
                    }
                    for(let i in trackList){
                        document.getElementById(`open-playlist-remove-${i}`).addEventListener('click',()=>{
                            document.getElementById(`playlist-open-each-song-${i}`).remove()
                            const updatedList = songList.filter(songId => songId != trackList[i]["id"])
                            playlistData.songList = updatedList
                            PlaylistStorage.savePlaylist(playlistData)
                        })
                    }
                }
                else{
                    openPlaylistContainer.innerHTML = 'You should add some songs'
                }
            }
            parsePlaylistSongs()
        })
    })
}

document.getElementById('playlist-open-image').addEventListener('mouseover',()=>{
    document.getElementById('playlist-open-image-btn').style.display = 'block'
    document.getElementById('playlist-open-image').style.filter = 'brightness(40%)'
})
document.getElementById('playlist-open-image').addEventListener('mouseout',()=>{
    document.getElementById('playlist-open-image-btn').style.display = 'none'
    document.getElementById('playlist-open-image').style.filter = 'none'
})

document.getElementById('player-queue').addEventListener('click',()=>{
    allScreenOff()
    document.getElementById('filter').style.display = 'none'
    document.getElementById('search-text').value = ''
    document.getElementById('container-topline').style.display = 'none'
    document.getElementById('queue').style.display = 'grid'
    let query = ''
    for(let i in queue){
        query += `${queue[i]},`
    }
    const queueContainer = document.getElementById('queue-songlist')
    
    async function parseQueueData(){
        if(queue.length){
            const api = await fetch(`http://api.napster.com/v2.2/tracks/${query}?apikey=ZmFmOTMzZDYtYzU4MC00YjhmLWE0NDQtY2RlYjgxOTljZDE0`)
            const response = await api.json()
            const trackList = response["tracks"]
            musicURLs = []
            for(let i in trackList){
                musicURLs.push(trackList[i]["previewURL"])
            }
            queueContainer.innerHTML = ''
            for(let i in trackList){
                queueContainer.innerHTML += `<div class="queue-open-each-song" id='queue-open-each-song-${i}'>
                                                <img class="queue-open-each-song-image" src='http://direct.rhapsody.com/imageserver/v2/albums/${trackList[i]["albumId"]}/images/50x50.jpg'>
                                                <div class="queue-open-each-song-details">
                                                    <span class="queue-open-each-song-name">${trackList[i]["name"]}</span>
                                                    <span>${trackList[i]["artistName"]}</span>
                                                </div>
                                                <div class="queue-open-each-song-btns">
                                                    <i class="fa-solid fa-2x fa-play" id='queue-play-${i}'></i>
                                                    <i class="fa-solid fa-2x fa-xmark" id='queue-remove-${i}'></i>
                                                </div>
                                            </div>`
            }
            for(let i in trackList){
                document.getElementById(`queue-play-${i}`).addEventListener('click',()=>{
                    music.src = trackList[i]["previewURL"]
                    music.play()
                    document.getElementById('player-image-container').style.display = "block"
                    document.querySelector('#songImage').src = `http://direct.rhapsody.com/imageserver/v2/albums/${trackList[i]["albumId"]}/images/50x50.jpg`
                    document.querySelector('#songTitle').innerHTML = `${trackList[i]["name"]}`
                    document.querySelector('#artistTitle').innerHTML = `${trackList[i]["artistName"]}`
                    document.querySelector('#player-play').classList.remove('fa-circle-play')
                    document.querySelector('#player-play').classList.add('fa-circle-pause')
                })
            }
            for(let i in trackList){
                document.getElementById(`queue-remove-${i}`).addEventListener('click',()=>{
                    document.getElementById(`queue-open-each-song-${i}`).remove()
                    const updatedList = songList.filter(songId => songId != trackList[i]["id"])
                    playlistData.songList = updatedList
                    PlaylistStorage.savePlaylist(playlistData)
                })
            }
        }
    }
    parseQueueData()
})


let shuffleClickCount = 0
document.getElementById('player-shuffle').addEventListener('click',()=>{
    shuffleClickCount++
    if(shuffleClickCount%2 === 1){
        document.getElementById('player-shuffle').style.color = 'purple'
    }
    else{
        document.getElementById('player-shuffle').style.color = 'white'
    }
})
document.getElementById('player-last').addEventListener('click',()=>{
    if(repeatClickCount%2===1){
        music.load()
        music.play()
        return
    }
    if(shuffleClickCount%2===1){
        const randomTrack = Math.floor(Math.random() * musicURLs.length)
        music.src = musicURLs[randomTrack]
        parsePlayerTrack(randomTrack)
        music.load()
        music.play()
        return
    }
    let current = musicURLs.indexOf(currentSongUrl)
    if(current == 0){
        currentSongUrl = musicURLs[musicURLs.length-1]
        music.src = musicURLs[musicURLs.length-1]
        parsePlayerTrack(musicURLs.length-1)
        music.load()
        music.play()
        return
    }
    currentSongUrl = musicURLs[current-1]
    music.src = musicURLs[current-1]
    parsePlayerTrack(current-1)
    music.load()
    music.play()
})
document.getElementById('player-rewind').addEventListener('click',()=>{
    music.currentTime -= 5
})
document.getElementById('player-play').addEventListener('click',()=>{
    if(music.paused || music.currentTime<=0){
        music.play()
        document.querySelector('#player-play').classList.remove('fa-circle-play')
        document.querySelector('#player-play').classList.add('fa-circle-pause')
    }
    else{
        music.pause()
        document.querySelector('#player-play').classList.add('fa-circle-play')
        document.querySelector('#player-play').classList.remove('fa-circle-pause')
    }
})
document.getElementById('player-forward').addEventListener('click',()=>{
    music.currentTime += 5
})
document.getElementById('player-next').addEventListener('click',()=>{
    if(repeatClickCount%2===1){
        music.load()
        music.play()
        return
    }
    if(shuffleClickCount%2===1){
        const randomTrack = Math.floor(Math.random() * musicURLs.length)
        music.src = musicURLs[randomTrack]
        parsePlayerTrack(randomTrack)
        music.load()
        music.play()
        return
    }
    let current = musicURLs.indexOf(currentSongUrl)
    if(current == musicURLs.length-1){
        currentSongUrl = musicURLs[0]
        music.src = musicURLs[0]
        parsePlayerTrack(0)
        music.load()
        music.play()
        return
    }
    currentSongUrl = musicURLs[current+1]
    music.src = musicURLs[current+1]
    parsePlayerTrack(current+1)
    music.load()
    music.play()
})
let repeatClickCount = 0
document.getElementById('player-repeat').addEventListener('click',()=>{
    repeatClickCount++
    if(repeatClickCount%2 === 1){
        document.getElementById('player-repeat').style.color = 'purple'
    }
    else{
        document.getElementById('player-repeat').style.color = 'white'
    }
})
music.addEventListener('ended',()=>{
    if(repeatClickCount%2===1){
        music.load()
        music.play()
        return
    }
    if(shuffleClickCount%2===1){
        const randomTrack = Math.floor(Math.random() * musicURLs.length)
        music.src = musicURLs[randomTrack]
        parsePlayerTrack(randomTrack)
        music.load()
        music.play()
        return
    }
    let current = musicURLs.indexOf(currentSongUrl)
    if(current == musicURLs.length-1){
        currentSongUrl = musicURLs[0]
        music.src = musicURLs[0]
        parsePlayerTrack(0)
        music.load()
        music.play()
        return
    }
    currentSongUrl = musicURLs[current+1]
    music.src = musicURLs[current+1]
    parsePlayerTrack(current+1)
    music.load()
    music.play()
})

async function parsePlayerTrack(randomTrack){
    const api = await fetch(`http://api.napster.com/v2.2/tracks/${queue[randomTrack]}?apikey=ZmFmOTMzZDYtYzU4MC00YjhmLWE0NDQtY2RlYjgxOTljZDE0`)
    const response = await api.json()
    const trackList = response["tracks"]
    document.getElementById('player-image-container').style.display = "block"
    document.querySelector('#songImage').src = `http://direct.rhapsody.com/imageserver/v2/albums/${trackList[0]["albumId"]}/images/50x50.jpg`
    document.querySelector('#songTitle').innerHTML = `${trackList[0]["name"]}`
    document.querySelector('#artistTitle').innerHTML = `${trackList[0]["artistName"]}`
    document.querySelector('#player-play').classList.remove('fa-circle-play')
    document.querySelector('#player-play').classList.add('fa-circle-pause')
}

document.getElementById('player-mute').addEventListener('click',()=>{
    if(music.muted){
        music.muted = false
        document.getElementById('player-mute').classList.add('fa-volume-low')
        document.getElementById('player-mute').classList.remove('fa-volume-xmark')
    }
    else{
        music.muted = true
        document.getElementById('player-mute').classList.remove('fa-volume-low')
        document.getElementById('player-mute').classList.add('fa-volume-xmark')
    }
})

document.getElementById('volumeBar').addEventListener('change',()=>{
    const value = document.getElementById('volumeBar').value/100
    music.volume = value
})



