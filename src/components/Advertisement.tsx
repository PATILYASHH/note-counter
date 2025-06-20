import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { X } from 'lucide-react';

interface Ad {
  id: string;
  image_url: string;
  link_url: string;
  active: boolean;
  duration: number;
  start_time: string;
  end_time: string;
}

const Advertisement: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Only proceed if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      return;
    }

    const checkLastShown = () => {
      const lastShown = localStorage.getItem('lastAdShown');
      if (!lastShown) {
        return true;
      }
      
      const lastDate = new Date(lastShown);
      const today = new Date();
      return lastDate.getDate() !== today.getDate() ||
             lastDate.getMonth() !== today.getMonth() ||
             lastDate.getFullYear() !== today.getFullYear();
    };

    if (checkLastShown()) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem('lastAdShown', new Date().toISOString());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Only proceed if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      return;
    }

    fetchActiveAds();
    
    // Set up real-time subscription for ad updates
    const subscription = supabase
      .channel('advertisements')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'advertisements' 
      }, () => {
        fetchActiveAds();
      })
      .subscribe();

    // Check for expired ads every minute
    const expiryChecker = setInterval(fetchActiveAds, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(expiryChecker);
    };
  }, []);

  const fetchActiveAds = async () => {
    if (!supabase) return;

    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('active', true)
        .lte('start_time', now)
        .gte('end_time', now)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching ads:', error);
        return;
      }

      if (data && data.length > 0) {
        setAds(data);
        // Set initial ad if not already set
        if (!currentAd) {
          setCurrentAd(data[0]);
        }
      } else {
        setAds([]);
        setCurrentAd(null);
      }
    } catch (error) {
      console.error('Error in fetchActiveAds:', error);
    }
  };

  // Effect for rotating ads
  useEffect(() => {
    if (ads.length === 0) return;

    const rotateAd = () => {
      const nextIndex = (currentAdIndex + 1) % ads.length;
      setCurrentAdIndex(nextIndex);
      setCurrentAd(ads[nextIndex]);
    };

    // Get duration for current ad (default to 30 seconds if not set)
    const duration = ads[currentAdIndex]?.duration || 30;
    
    // Set up timer for rotating to next ad
    const timer = setInterval(rotateAd, duration * 1000);

    // Cleanup timer on component unmount or when ads change
    return () => clearInterval(timer);
  }, [currentAdIndex, ads]);

  // If no ads or ads haven't loaded yet, or Supabase not configured
  if (!isSupabaseConfigured() || !currentAd || !showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative">
        <button 
          onClick={() => setShowPopup(false)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        >
          <X size={20} />
        </button>
        <a 
          href={currentAd.link_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full overflow-hidden rounded-lg"
        >
          <img 
            src={currentAd.image_url} 
            alt="Advertisement" 
            className="w-full h-auto object-contain"
            key={currentAd.id}
          />
        </a>
      </div>
    </div>
  );
};

export default Advertisement;