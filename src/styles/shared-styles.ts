import { css } from 'lit';

// these styles can be imported from any component
// for an example of how to use this, check /pages/about-about.ts
export const styles = css`
  #pageContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  sl-card {
    padding: 18px;
    max-width: 500px;
  }

  main {
    padding-top: 34px;
  }
`;

