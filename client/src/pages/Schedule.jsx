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

  const dates = getNext7Days();
  const [activeDateIdx, setActiveDateIdx] = useState(0);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Local state for theatre selection (Screen 3 -> Screen 4)
  const [localTheatre, setLocalTheatre] = useState(null);
  const [selectedSt, setSelectedSt] = useState(null);

  const activeDate = dates[activeDateIdx];
  const isoDate = activeDate.toISOString().split('T')[0];

  useEffect(() => {
    if (!selectedMovie) return;
    setLoading(true);
    fetchShowtimes(selectedMovie.id, isoDate)
      .then((r) => {
        setShowtimes(r.data.data);
      })
      .catch(() => setShowtimes([]))
      .finally(() => setLoading(false));
  }, [selectedMovie, isoDate]);

  // Group showtimes by theatre
  const theatresMap = showtimes.reduce((acc, st) => {
    const t = st.theatreId;
    if (!t) return acc;
    if (!acc[t._id]) {
      acc[t._id] = {
        theatre: t,
        showtimes: [],
        minPrice: st.price,
        maxPrice: st.price,
      };
    }
    acc[t._id].showtimes.push(st);
    acc[t._id].minPrice = Math.min(acc[t._id].minPrice, st.price);
    acc[t._id].maxPrice = Math.max(acc[t._id].maxPrice, st.price);
    return acc;
  }, {});

  const theatresList = Object.values(theatresMap);

  const handleTheatreSelect = (t) => {
    setLocalTheatre(t);
    setSelectedSt(null); // Reset selected time
  };

  const handleNext = () => {
    if (!selectedSt) return;
    dispatch(setSelectedDate(isoDate));
    dispatch(setSelectedTime(selectedSt.time));
    dispatch(setSelectedTheatre(localTheatre));
    dispatch(setSelectedShowtime({
      _id: selectedSt._id,
      price: selectedSt.price,
      format: selectedSt.format,
      time: selectedSt.time,
      screen: selectedSt.screen,
    }));
    navigate('/seats');
  };

  // Filter showtimes for the selected local theatre
  const filteredShowtimes = localTheatre
    ? showtimes.filter((st) => (st.theatreId?._id || st.theatreId) === localTheatre._id)
    : [];

  // Group filtered showtimes by screen (e.g. "Screen 1", "Screen 2")
  const screensMap = filteredShowtimes.reduce((acc, st) => {
    const scrName = `Screen ${st.screen || 1}`;
    if (!acc[scrName]) acc[scrName] = [];
    acc[scrName].push(st);
    return acc;
  }, {});

  return (
    <div className="bg-white min-h-screen pb-40">
      {/* Top Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex justify-between items-center text-sm font-bold text-gray-800">
          <button onClick={() => { if (localTheatre) { setLocalTheatre(null); } else { navigate(-1); } }} className="flex items-center gap-1 hover:text-purple text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </button>
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-red-500">Cancel</button>
        </div>
        <div className="mt-4">
          <h1 className="text-gray-900 font-extrabold text-lg leading-tight">
            {selectedMovie?.title || 'Meg 2: The Trench'}
          </h1>
          <p className="text-gray-400 text-xs font-semibold mt-0.5">
            {selectedMovie?.genres?.join(', ') || 'Action, Sci-Fi, Horror'}
          </p>
        </div>
      </div>

      {/* Progress Bar (Step 1 / 4 for Theatre list, Step 2 / 4 for Schedule Choose) */}
      <div className="px-5 mb-4">
        <div className="h-1 bg-gray-100 rounded-full w-full overflow-hidden">
          <div className="h-full bg-purple rounded-full transition-all duration-300" style={{ width: localTheatre ? '50%' : '25%' }} />
        </div>
      </div>

      {/* If screen 3: SELECT MOVIE THEATRE */}
      {!localTheatre ? (
        <div>
          {/* Date Strip */}
          <div className="px-5 mb-5">
            <div className="flex gap-2.5 overflow-x-auto pb-2 scroll-snap-x">
              {dates.map((d, i) => {
                const isActive = i === activeDateIdx;
                return (
                  <button
                    key={i}
                    id={`date-${i}`}
                    onClick={() => setActiveDateIdx(i)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-12 py-3 rounded-2xl border transition-all scroll-snap-item ${
                      isActive
                        ? 'border-purple bg-purple text-white shadow-md'
                        : 'border-gray-100 bg-white text-gray-400'
                    }`}
                  >
                    <span className={`text-[10px] uppercase font-bold leading-none ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                      {DAYS[d.getDay()]}
                    </span>
                    <span className="text-base font-black mt-1 leading-none">
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select Movie Theatre Title */}
          <div className="px-5 mb-3">
            <h2 className="text-gray-800 font-extrabold text-sm uppercase tracking-wide">Select Movie Theatre</h2>
          </div>

          {/* Theatre List */}
          <div className="px-5 flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 skeleton rounded-2xl" />
              ))
            ) : theatresList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No theatres showing this movie on selected date
              </div>
            ) : (
              theatresList.map(({ theatre, minPrice, maxPrice }) => (
                <button
                  key={theatre._id}
                  id={`theatre-${theatre._id}`}
                  onClick={() => handleTheatreSelect(theatre)}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-100 hover:border-purple/30 rounded-2xl text-left transition-all hover:shadow-sm"
                >
                  <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-purple text-xl font-bold flex-shrink-0 border border-gray-100">
                    🏛
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-bold text-sm leading-snug">{theatre.name}</p>
                    <p className="text-gray-400 text-[11px] font-semibold mt-0.5 leading-none">📍 {theatre.location}</p>
                    <p className="text-purple text-xs font-bold mt-2">₹{minPrice} - ₹{maxPrice}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        /* If screen 4: CHOOSE SCHEDULE */
        <div className="fade-in">
          {/* Selected Theatre Context Header */}
          <div className="px-5 py-3.5 bg-gray-50 border-y border-gray-100 mb-5 flex justify-between items-center">
            <div>
              <p className="text-gray-900 font-black text-sm">{localTheatre.name}</p>
              <p className="text-gray-400 text-[11px] font-semibold mt-0.5">
                📅 {activeDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <button onClick={() => setLocalTheatre(null)} className="text-purple text-xs font-bold hover:underline">Change</button>
          </div>

          <div className="px-5">
            <h2 className="text-gray-800 font-extrabold text-sm uppercase tracking-wide mb-4">Choose Schedule</h2>

            {/* Format info/Price range */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold border border-purple text-purple bg-purple-light">
                  {selectedFormat}
                </span>
              </div>
              <span className="text-gray-500 text-xs font-bold">
                ₹{filteredShowtimes[0]?.price ? filteredShowtimes[0].price : '320 - ₹450'}
              </span>
            </div>

            {/* Screen lists with time slots */}
            <div className="flex flex-col gap-6">
              {Object.keys(screensMap).map((screenName) => (
                <div key={screenName} className="border-b border-gray-100 pb-5 last:border-0">
                  <p className="text-gray-900 font-extrabold text-xs mb-3 uppercase tracking-wide">{screenName}</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {screensMap[screenName].map((st) => {
                      const isSelected = selectedSt?._id === st._id;
                      return (
                        <button
                          key={st._id}
                          id={`time-${st._id}`}
                          onClick={() => setSelectedSt(st)}
                          className={`py-3 rounded-xl border text-xs font-bold text-center transition-all ${
                            isSelected
                              ? 'border-purple bg-purple text-white shadow-md'
                              : 'border-gray-200 text-gray-500 hover:border-purple/30 bg-white'
                          }`}
                        >
                          <p className="text-sm font-black leading-none">{st.time}</p>
                          <p className={`text-[9px] mt-1 leading-none ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                            ₹{st.price}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredShowtimes.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No schedules for this theatre on selected date
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom button above nav */}
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-4 bg-white border-t border-gray-100">
            <button
              id="get-tickets-cta"
              disabled={!selectedSt}
              onClick={handleNext}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all text-center ${
                selectedSt
                  ? 'gradient-purple text-white shadow-[0_4px_16px_rgba(95,51,225,0.25)]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Get Tickets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
