import { CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react';

export function UsersPage() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <h1>Users</h1>
        <p>Manage customer and admin accounts here.</p>
      </div>

      <CCard>
        <CCardBody>
          <CCardTitle>Users placeholder</CCardTitle>
          <CCardText>User management screens will be implemented in the next step.</CCardText>
        </CCardBody>
      </CCard>
    </section>
  );
}
