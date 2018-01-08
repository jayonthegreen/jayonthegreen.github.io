import ReactGA from 'react-ga';
ReactGA.initialize('UA-77395473-1');

exports.onRouteUpdate = (state, page, pages) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.pageview(state.location.pathname);
  }
};