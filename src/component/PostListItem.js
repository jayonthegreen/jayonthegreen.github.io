import React from 'react'
import { navigateTo } from 'gatsby-link'
import styled from 'styled-components'

const Wrapper = styled.div`
  margin: 1rem;
`

const Date = styled.div`
  color: #666666;
`

const Title = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
`

const PostListItem = ({ title, date, excerpt }) => (
  <Wrapper>
    <Date>{date}</Date>
    <Title>{title}</Title>
  </Wrapper>
)

export default PostListItem
