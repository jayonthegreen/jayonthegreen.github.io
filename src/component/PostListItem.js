import React from 'react'
import styled from 'styled-components'
import { media } from '../utils/style'

const Wrapper = styled.div`
  margin: 0 1rem;
  border-bottom: 1px solid #cccccc;
  padding: 1rem 0;
   ${
  media.mobile`
  margin: 0;
  `
  }
`

const Date = styled.div`
  color: #666666;
  margin-bottom: 0.1rem;
`

const Title = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
`

const maxLength = 120;

const PostListItem = ({ title, category, date, description }) => (
  <Wrapper>
    <Date>{date}</Date>
    <Title>{ getEmoji(category)} {title}</Title>
    {
      description && description.slice(0, maxLength)
    }
    {
      description && description.length > maxLength && '...'
    }
  </Wrapper>
)

const CATEGORY_EMOJI_MAP = {
  'book': '📚',
  'movie': '🎥',
  'essay': '🤔',
  'default': '🤔',
}

const getEmoji = (key) => CATEGORY_EMOJI_MAP[key] || CATEGORY_EMOJI_MAP.default;

export default PostListItem
