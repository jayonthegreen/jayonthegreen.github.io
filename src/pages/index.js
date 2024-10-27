import React from 'react'
import {graphql} from 'gatsby'
import Layout from '../component/Layout'
import PostList from '../component/PostList'
import Helmet from "react-helmet";
import styled from 'styled-components';

const ImageContainer = styled.div`
  width: 100%; /* 원하는 너비에 맞추세요 */
  aspect-ratio: 16 / 6;
  overflow: hidden;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;


class IndexPage extends React.Component {
    render() {
        return (
            <Layout>
                <Helmet>
                    <link rel="canonical" href="https://jayonthegreen.github.io"/>
                </Helmet>
                {/*<ImageContainer>*/}
                {/*    <StyledImage src="/img/CE126160-C3DD-48B2-964F-569530639FB9_1_201_a.jpeg" alt="sample image" />*/}
                {/*</ImageContainer>*/}
                <PostList
                    markdownNodes={this.props.data.allMarkdownRemark.edges.map(
                        ({node}) => node
                    )}
                />
            </Layout>
        )
    }
}

export default IndexPage

export const query = graphql`
query IndexQuery {
  allMarkdownRemark(sort: {frontmatter: {date: DESC}}) {
    totalCount
    edges {
      node {
        id
        frontmatter {
          title
          date(formatString: "YYYY.MM.DD")
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
