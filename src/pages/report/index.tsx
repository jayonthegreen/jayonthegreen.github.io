import * as React from "react"
import { graphql, type HeadFC, type PageProps } from "gatsby"
import Nav from "../../Nav"

const ReportPage: React.FC<PageProps> = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  return (
    <main>
      <Nav/>
      <h2 style={{marginBottom: '1rem', fontWeight: 'normal'}}>Reports</h2>
      <ul
        style={{padding: 0, margin: 0, listStyle: 'none'}}
      >
        {edges.map(({ node }) => (
          <a href={node.fields.slug} key={node.fields.slug} style={{textDecoration: 'none'}}>
            <li
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
                    { node.frontmatter.date && node.frontmatter.date.split('.')[0]}·{node.frontmatter.date.split('.')[1]}
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

export default ReportPage

export const Head: HeadFC = () => (
  <>
    <title>Reports - Jay</title>
    <meta name="robots" content="noindex, nofollow" />
  </>
)

export const query = graphql`
  query {
    allMarkdownRemark (
        sort: { frontmatter: { date: DESC } }
        filter: { fileAbsolutePath: { regex: "/pages/report/" } }
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
