import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { Loader } from "./Loader";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorage";
import { useKey } from "./useKey";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  const inputElement = useRef(null);
  // useKey("Enter", function () {
  //   if (document.activeElement === inputElement.current) return;
  //   inputElement.current.focus();
  //   setQuery("");
  // });
  useKey("Enter", function () {
    if (document.activeElement === inputElement.current) return;
    inputElement.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
const keymov = "592f74f9";
// const tempQuery = "Storm";

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>👹</span> {message}
    </p>
  );
}

export default function App() {
  const [query, setQuery] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  // const [watched, setWatched] = useState(function () {
  //   return JSON.parse(localStorage.getItem("watched"));
  // });
  const { movies, isLoading, error, setError } = useMovies(query);
  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useLocalStorage([], "watched");
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovies() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched([...watched, movie]);
    handleCloseMovies();
  }

  function handleDeleteWatchedMovie(id) {
    setWatched((el) => el.filter((mov) => mov.imdbID !== id));
  }
  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  return (
    <>
      <NavBar>
        <Search setQuery={setQuery} query={query} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && (
            <div className="loader">
              <Loader />
            </div>
          )}
          {!isLoading && !error && (
            <MovieList handleSelectMovie={handleSelectMovie} movies={movies} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <SelectedMovie
              handleAddWatched={handleAddWatched}
              handleCloseMovies={handleCloseMovies}
              selectedId={selectedId}
              watched={watched}
              setError={setError}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                handleDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          handleSelectMovie={handleSelectMovie}
          movie={movie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}
function Movie({ movie, handleSelectMovie }) {
  return (
    <li onClick={() => handleSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function SelectedMovie({
  selectedId,
  handleCloseMovies,
  handleAddWatched,
  watched,
  setError,
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [rat, setRat] = useState(0);
  const [curMovie, setCurMovie] = useState({});
  const isWatched = watched.map((el) => el.imdbID).includes(selectedId);
  const watchedMovieRating = watched.find(
    (mov) => mov.imdbID === selectedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = curMovie;
  const countRef = useRef(0);
  function handleAdd() {
    const newWatchedFilm = {
      imdbID: selectedId,
      title,
      year,
      poster,
      userRating: rat,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      countRatingDec: countRef.current,
    };
    console.log(newWatchedFilm);

    handleAddWatched(newWatchedFilm);
    // handleCloseMovies();
  }
  useEffect(
    function () {
      if (rat) countRef.current += 1;
    },
    [rat]
  );
  useKey("Escape", handleCloseMovies);
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  useEffect(
    function () {
      const contAbrot = new AbortController();
      async function getDetails() {
        try {
          setIsLoad(true);
          const resul = await fetch(
            `http://www.omdbapi.com/?apikey=${keymov}&i=${selectedId}`,
            { signal: contAbrot.signal }
          );
          if (!resul.ok) {
            throw new Error("Something went wrong with loading movies");
          }
          const moreFilm = await resul.json();
          setIsLoad(false);
          setError("");
          setCurMovie(moreFilm);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        }
      }
      getDetails();
      return function () {
        contAbrot.abort();
      };
    },
    [selectedId, setError]
  );
  return (
    <div className="details">
      {!isLoad ? (
        <>
          <header>
            <button className="btn-back" onClick={handleCloseMovies}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${curMovie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating onSetRating={setRat} maxRating={10} size={24} />

                  {rat > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie {watchedMovieRating} <span>🌟</span>
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}

function WatchedMoviesList({ watched, handleDeleteWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          handleDeleteWatchedMovie={handleDeleteWatchedMovie}
          movie={movie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, handleDeleteWatchedMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDeleteWatchedMovie(movie.imdbID)}
        >
          x
        </button>
      </div>
    </li>
  );
}
