import { CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react';

export function RoomsPage() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <h1>Rooms</h1>
        <p>Manage screening rooms and seat layouts here.</p>
      </div>

      <CCard>
        <CCardBody>
          <CCardTitle>Rooms placeholder</CCardTitle>
          <CCardText>CRUD screens for rooms will be implemented in the next step.</CCardText>
        </CCardBody>
      </CCard>
    </section>
  );
}
