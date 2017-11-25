import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import styled from 'styled-components'

import './Header.css'

const HeaderWrapper = styled.div`
  margin-bottom: 1.45rem;
  padding: 1.45rem 1rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  opacity: 0.9;
  display: flex;
`

const HeaderTitle = styled(Link)`
  text-decoration: none;
    color: inherit;
`

const Header = () => (
  <HeaderWrapper className='Header'>
    <HeaderTitle to="/">Holdonnn!!!!</HeaderTitle>
  </HeaderWrapper>
);

export default Header;