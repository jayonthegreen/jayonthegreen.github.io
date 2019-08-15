import ReactGA from 'react-ga';
import "./src/styles/reset.css"
import "./src/styles/global.css"
import "./src/styles/spoqa-han-sans.css"


ReactGA.initialize('UA-77395473-1');

export const onRouteUpdate = (state, page, pages) => {
  if ( state.location.search.includes('isAdmin') ) {
    window.localStorage.setItem('isAmdin', 'true');
  }
  if (process.env.NODE_ENV === 'production' && !window.localStorage.getItem('isAmdin')) {
    ReactGA.pageview(state.location.pathname);
  }
};
