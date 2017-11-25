import React from 'react'
import { navigateTo } from 'gatsby-link'
import './Post.css'

const Post = ({ title, date, excerpt}) => (
    <div className='Post' onClick={ () => navigateTo('/test')}>
        <div className='Post__date'>{date}</div> 
        <div className='Post__title'>{title}</div> 
    </div>
)

export default Post;