import { CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react';

export function CinemasPage() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <h1>Cinemas</h1>
        <p>Manage cinema locations here.</p>
      </div>

      <CCard>
        <CCardBody>
          <CCardTitle>Cinemas placeholder</CCardTitle>
          <CCardText>CRUD screens for cinemas will be implemented in the next step.</CCardText>
        </CCardBody>
      </CCard>
    </section>
  );
}
