import React from 'react'
import {graphql, StaticQuery, useStaticQuery} from 'gatsby'
import Layout from '../component/Layout'
import PostList from '../component/PostList'
import pathsToTree from "../utils/pathsToTree";



export default function IndexPage() {
    const data = useStaticQuery(query2)
    const posts = data.allFile.edges.map(({node}) => ({
                id: node.id,
                relativePath: node.relativePath,
                href: node.relativePath.split('pages')[1].replace('.md','/'),
                title: node.name
            }
        )
    )

    // console.log(pathsToTree(posts.map(post => post.relativePath)))
    return (<Layout><PostList posts={posts}/></Layout>)
}


const query2 = graphql`
query {
  allFile(
    filter: { 
      sourceInstanceName: { eq: "src" },
      extension: { eq: "md" }
    },
    sort:{ modifiedTime: DESC}
  ) {
    edges {
      node {
        id
        name 
        relativePath
        extension
        modifiedTime
      }
    }
  }
}
`



