import ReactGA from 'react-ga';
ReactGA.initialize('UA-77395473-1');

exports.onRouteUpdate = (state, page, pages) => {
  try{
    const query  = state.location.search.substring(1);
    if ( query.includes('isAdmin') ) {
      window.localStorage.setItem('isAmdin', 'true');
    }
  } catch (e){
    throw new Error(e);
  }
  if (process.env.NODE_ENV === 'production' && !window.localStorage.getItem('isAmdin')) {
    ReactGA.pageview(state.location.pathname);
    console.log('[ok]ReactGA.pageview');
  } else {
    console.log('[not ok]ReactGA.pageview ');
  }
};