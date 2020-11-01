import { css } from 'styled-components'

export const hoverCss =  css`
    transition:all 0.3s ease;
  &:hover{
    background-color: var(--hover-color);
    border-radius: 3px;
  }
`;

export default hoverCss;
  