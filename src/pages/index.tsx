import * as React from "react"
import { graphql, type HeadFC, type PageProps } from "gatsby"
import Nav from "../Nav"


const IndexPage: React.FC<PageProps> = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  return (
    <main>
      <Nav/>
      <ul 
        style={{padding: 0, margin: 0, listStyle: 'none'}}
      >
        {edges.map(({ node }) => (
          <a href={node.fields.slug} key={node.frontmatter.title} style={{textDecoration: 'none'}}>
            <li key={node.frontmatter.title} 
                style={{listStyle: 'none', margin: '0.5rem 0'}}
            >
              {node.frontmatter.title}
              {" "}
              <p style={{fontSize: 'small', margin: 0,
                 whiteSpace: 'nowrap', 
                 textOverflow: 'ellipsis',
                 overflow: 'hidden',
                 }}>
                <span style={{marginRight: '0.3rem'}}>
                    {node.frontmatter.date.split('.')[0]}·{node.frontmatter.date.split('.')[1]}
                </span>   
              {node.frontmatter.description}
              </p>
            </li>
          </a>
        ))}
      </ul>
    </main>
  )
}


export default IndexPage

export const Head: HeadFC = () => <title>Jay</title>

export const query = graphql`
  query {
    allMarkdownRemark (
        sort: { frontmatter: { date: DESC } }
    ){
      edges {
        node {
          frontmatter {
            title
            date(formatString: "YYYY.MM")
            description
          }
          fields {
            slug
          }
        }
      }
    }
  }
`