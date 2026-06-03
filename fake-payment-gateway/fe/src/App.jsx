import { useState } from 'react';
import TopNavBar from './components/TopNavBar';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import { mockTickets } from './data/mockData';
import './App.css';

/**
 * App — VeriPay Admin main layout.
 * Master-Detail pattern: List (35%) | Detail (65%).
 */
export default function App() {
  const [selectedId, setSelectedId] = useState(mockTickets[0]?.id || null);

  const selectedTicket = mockTickets.find((t) => t.id === selectedId) || null;

  return (
    <div className="app" id="app-root">
      <TopNavBar />
      <main className="app__main">
        <div className="app__container">
          {/* Left Column — 35% */}
          <div className="app__list-col">
            <TicketList
              tickets={mockTickets}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Right Column — 65% */}
          <div className="app__detail-col">
            <TicketDetail ticket={selectedTicket} />
          </div>
        </div>
      </main>
    </div>
  );
}
