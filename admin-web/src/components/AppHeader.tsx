import CIcon from '@coreui/icons-react';
import { cilMenu } from '@coreui/icons';
import { CContainer, CHeader, CHeaderBrand, CHeaderToggler } from '@coreui/react';

type AppHeaderProps = {
  onSidebarToggle: () => void;
};

export function AppHeader({ onSidebarToggle }: AppHeaderProps) {
  return (
    <CHeader position="sticky" className="admin-header border-bottom">
      <CContainer fluid>
        <CHeaderToggler
          aria-label="Toggle sidebar"
          className="px-md-0 me-md-3"
          onClick={onSidebarToggle}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderBrand className="fw-semibold">Admin Console</CHeaderBrand>
      </CContainer>
    </CHeader>
  );
}
