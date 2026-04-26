import { CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react';

export function BookingsPage() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <h1>Bookings</h1>
        <p>Review booking records and operational status here.</p>
      </div>

      <CCard>
        <CCardBody>
          <CCardTitle>Bookings placeholder</CCardTitle>
          <CCardText>Booking list and detail screens will be implemented in the next step.</CCardText>
        </CCardBody>
      </CCard>
    </section>
  );
}
