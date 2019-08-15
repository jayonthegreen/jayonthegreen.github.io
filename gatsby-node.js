const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}

exports.createPages = ({ graphql, actions }) => {
    const { createPage } = actions
    return new Promise((resolve) => {
      graphql(
        `
        {
          allMarkdownRemark {
            edges {
              node {
                frontmatter{
                  category
                }
                fields {
                  slug
                }
              }
            }
          }
        }
      `
  ).then(result => {
        const categories = [];
        result.data.allMarkdownRemark.edges.map(({ node }) => {
            createPage({
              path: node.fields.slug,
              component: path.resolve(`./src/templates/post.js`),
              context: {
                // Data passed to context is available in page queries as GraphQL variables.
                slug: node.fields.slug,
              },
            });
            if(!categories.includes(node.frontmatter.category)) {
              categories.push(node.frontmatter.category)
            }
          });

        for(const category of categories) {
          createPage({
            path: `/category/${category}`,
            component: path.resolve(`./src/templates/category.js`),
            context: {
              category,
            }
          });
        }

        resolve()
      })
    })
  };