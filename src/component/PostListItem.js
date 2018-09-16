import React from 'react'
import styled from 'styled-components'
import hoverCss from './hoverCss'

const Wrapper = styled.div`
  margin: 3rem auto;
  text-align: center;
  padding: 1rem;
  ${hoverCss}
`

const Meta = styled.div`
  font-size: 0.75rem;
`

const Title = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0.2rem 0;
`

const Description = styled.div`
  color: #333333;
  font-size: 0.8rem;
  line-height: 1.2rem;
`

const maxLength = 100;

const PostListItem = ({ title, category, date, description }) => (
  <Wrapper>
    <Meta>{date} &middot; {category}</Meta>
    <Title>{title}</Title>
    {
      description && 
      <Description>
        {description.slice(0, maxLength)}
        {description.length > maxLength && '...'}
      </Description>
    }
  </Wrapper>
)

export default PostListItem
