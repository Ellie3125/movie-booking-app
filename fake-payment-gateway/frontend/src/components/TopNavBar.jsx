import './TopNavBar.css';

/**
 * TopNavBar — Header bar chung cho VeriPay Admin.
 * Bao gồm: brand logo, subtitle, notification/settings icons, avatar.
 */
export default function TopNavBar() {
  return (
    <header className="topnav" id="topnav">
      <div className="topnav__inner">
        {/* Brand Section */}
        <div className="topnav__brand">
          <div className="topnav__logo">
            <span className="topnav__logo-mark">V</span>
            <h1 className="topnav__title text-display">VeriPay Admin</h1>
          </div>
          <span className="topnav__subtitle text-label-sm">
            Trang xác thực thanh toán vé
          </span>
        </div>

        {/* Right Actions */}
        <div className="topnav__actions">
          <span className="topnav__user-name text-body-md">Nguyễn Văn Admin</span>

          <button
            className="topnav__icon-btn"
            aria-label="Thông báo"
            title="Thông báo"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="topnav__notif-dot" />
          </button>

          <button
            className="topnav__icon-btn"
            aria-label="Cài đặt"
            title="Cài đặt"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

          <div className="topnav__avatar">
            <div className="topnav__avatar-fallback">VA</div>
          </div>
        </div>
      </div>
    </header>
  );
}
