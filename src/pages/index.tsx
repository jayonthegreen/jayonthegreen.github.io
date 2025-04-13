import * as React from "react"
import { graphql, type HeadFC, type PageProps } from "gatsby"


const IndexPage: React.FC<PageProps> = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  return (
    <main>
      <h1>
        Jay
      </h1>
      <ul >
        {edges.map(({ node }) => (
          <li key={node.frontmatter.title}>
            <h2>{node.frontmatter.title}</h2>
            {node.slug}
          </li>
        ))}
      </ul>
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Jay</title>

export const query = graphql`
  query {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
            date
          }
          html
        }
      }
    }
  }
`