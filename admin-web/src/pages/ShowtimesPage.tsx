import { CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react';

export function ShowtimesPage() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <h1>Showtimes</h1>
        <p>Manage movie schedules and room assignments here.</p>
      </div>

      <CCard>
        <CCardBody>
          <CCardTitle>Showtimes placeholder</CCardTitle>
          <CCardText>CRUD screens for showtimes will be implemented in the next step.</CCardText>
        </CCardBody>
      </CCard>
    </section>
  );
}
