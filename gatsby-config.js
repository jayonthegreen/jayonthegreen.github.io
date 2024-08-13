module.exports = {
    siteMetadata: {
        title: `byjay`,
        image: `/img/og.jpeg`,
        siteUrl: `https://byjay.github.io`,
    },
    plugins: [
        'gatsby-plugin-netlify-cms',
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `src`,
                path: `${__dirname}/src/`,
            },
        },
        `gatsby-plugin-react-helmet`,
        `gatsby-transformer-remark`,
        `gatsby-plugin-styled-components`,
        {
            resolve: `gatsby-plugin-sitemap`,
            options: {
                query: `
        {
          site {
            siteMetadata {
              siteUrl
            }
          }
          allSitePage {
            nodes {
              path
              pageContext
            }
          }
        }
        `,
                serialize: ({path, pageContext}) => {
                    return {
                        url: path,
                        // for YYYY-mm-dd, see https://developers.google.com/search/blog/2006/04/using-lastmod-attribute
                        lastmod: pageContext?.lastMod.split('T')[0]
                        ,
                    }
                },
            },
        },
        `gatsby-plugin-git-lastmod`,

        {
            resolve: `gatsby-plugin-gtag`,
            options: {
                trackingId: `G-P76W5VY5NZ`,
                head: true,
            },
        },
    ],
}
