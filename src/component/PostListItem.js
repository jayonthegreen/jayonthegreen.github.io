import React from 'react'
import { navigateTo } from 'gatsby-link'
import styled from 'styled-components'

const PostListItem = ({ title, date, excerpt}) => (
    <div className='Post' onClick={ () => navigateTo('/test')}>
        <div className='Post__date'>{date}</div> 
        <div className='Post__title'>{title}</div> 
    </div>
)

export default PostListItem;