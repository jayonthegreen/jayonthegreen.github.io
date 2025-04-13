// import type { GatsbyConfig } from "gatsby";

const config = {
  siteMetadata: {
    title: `jay`,
    siteUrl: `https://jayonthegreen.github.io`
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: ["gatsby-plugin-postcss",  "gatsby-plugin-image", "gatsby-plugin-sitemap", {
    resolve: 'gatsby-plugin-manifest',
    options: {
      "icon": "src/images/icon.png"
    }
  }, 
  {
    resolve: 'gatsby-plugin-google-gtag',
    options: {
      "trackingIds": [
        "G-P76W5VY5NZ"
      ]
    }
  },
  "gatsby-plugin-sharp", "gatsby-transformer-sharp", {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "images",
      "path": "./src/images/"
    },
    __key: "images"
  }, {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "pages",
      "path": "./src/pages/"
    },
    __key: "pages"
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `content`,
      path: `${__dirname}/src/content`,
    },
  },  
  `gatsby-transformer-remark`
]
};

export default config;
