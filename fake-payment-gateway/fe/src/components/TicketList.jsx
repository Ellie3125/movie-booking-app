import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { formatCurrency, TICKET_STATUS } from '../data/mockData';
import './TicketList.css';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: TICKET_STATUS.PENDING, label: 'Chờ xác thực' },
  { key: TICKET_STATUS.PAID, label: 'Đã xác thực' },
];

/**
 * TicketList — Master list panel (35% bên trái).
 * Bao gồm SearchBox, filter chips, và danh sách ticket items.
 */
export default function TicketList({ tickets, selectedId, onSelect }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Filter & search logic
  const filtered = tickets.filter((t) => {
    const matchesFilter =
      filter === 'all' ||
      t.status === filter;

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.phone.includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <section className="ticket-list-panel animate-slide-left" id="ticket-list-panel">
      {/* Search Header */}
      <div className="ticket-list__header">
        <h2 className="text-section-title ticket-list__title">Danh sách vé</h2>

        {/* SearchBox */}
        <div className="search-box" id="search-box">
          <div className="search-box__icon">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            id="search-input"
            className="search-box__input text-body-md"
            type="text"
            placeholder="Nhập mã vé, tên KH, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="search-box__clear"
              onClick={() => setSearch('')}
              aria-label="Xoá tìm kiếm"
            >
              <span className="material-symbols-outlined icon-sm">close</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="filter-chips hide-scrollbar">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`filter-chip text-label-sm ${
                filter === opt.key ? 'filter-chip--active' : ''
              }`}
              onClick={() => setFilter(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Items */}
      <div className="ticket-list__body hide-scrollbar">
        {filtered.length === 0 ? (
          <div className="ticket-list__empty">
            <span className="material-symbols-outlined icon-xl">search_off</span>
            <p className="text-body-md">Không tìm thấy vé phù hợp</p>
          </div>
        ) : (
          filtered.map((ticket, index) => (
            <div
              key={ticket.id}
              className={`ticket-item ${
                selectedId === ticket.id ? 'ticket-item--selected' : ''
              }`}
              onClick={() => onSelect(ticket.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(ticket.id);
              }}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="ticket-item__top">
                <div className="ticket-item__info">
                  <span
                    className={`text-label-sm ${
                      selectedId === ticket.id
                        ? 'ticket-item__id--active'
                        : 'ticket-item__id'
                    }`}
                  >
                    {ticket.id}
                  </span>
                  <h3 className="text-body-lg ticket-item__name">{ticket.customerName}</h3>
                </div>
                <span className="text-caption ticket-item__time">{ticket.time}</span>
              </div>
              <div className="ticket-item__bottom">
                <span className="text-label-sm ticket-item__amount">
                  {formatCurrency(ticket.amount)}
                </span>
                <StatusBadge status={ticket.status} size="small" />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
