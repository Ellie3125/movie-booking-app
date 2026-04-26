import { CCard, CCardBody, CCardText, CCardTitle, CCol, CRow } from '@coreui/react';

const dashboardCards = [
  { title: 'Movies', description: 'Catalog management placeholder.' },
  { title: 'Showtimes', description: 'Schedule management placeholder.' },
  { title: 'Bookings', description: 'Booking operations placeholder.' },
];

export function DashboardPage() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <h1>Dashboard</h1>
        <p>Admin overview placeholder for the movie booking system.</p>
      </div>

      <CRow className="g-4">
        {dashboardCards.map((card) => (
          <CCol md={4} key={card.title}>
            <CCard className="h-100">
              <CCardBody>
                <CCardTitle>{card.title}</CCardTitle>
                <CCardText>{card.description}</CCardText>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </section>
  );
}
