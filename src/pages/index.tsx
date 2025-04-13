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
      <ul >
        {edges.map(({ node }) => (
          <a href={node.fields.slug} key={node.frontmatter.title}>
            <li key={node.frontmatter.title}>
              <h2>{node.frontmatter.title}</h2>
              <h3>{node.frontmatter.description}</h3>
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
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
            date
            description
          }
          fields {
            slug}
          html
        }
      }
    }
  }
`