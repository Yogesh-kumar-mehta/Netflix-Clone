import {useEffect, useState} from "react"
import './App.css'
import axios from 'axios'
import Movie from "./components/Movie"
import Youtube from 'react-youtube'
import logo from "./logo.png";
import { ImSearch } from "react-icons/im"
function Home() {
    const MOVIE_API = "https://api.themoviedb.org/3/"
    const SEARCH_API = MOVIE_API + "search/movie"
    const DISCOVER_API = MOVIE_API + "discover/movie"
    const API_KEY = "06e63bd94ecc9422bc8f94a0e1c98324"
    const BACKDROP_PATH = "https://image.tmdb.org/t/p/w1280"

    const [playing, setPlaying] = useState(false)
    const [trailer, setTrailer] = useState(null)
    const [movies, setMovies] = useState([])
    const [searchKey, setSearchKey] = useState("")
    const [movie, setMovie] = useState({title: "Loading Movies"})
    const [page, setPage] = useState(1);


    useEffect(() => {
        fetchMovies()
    }, [])

    const fetchMovies = async (event) => {
        if (event) {
            event.preventDefault();
        }
    
        const { data } = await axios.get(`${searchKey ? SEARCH_API : DISCOVER_API}`, {
            params: {
                api_key: API_KEY,
                query: searchKey,
                page: page // Add the page parameter
            }
        });
    
        console.log(data.results[0]);
        setMovies(data.results);
        setMovie(data.results[0]);
    
        if (data.results.length) {
            await fetchMovie(data.results[0].id);
        }
    };
    

    const fetchMovie = async (id) => {
        const {data} = await axios.get(`${MOVIE_API}movie/${id}`, {
            params: {
                api_key: API_KEY,
                append_to_response: "videos"
            }
        })

        if (data.videos && data.videos.results) {
            const trailer = data.videos.results.find(vid => vid.name === "Official Trailer")
            setTrailer(trailer ? trailer : data.videos.results[0])
        }

        setMovie(data)
    }


    const selectMovie = (movie) => {
        fetchMovie(movie.id)
        setPlaying(false)
        setMovie(movie)
        window.scrollTo(0, 0)
    }

    function refreshPage() {
        window.location.reload(false);
      }

   
const renderMovies = () => {
    if (movies.length === 0) {
      return 'Sorry, no movies found';
    }
  
    return movies.map((movie) => (
      <Movie selectMovie={selectMovie} key={movie.id} movie={movie} />
    ));
  };
  
//   const loadMoreMovies = () => {
//     setPage((prevPage) => prevPage + 1);
//   };

const loadMoreMovies = async () => {
    setPage((prevPage) => prevPage + 1);
    await fetchMovies();
  
    const { data } = await axios.get(`${DISCOVER_API}`, {
      params: {
        api_key: API_KEY,
        page: page + 1, // Increment the page number for the next set of movies
      },
    });
  
    const newMovies = data.results;
    setMovies((prevMovies) => [...prevMovies, ...newMovies]);
  };
  
  return (
    <div className="App">
      <header className="center-max-size header">
        <img className="logo" src={logo}></img>
        {/* <span className={"brand"}>Netflix Clone</span> */}
  
        <form className="form" onSubmit={fetchMovies}>
          <input
            className="search"
            type="text"
            id="search"
            placeholder="Search any movie"
            onInput={(event) => setSearchKey(event.target.value)}
          />
          <button className="submit-search" type="submit">
            <ImSearch />
          </button>
        </form>
      </header>
      {movies.length ? (
        <main>
          {movie ? (
            <div
              className="poster"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), url(${BACKDROP_PATH}${movie.backdrop_path})`,
              }}
            >
              {playing ? (
                <>
                  <Youtube
                    videoId={trailer.key}
                    className={"youtube amru"}
                    containerClassName={"youtube-container amru"}
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 1,
                        controls: 1,
                        cc_load_policy: 0,
                        fs: 0,
                        iv_load_policy: 0,
                        modestbranding: 0,
                        rel: 0,
                        showinfo: 0,
                      },
                    }}
                  />
                  <button
                    onClick={() => {
                      setPlaying(false);
                      refreshPage();
                    }}
                    className={"button close-video"}
                  >
                    Close
                  </button>
                </>
              ) : (
                <div className="center-max-size">
                  <div className="poster-content">
                    {trailer ? (
                      <button
                        className={"button play-video"}
                        onClick={() => setPlaying(true)}
                        type="button"
                      >
                        Play Now
                      </button>
                    ) : (
                      'Sorry, no trailer available'
                    )}
                    <h1>{movie.title}</h1>
                    <p>{movie.overview}</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
  
  <div className={"center-max-size container"}>
          {renderMovies()}
        </div>
        <button
  className="button play-video load"
  onClick={loadMoreMovies}
  type="button"
>
  Load More Movies
</button>
      </main>
    ) : (
      'Sorry, no movies found'
    )}
  </div>
  );
      }  

export default Home;
