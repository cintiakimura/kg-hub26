import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function ManagerCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    start: '',
    end: ''
  });

  useEffect(() => {
    loadEvents();
  }, [currentDate, view]);

  const loadEvents = async () => {
    setLoading(true);
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(currentDate);
    if (view === 'week') {
      end.setDate(end.getDate() + 7);
    } else {
      end.setDate(end.getDate() + 1);
    }
    end.setHours(23, 59, 59, 999);

    const { data } = await base44.functions.invoke('calendar', {
      action: 'list',
      timeMin: start.toISOString(),
      timeMax: end.toISOString()
    });

    setEvents(data || []);
    setLoading(false);
  };

  const createEvent = async () => {
    await base44.functions.invoke('calendar', {
      action: 'create',
      eventData: {
        summary: newEvent.summary,
        description: newEvent.description,
        start: { dateTime: newEvent.start, timeZone: 'UTC' },
        end: { dateTime: newEvent.end, timeZone: 'UTC' }
      }
    });

    setShowModal(false);
    setNewEvent({ summary: '', description: '', start: '', end: '' });
    loadEvents();
  };

  const goBack = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - (view === 'week' ? 7 : 1));
    setCurrentDate(d);
  };

  const goForward = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (view === 'week' ? 7 : 1));
    setCurrentDate(d);
  };

  const getDayEvents = (day) => {
    return events.filter(e => {
      const eventDate = new Date(e.start.dateTime || e.start.date);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  const renderWeekView = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayEvents = getDayEvents(day);
          return (
            <div key={day.toISOString()} className="border border-[#00c600] rounded p-2 min-h-[200px]">
              <div className="text-sm mb-2 opacity-70">
                {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              {dayEvents.map((event, idx) => (
                <div key={idx} className="bg-[#00c600] bg-opacity-20 rounded p-1 mb-1 text-xs">
                  <div>{event.summary}</div>
                  <div className="opacity-70">
                    {new Date(event.start.dateTime || event.start.date).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getDayEvents(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="border border-[#00c600] rounded">
        {hours.map(hour => (
          <div key={hour} className="border-b border-[#00c600] p-2 flex">
            <div className="w-16 opacity-70">{hour}:00</div>
            <div className="flex-1">
              {dayEvents
                .filter(e => new Date(e.start.dateTime || e.start.date).getHours() === hour)
                .map((event, idx) => (
                  <div key={idx} className="bg-[#00c600] bg-opacity-20 rounded p-2 mb-1">
                    <div className="font-medium">{event.summary}</div>
                    <div className="text-xs opacity-70">{event.description}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-[#00c600]">Calendar</h1>
        <div className="flex gap-2">
          <button onClick={() => setView(view === 'week' ? 'day' : 'week')}>
            {view === 'week' ? 'Day View' : 'Week View'}
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={goBack}>
          <ChevronLeft size={20} />
        </button>
        <div className="text-lg">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={goForward}>
          <ChevronRight size={20} />
        </button>
      </div>

      {view === 'week' ? renderWeekView() : renderDayView()}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#212121] border border-[#00c600] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl mb-4">Add Event</h2>
            <input
              placeholder="Event Title"
              value={newEvent.summary}
              onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
              className="w-full mb-3"
            />
            <textarea
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full mb-3"
              rows={3}
            />
            <input
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
              className="w-full mb-3"
            />
            <input
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
              className="w-full mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1">Cancel</button>
              <button onClick={createEvent} className="flex-1">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}