import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { fetchBookingById, fetchMovieById } from '../services/api';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    fetchBookingById(id)
      .then((res) => {
        if (!isMounted) return;
        const bData = res.data.data;
        setBooking(bData);
        
        // Fetch movie details using the tmdbMovieId from the booking
        if (bData?.showtimeId?.tmdbMovieId) {
          return fetchMovieById(bData.showtimeId.tmdbMovieId);
        }
      })
      .then((res) => {
        if (!isMounted) return;
        if (res?.data?.data) {
          setMovie(res.data.data);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Failed to load booking details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen pb-24">
        {/* Header Skeleton */}
        <div className="px-5 pt-5 pb-3">
          <div className="h-5 w-20 skeleton rounded mb-4" />
          <div className="h-7 w-48 skeleton rounded mb-2" />
        </div>
        <div className="px-5">
          <div className="h-64 skeleton rounded-3xl mb-6" />
          <div className="h-32 skeleton rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-gray-900 font-extrabold text-lg mb-1">Booking Not Found</h2>
        <p className="text-gray-400 text-xs mb-6">{error || 'The requested booking details could not be retrieved.'}</p>
        <button onClick={() => navigate('/')} className="gradient-purple px-6 py-3 rounded-2xl text-white font-bold text-xs">
          Go Home
        </button>
      </div>
    );
  }

  const showtime = booking.showtimeId;
  const theatre = showtime?.theatreId;
  const dateFormatted = showtime?.date
    ? new Date(showtime.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '—';
  
  const seatsFormatted = booking.seats?.map((s) => `${s.row}${s.col}`).join(', ') || '—';

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex justify-between items-center text-sm font-bold text-gray-800">
          <button onClick={() => navigate('/bookings')} className="flex items-center gap-1 hover:text-purple text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            My Bookings
          </button>
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-red-500">Close</button>
        </div>
        <div className="mt-4">
          <h1 className="text-gray-900 font-extrabold text-xl">Booking Confirmation</h1>
          <p className="text-gray-400 text-[11px] font-semibold mt-0.5">Booking ID: {booking._id}</p>
        </div>
      </div>

      <div className="px-5 mt-4">
        {/* Ticket Container */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-md overflow-hidden relative fade-up">
          
          {/* Ticket Header/Banner */}
          <div className="relative h-44 bg-purple-light flex items-end">
            {movie?.banner || movie?.poster ? (
              <img
                src={movie?.banner || movie?.poster}
                alt={movie?.title || 'Movie Banner'}
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <div className="w-full h-full gradient-purple absolute inset-0" />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="relative p-5 text-white z-10 w-full">
              <span className="bg-purple text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider mb-1.5 inline-block">
                Confirmed
              </span>
              <h2 className="font-extrabold text-lg leading-tight line-clamp-1">
                {movie?.title || 'Movie Title'}
              </h2>
              <p className="text-[10px] text-gray-300 font-medium mt-0.5 line-clamp-1">
                {theatre?.name || 'Theatre Name'}
              </p>
            </div>
          </div>

          <div className="p-5">
            {/* Main Ticket Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <DetailBlock label="Date" value={dateFormatted} />
              <DetailBlock label="Time & Format" value={`${showtime?.time || '—'} (${showtime?.format || '2D'})`} />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <DetailBlock label="Screen" value={`Screen ${showtime?.screen || '—'}`} />
              <DetailBlock label="Seats" value={seatsFormatted} />
              <DetailBlock label="Amount Paid" value={`₹${booking.totalAmount}`} />
            </div>

            {/* Perforated Divider */}
            <div className="flex items-center gap-1.5 my-6 relative">
              <div className="w-5 h-5 rounded-full bg-white border border-gray-100 absolute -left-8" />
              <div className="flex-1 border-t-2 border-dashed border-gray-100" />
              <div className="w-5 h-5 rounded-full bg-white border border-gray-100 absolute -right-8" />
            </div>

            {/* QR Code and Instructions */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-4 bg-white border border-gray-100 rounded-3xl shadow-sm mb-4">
                <QRCode value={booking._id} size={150} />
              </div>
              <p className="text-gray-900 font-extrabold text-sm mb-0.5">Scan Ticket at Entrance</p>
              <p className="text-gray-400 text-[10px] text-center max-w-[220px]">
                Please show this QR code to the usher at the screen entrance. Enjoy your movie!
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div>
      <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">{label}</p>
      <p className="text-xs text-gray-900 font-extrabold mt-0.5">{value}</p>
    </div>
  );
}
