import { CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react';

export function MoviesPage() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <h1>Movies</h1>
        <p>Manage movie catalog data here.</p>
      </div>

      <CCard>
        <CCardBody>
          <CCardTitle>Movies placeholder</CCardTitle>
          <CCardText>CRUD screens for movies will be implemented in the next step.</CCardText>
        </CCardBody>
      </CCard>
    </section>
  );
}
