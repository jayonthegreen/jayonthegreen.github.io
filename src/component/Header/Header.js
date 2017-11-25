import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'

import './Header.css';

const Header = () => (
  <div className="Header">
    <div className="Header__container">
      <h1 className="Header__title">
        <Link to="/" className="Header__title-link">Holdonnn</Link>
      </h1>
    </div>
  </div>
);

export default Header;