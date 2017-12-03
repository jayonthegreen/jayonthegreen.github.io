import ReactGA from 'react-ga';
ReactGA.initialize('UA-77395473-1');

exports.onRouteUpdate = (state, page, pages) => {
  ReactGA.pageview(state.pathname);
};