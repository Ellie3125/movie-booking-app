import { useState, useEffect } from 'react';
import TopNavBar from './components/TopNavBar';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import './App.css';

/**
 * App — VeriPay Admin main layout.
 * Master-Detail pattern: List (35%) | Detail (65%).
 */
export default function App() {
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:4501/gateway/api/payment-requests');
      const body = await response.json();
      if (body.success) {
        // Ánh xạ dữ liệu in-memory từ gateway sang cấu hình UI hiện tại
        const mapped = body.data.map((p) => {
          let status = 'pending';
          if (p.status === 'SUCCESS') status = 'paid';
          if (p.status === 'FAILED') status = 'failed';
          if (p.status === 'CANCELLED' || p.status === 'EXPIRED') status = 'cancelled';

          return {
            id: p.paymentId,
            bookingId: p.bookingId,
            customerName: p.customerName || 'N/A',
            phone: p.phone || 'N/A',
            email: p.email || 'N/A',
            amount: p.amount,
            status,
            time: new Date(p.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(p.createdAt).toLocaleDateString('vi-VN'),
            ticketType: 'Vé xem phim',
            quantity: p.seats ? p.seats.length : 0,
            departureTime: new Date(p.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            movieTitle: p.movieTitle || 'N/A',
            cinema: p.cinema || 'N/A',
            room: p.room || 'N/A',
            seats: p.seats || [],
            subtotal: p.amount,
            discount: 0,
            total: p.amount,
          };
        });

        setTickets(mapped);

        // Nếu chưa chọn ticket nào và có danh sách, mặc định chọn ticket đầu tiên
        if (mapped.length > 0 && !selectedId) {
          setSelectedId(mapped[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching payment requests:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTickets().finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:4501/gateway/api/payment-requests/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchTickets();
      } else {
        alert(data.message || 'Lỗi khi xử lý giao dịch');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến cổng thanh toán giả lập');
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedId) || null;

  return (
    <div className="app" id="app-root">
      <TopNavBar />
      <main className="app__main">
        <div className="app__container">
          {/* Left Column — 35% */}
          <div className="app__list-col">
            <TicketList
              tickets={tickets}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onRefresh={fetchTickets}
            />
          </div>

          {/* Right Column — 65% */}
          <div className="app__detail-col">
            <TicketDetail ticket={selectedTicket} onResolve={handleResolve} />
          </div>
        </div>
      </main>
    </div>
  );
}
