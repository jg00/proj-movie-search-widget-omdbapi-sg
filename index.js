// AutoComplete Shared Config
const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
    <img src="${imgSrc}"/>
    ${movie.Title} ${movie.Year}
  `;
  },

  inputValue(movie) {
    return movie.Title;
  },

  // The OMDB API. Free apikey.
  async fetchData(searchTerm) {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "eef0e908",
        s: searchTerm,
      },
    });

    if (response.data.Error) {
      return [];
    }

    return response.data.Search;
  },
};

// Setup AutoComplete Search With Both Shared and Specific Config - Left Side
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#left-autocomplete"),

  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});

// Setup AutoComplete Search With Both Shared and Specific Config - Right Side
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#right-autocomplete"),

  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});

// To Indicate Responses Received
let leftMovie;
let rightMovie;

// Movie Details By Id Follow Up Request
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: "eef0e908",
      i: movie.imdbID,
    },
  });

  // Render Summary
  summaryElement.innerHTML = movieTemplate(response.data);

  // Store Response Data As They Are Received
  if (side === "left") {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }

  // Check 1 Data Received For Both Searches, Run Comparison And Update Display
  if (leftMovie && rightMovie) {
    runComparison();
  }
};

// Compare Movie Details - Extract Data From DOM For Comparison
const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    // Reset Stat Item Background Colors Before Compare
    leftStat.classList.add("is-primary");
    leftStat.classList.remove("is-warning");
    rightStat.classList.add("is-primary");
    rightStat.classList.remove("is-warning");

    const leftSideValue = parseFloat(leftStat.dataset.value);
    const rightSideValue = parseFloat(rightStat.dataset.value);

    if (rightSideValue > leftSideValue) {
      leftStat.classList.remove("is-primary");
      leftStat.classList.add("is-warning");
    } else if (rightSideValue < leftSideValue) {
      rightStat.classList.remove("is-primary");
      rightStat.classList.add("is-warning");
    } else {
      // Handle equal values, N/A value for one or both
      leftStat.classList.add("is-primary");
      leftStat.classList.remove("is-warning");
      rightStat.classList.add("is-primary");
      rightStat.classList.remove("is-warning");
    }
  });
};

// Movie Details Template
const movieTemplate = (movieDetail) => {
  // Appraoch To Compare - Extract Relevant Data, Store To DOM As data-value Attribute.
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metaScore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
  const awards = movieDetail.Awards.split(" ").reduce(
    (accumulator, current) => {
      const curVal = parseFloat(current);
      if (isNaN(curVal)) {
        return accumulator;
      }
      return accumulator + curVal;
    },
    0
  );

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>

      <div class="media-content">
      <div class="content">
        <h1>${movieDetail.Title}</h1>
        <h4>${movieDetail.Genre}</h4>
        <p>${movieDetail.Plot}</p>
      </div>
    </article>

    <article data-value=${awards} class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>

    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>

    <article data-value=${metaScore} class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>

    <article data-value=${imdbRating} class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>

    <article data-value=${imdbVotes} class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};

/*
  Search by title: http://www.omdbapi.com?apikey=eef0e908&s=avengers
  Search by id (details): http://www.omdbapi.com/?apikey=eef0e908&i=tt0848228
  Poster: https://m.media-amazon.com/images/M/MV5BNDYxNjQyMjAtNTdiOS00NGYwLWFmNTAtNThmYjU5ZGI2YTI1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg
*/

/*
  // 1 Ref - Before Debounce Function
  // The OMDB API. Free apikey.
  const fetchdata = async (searchTerm) => {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "eef0e908",
        s: searchTerm,
      },
    });

    console.log(response);
  };

  const input = document.querySelector("input");

  let timeoutId;
  const onInput = (event) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fetchdata(event.target.value);
    }, 2000);
  };

  input.addEventListener("input", onInput);
  */
