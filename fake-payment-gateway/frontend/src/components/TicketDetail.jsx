import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { formatCurrency, TICKET_STATUS } from '../data/mockData';
import './TicketDetail.css';

/**
 * TicketDetail — Detail view panel (65% bên phải).
 * Hiển thị chi tiết booking: thông tin KH, vé, tổng tiền, bằng chứng CK, actions.
 */
export default function TicketDetail({ ticket, onResolve }) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  if (!ticket) {
    return (
      <section className="ticket-detail-panel ticket-detail--empty" id="ticket-detail-panel">
        <div className="ticket-detail__placeholder">
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--outline-variant)' }}>
            confirmation_number
          </span>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', marginTop: 16 }}>
            Chọn một vé từ danh sách để xem chi tiết
          </p>
        </div>
      </section>
    );
  }

  const isPending = ticket.status === TICKET_STATUS.PENDING;

  const handleCopy = () => {
    navigator.clipboard?.writeText(ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      if (onResolve) {
        await onResolve(ticket.id, 'success');
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      if (onResolve) {
        await onResolve(ticket.id, 'failed');
      }
    } finally {
      setRejecting(false);
    }
  };


  return (
    <section className="ticket-detail-panel animate-slide-right" key={ticket.id} id="ticket-detail-panel">
      {/* ---- Header ---- */}
      <div className="ticket-detail__header">
        <div className="ticket-detail__header-left">
          <span className="text-caption ticket-detail__kicker">CHI TIẾT ĐẶT VÉ</span>
          <h2 className="text-headline-md ticket-detail__ticket-id">
            Mã vé: {ticket.id}
            <button
              className="ticket-detail__copy-btn"
              onClick={handleCopy}
              aria-label="Sao chép mã vé"
              title={copied ? 'Đã sao chép!' : 'Sao chép mã vé'}
            >
              <span className="material-symbols-outlined icon-md">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>
          </h2>
        </div>
        <StatusBadge status={ticket.status} showIcon />
      </div>

      {/* ---- Scrollable Content ---- */}
      <div className="ticket-detail__content hide-scrollbar">
        {/* Customer Info Section */}
        <div className="detail-section">
          <h3 className="detail-section__title text-section-title">
            <span className="detail-section__accent" />
            Thông tin khách hàng
          </h3>
          <div className="info-card">
            <div className="info-grid info-grid--2col">
              <div className="info-field">
                <span className="info-field__label text-label-sm">Họ và tên</span>
                <span className="info-field__value text-body-lg">{ticket.customerName}</span>
              </div>
              <div className="info-field">
                <span className="info-field__label text-label-sm">Số điện thoại</span>
                <span className="info-field__value text-body-lg">{ticket.phone}</span>
              </div>
              <div className="info-field info-field--full">
                <span className="info-field__label text-label-sm">Email</span>
                <span className="info-field__value text-body-lg">{ticket.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Info Section */}
        <div className="detail-section">
          <h3 className="detail-section__title text-section-title">
            <span className="detail-section__accent" />
            Thông tin vé
          </h3>
          <div className="ticket-info-card">
            {/* Movie Info */}
            <div className="ticket-info-row ticket-info-row--highlight">
              <div className="info-field">
                <span className="info-field__label text-label-sm">Phim</span>
                <span className="info-field__value text-body-lg">{ticket.movieTitle}</span>
              </div>
              <div className="info-field">
                <span className="info-field__label text-label-sm">Rạp</span>
                <span className="info-field__value text-body-lg">{ticket.cinema}</span>
              </div>
            </div>

            {/* Type & Quantity */}
            <div className="ticket-info-row">
              <div className="info-field">
                <span className="info-field__label text-label-sm">Loại vé</span>
                <span className="info-field__value text-body-lg">{ticket.ticketType}</span>
              </div>
              <div className="info-field">
                <span className="info-field__label text-label-sm">Số lượng</span>
                <span className="info-field__value text-body-lg">
                  {String(ticket.quantity).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="ticket-info-row">
              <div className="info-field">
                <span className="info-field__label text-label-sm">Ngày chiếu</span>
                <span className="info-field__value text-body-lg">{ticket.date}</span>
              </div>
              <div className="info-field">
                <span className="info-field__label text-label-sm">Giờ chiếu</span>
                <span className="info-field__value text-body-lg">{ticket.departureTime}</span>
              </div>
            </div>

            {/* Room & Seats */}
            <div className="ticket-info-row">
              <div className="info-field">
                <span className="info-field__label text-label-sm">Phòng chiếu</span>
                <span className="info-field__value text-body-lg">{ticket.room}</span>
              </div>
              <div className="info-field">
                <span className="info-field__label text-label-sm">Ghế</span>
                <span className="info-field__value text-body-lg">{ticket.seats.join(', ')}</span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="payment-summary">
              <div className="payment-summary__row">
                <span className="text-label-sm payment-summary__label">Tạm tính</span>
                <span className="text-body-md">{formatCurrency(ticket.subtotal)}</span>
              </div>
              <div className="payment-summary__row">
                <span className="text-label-sm payment-summary__label">Giảm giá</span>
                <span className="text-body-md">{formatCurrency(ticket.discount)}</span>
              </div>
              <div className="payment-summary__divider" />
              <div className="payment-summary__row payment-summary__row--total">
                <span className="text-section-title">Tổng tiền</span>
                <span className="text-headline-md payment-summary__total-value">
                  {formatCurrency(ticket.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Proof of Payment */}
        <div className="detail-section">
          <h3 className="detail-section__title text-section-title">
            <span className="detail-section__accent" />
            Bằng chứng chuyển khoản
          </h3>
          <div className="proof-upload" id="proof-upload">
            <span className="material-symbols-outlined proof-upload__icon">cloud_upload</span>
            <span className="text-body-md proof-upload__text">
              Nhấn để xem hoặc tải lên UNC
            </span>
          </div>
        </div>
      </div>

      {/* ---- Action Footer ---- */}
      <div className="ticket-detail__footer">
        <button
          className="btn-action btn-action--reject"
          onClick={handleReject}
          disabled={!isPending || rejecting}
          id="btn-reject"
        >
          {rejecting ? (
            <>
              <span className="btn-spinner" />
              Đang xử lý...
            </>
          ) : (
            'Từ chối'
          )}
        </button>
        <button
          className="btn-action btn-action--confirm"
          onClick={handleConfirm}
          disabled={!isPending || confirming}
          id="btn-confirm"
        >
          {confirming ? (
            <>
              <span className="btn-spinner" />
              Đang xác thực...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined icon-md">check_circle</span>
              Xác thực thanh toán
            </>
          )}
        </button>
      </div>
    </section>
  );
}
