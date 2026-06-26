import { useState, useEffect, useCallback } from 'react';
import { fetchActivityFeed, generateMockActivityEvents } from '../services/activityApi';
import type { ActivityEvent, ActivityType } from '../types/activity';
import { formatTimestamp } from '../utils/formatTime';

// Helper to get icon/color based on activity type
const getActivityTypeStyle = (type: ActivityType) => {
  const styles: Record<ActivityType, { color: string; icon: string; bg: string }> = {
    'notification_sent': { color: '#34d399', icon: '✓', bg: 'rgba(52, 211, 153, 0.12)' },
    'notification_failed': { color: '#f87171', icon: '✕', bg: 'rgba(248, 113, 113, 0.12)' },
    'notification_retried': { color: '#f4b400', icon: '↻', bg: 'rgba(244, 180, 0, 0.12)' },
    'contract_event_received': { color: '#60a5fa', icon: '📡', bg: 'rgba(96, 165, 250, 0.12)' },
    'preference_updated': { color: '#a78bfa', icon: '⚙', bg: 'rgba(167, 139, 250, 0.12)' },
    'template_created': { color: '#38bdf8', icon: '📄', bg: 'rgba(56, 189, 248, 0.12)' },
    'template_updated': { color: '#22d3ee', icon: '📝', bg: 'rgba(34, 211, 238, 0.12)' },
    'webhook_received': { color: '#fb923c', icon: '🔗', bg: 'rgba(251, 146, 60, 0.12)' },
  };
  return styles[type] || styles['contract_event_received'];
};

// Individual activity event card
const ActivityEventCard = ({ event }: { event: ActivityEvent }) => {
  const style = getActivityTypeStyle(event.type);
  return (
    <div
      className={`activity-event ${!event.read ? 'activity-event--unread' : ''}`}
      role="article"
      aria-label={event.message}
    >
      <div
        className="activity-event__icon"
        style={{ backgroundColor: style.bg, color: style.color }}
        aria-hidden="true"
      >
        {style.icon}
      </div>
      <div className="activity-event__content">
        <div className="activity-event__header">
          <span className="activity-event__type" style={{ color: style.color }}>
            {event.type.replace(/_/g, ' ')}
          </span>
          <time className="activity-event__time" dateTime={new Date(event.timestamp).toISOString()}>
            {formatTimestamp(event.timestamp)}
          </time>
        </div>
        <p className="activity-event__message">{event.message}</p>
        {Object.keys(event.metadata).length > 0 && (
          <div className="activity-event__metadata">
            {Object.entries(event.metadata).map(([key, value]) => (
              value && (
                <span key={key} className="activity-event__metadata-item">
                  <span className="activity-event__metadata-key">{key}:</span>
                  <span className="activity-event__metadata-value">{String(value)}</span>
                </span>
              )
            ))}
          </div>
        )}
      </div>
      {!event.read && <div className="activity-event__unread-indicator" aria-hidden="true" />}
    </div>
  );
};

// Skeleton loader for activity events
const ActivitySkeleton = () => (
  <div className="activity-event activity-event--skeleton">
    <div className="activity-event__icon activity-event__icon--skeleton" />
    <div className="activity-event__content activity-event__content--skeleton">
      <div className="activity-event__skeleton-line" style={{ width: '40%' }} />
      <div className="activity-event__skeleton-line" style={{ width: '70%' }} />
      <div className="activity-event__skeleton-line" style={{ width: '50%' }} />
    </div>
  </div>
);

// Main ActivityFeed component
export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const pageSize = 20;

  // Load events
  const loadEvents = useCallback(async (pageNum: number, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // Try API first, fallback to mock data
      try {
        const data = await fetchActivityFeed(pageNum, pageSize);
        setEvents(prev => append ? [...prev, ...data.events] : data.events);
        setTotal(data.total);
        setHasMore(data.page * data.pageSize < data.total);
      } catch (err) {
        // Fallback to mock data
        const mockEvents = generateMockActivityEvents(100);
        const start = (pageNum - 1) * pageSize;
        const end = start + pageSize;
        const pageEvents = mockEvents.slice(start, end);
        setEvents(prev => append ? [...prev, ...pageEvents] : pageEvents);
        setTotal(mockEvents.length);
        setHasMore(end < mockEvents.length);
      }
    } catch (err) {
      setError('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Initial load
  useEffect(() => {
    loadEvents(1);
  }, [loadEvents]);

  // Real-time updates simulation
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      const newEvents = generateMockActivityEvents(1);
      setEvents(prev => [newEvents[0], ...prev]);
      setTotal(prev => prev + 1);
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  // Load next page
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadEvents(nextPage, true);
    }
  };

  return (
    <section className="activity-feed" aria-labelledby="activity-feed-title">
      <div className="activity-feed__header">
        <div>
          <h2 id="activity-feed-title" className="activity-feed__title">
            Activity Feed
          </h2>
          <p className="activity-feed__subtitle">
            Recent actions and system events ({total} total)
          </p>
        </div>
        <button
          type="button"
          className={`activity-feed__toggle-realtime ${realTimeEnabled ? 'activity-feed__toggle-realtime--active' : ''}`}
          onClick={() => setRealTimeEnabled(!realTimeEnabled)}
          aria-pressed={realTimeEnabled}
        >
          {realTimeEnabled ? '🔴 Live' : '⏸ Paused'}
        </button>
      </div>

      {error && (
        <div className="activity-feed__error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="activity-feed__retry"
            onClick={() => loadEvents(1)}
          >
            Retry
          </button>
        </div>
      )}

      <div className="activity-feed__list" role="list" aria-label="Activity events">
        {loading && events.length === 0 ? (
          // Show skeletons for initial load
          Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />)
        ) : events.length === 0 ? (
          <div className="activity-feed__empty" role="status">
            <p>No activity yet</p>
          </div>
        ) : (
          events.map(event => (
            <ActivityEventCard key={event.id} event={event} />
          ))
        )}
      </div>

      {hasMore && (
        <div className="activity-feed__load-more">
          <button
            type="button"
            className="activity-feed__load-more-btn"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </section>
  );
}
