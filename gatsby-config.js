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
        exclude: [`/drafts`],
      },
    }
  ],
}
