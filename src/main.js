const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  params: {
    'api_key': API_KEY,
  },
});


// Utils
// Haciendo lazy loading
/*
  Para hacer lazy loading se debe tener presente asignar un min heigth a las 
  imagenes por que de no tenerlo no se activara correctamente el intersection observer
*/

const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {

      console.log({entry})

        if (entry.isIntersecting){
          const url = entry.target.getAttribute('data-img')
          // console.log(entry.target)
          entry.target.setAttribute('src', url)
        }

    })
});

function createMovies(
  movies,
  container,
  {
    lazyLoad = false, 
    clean = true
  }
) {

  if (clean){
    container.innerHTML = '';
  }
 

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');
    movieContainer.addEventListener('click', () => {
      location.hash = '#movie=' + movie.id;
    });

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);
    
    movieImg.setAttribute(
      lazyLoad ? 'data-img' : 'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path,
    );
     movieImg.addEventListener('error', () => {
      movieImg.setAttribute('src', 'https://img.freepik.com/vector-gratis/ups-error-404-ilustracion-concepto-robot-roto_114360-5529.jpg?w=900&t=st=1703890651~exp=1703891251~hmac=16d612a84e3a96529755ecc3a98558b1776daeed22e03eb263962c5c17f23d2d');
    });

    

    if(lazyLoad){
      lazyLoader.observe(movieImg)
    }
    

    movieContainer.appendChild(movieImg);
    container.appendChild(movieContainer);
  });
}

function createCategories(categories, container) {
  container.innerHTML = "";

  categories.forEach(category => {  
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' + category.id);
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryTitleText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}

// Llamados a la API

async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;
  console.log(movies)

  createMovies(movies, trendingMoviesPreviewList, {lazyLoad: true,});
}

async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list');
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList)  ;
}

async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection, {lazyLoad: true,});
}

async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query,
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection, {lazyLoad: true,});
}

async function getTrendingMovies() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;

  console.log(movies)

  createMovies(movies, genericSection, {lazyLoad: true,});

  const btnLoadMore = document.createElement('button');
  btnLoadMore.innerText = 'Cargar mas'
  btnLoadMore.addEventListener('click', getPaginatedTrendingMovies)
  btnLoadMore.setAttribute('id', "btnCarga")
  genericSection.appendChild(btnLoadMore)


}

let page = 1;

async function getPaginatedTrendingMovies(){
  page++;
  const { data } = await api('trending/movie/day', {
    params: {
      page:page,
    },
  })
  const movies = data.results;
  createMovies(
    movies,
    genericSection,
    {
      lazyLoad: true,
      clean: false
    }
  );

  
  const oldBtnCarga = document.querySelector('#btnCarga')
  genericSection.removeChild(oldBtnCarga)

  const btnLoadMore = document.createElement('button');
  btnLoadMore.innerText = 'Cargar mas'
  btnLoadMore.addEventListener('click', getPaginatedTrendingMovies)
  btnLoadMore.setAttribute('id', "btnCarga")
  genericSection.appendChild(btnLoadMore)
}

async function getMovieById(id) {
  const { data: movie } = await api('movie/' + id);

  const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  console.log(movieImgUrl)
  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;
  
  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);

  getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
  const { data } = await api(`movie/${id}/recommendations`);
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer, {lazyLoad: true,});
}
