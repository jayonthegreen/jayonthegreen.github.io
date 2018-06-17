import React from 'react'
import styled from 'styled-components'
import { media } from '../utils/style'

const Wrapper = styled.div`
  margin: 1rem 0; 
  ${media.mobile`margin: 0.5rem 0;`}
`

const Meta = styled.div`
  font-size: 0.75rem;
  color: #666666;
  margin-bottom: 0.1rem;
`

const Title = styled.div`
  color: #333333;
  font-size: 1.0rem;
  margin-bottom: 0.2rem;
`

const Description = styled.div`
  color: #333333;
  font-size: 0.8rem;
  line-height: 1.2rem;
`

const maxLength = 200;

const PostListItem = ({ title, category, date, description }) => (
  <Wrapper>
    <Meta>{date}&middot;{category}</Meta>
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

const getEmoji = (key) => CATEGORY_EMOJI_MAP[key] || CATEGORY_EMOJI_MAP.default;

export default PostListItem
