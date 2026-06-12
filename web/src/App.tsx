import { useEffect, useState } from 'react';
import { TicketList } from './TicketList';
import { TicketDetail } from './TicketDetail';

function parseRoute(hash: string): { ticketId: number | null } {
  const match = hash.match(/^#\/tickets\/(\d+)$/);
  return { ticketId: match ? Number(match[1]) : null };
}

export function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className="container">
      <header>
        <h1>
          <a href="#/">DeskLine</a>
        </h1>
      </header>
      <main>
        {route.ticketId !== null ? <TicketDetail id={route.ticketId} /> : <TicketList />}
      </main>
    </div>
  );
}
