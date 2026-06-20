import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedDate, setSelectedTime, setSelectedTheatre, setSelectedShowtime } from '../store/bookingSlice';
import { fetchShowtimes } from '../services/api';

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Schedule() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedMovie, selectedFormat } = useSelector((s) => s.movies);
  const { selectedDate } = useSelector((s) => s.booking);

  const dates = getNext7Days();
  const [activeDateIdx, setActiveDateIdx] = useState(0);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeDate = dates[activeDateIdx];
  const isoDate = activeDate.toISOString().split('T')[0];

  useEffect(() => {
    if (!selectedMovie) return;
    setLoading(true);
    fetchShowtimes(selectedMovie.id, isoDate)
      .then((r) => setShowtimes(r.data.data))
      .catch(() => setShowtimes([]))
      .finally(() => setLoading(false));
  }, [selectedMovie, isoDate]);

  const handleTimeSelect = (showtime) => {
    dispatch(setSelectedDate(isoDate));
    dispatch(setSelectedTime(showtime.time));
    dispatch(setSelectedTheatre(showtime.theatreId));
    dispatch(setSelectedShowtime({ _id: showtime._id, price: showtime.price, format: showtime.format, time: showtime.time, screen: showtime.screen }));
    navigate('/seats');
  };

  // Group by theatre
  const grouped = showtimes.reduce((acc, st) => {
    const tId = st.theatreId?._id || st.theatreId;
    const tName = st.theatreId?.name || 'Unknown Theatre';
    if (!acc[tId]) acc[tId] = { theatre: st.theatreId, times: [] };
    acc[tId].times.push(st);
    return acc;
  }, {});

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 glass rounded-full flex items-center justify-center">
          <BackIcon />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg">Select Showtime</h1>
          {selectedMovie && <p className="text-white/50 text-xs">{selectedMovie.title} · {selectedFormat}</p>}
        </div>
      </div>

      {/* Date Strip */}
      <div className="px-4 mt-4 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((d, i) => {
            const isActive = i === activeDateIdx;
            return (
              <button
                key={i}
                id={`date-${i}`}
                onClick={() => setActiveDateIdx(i)}
                className={`flex-shrink-0 flex flex-col items-center w-12 py-2.5 rounded-2xl transition-all duration-200 ${
                  isActive ? 'gradient-purple' : 'glass'
                }`}
              >
                <span className={`text-[10px] font-medium ${isActive ? 'text-white/80' : 'text-white/40'}`}>{DAYS[d.getDay()]}</span>
                <span className={`text-lg font-black ${isActive ? 'text-white' : 'text-white'}`}>{d.getDate()}</span>
                <span className={`text-[9px] ${isActive ? 'text-white/80' : 'text-white/40'}`}>{MONTHS[d.getMonth()]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Showtimes */}
      <div className="px-4 flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))
        ) : Object.values(grouped).length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🎭</p>
            <p className="text-white/50 text-sm">No showtimes available for this date</p>
          </div>
        ) : (
          Object.values(grouped).map(({ theatre, times: tTimes }) => (
            <div key={theatre?._id} className="glass rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-semibold text-sm">{theatre?.name}</p>
                  <p className="text-white/40 text-xs">{theatre?.location}</p>
                </div>
                <span className="text-white/30 text-xs">Screen {tTimes[0]?.screen}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {tTimes.map((st) => {
                  const fmt = st.format;
                  const isMatch = fmt === selectedFormat || true; // show all, highlight matching
                  return (
                    <button
                      key={st._id}
                      id={`time-${st._id}`}
                      onClick={() => handleTimeSelect(st)}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all active:scale-95 ${
                        fmt === selectedFormat
                          ? 'gradient-purple text-white border-transparent'
                          : 'border-white/20 text-white hover:border-purple/50'
                      }`}
                    >
                      <span className="font-bold text-sm">{st.time}</span>
                      <span className={`text-[9px] mt-0.5 ${fmt === selectedFormat ? 'text-white/80' : 'text-white/40'}`}>{fmt} · ₹{st.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
