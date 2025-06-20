import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, LogOut, Clock, Eye, X, Calendar, Mail, Check, XCircle, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Ad {
  id: string;
  image_url: string;
  link_url: string;
  active: boolean;
  created_at: string;
  duration: number;
  start_time: string;
  end_time: string;
}

interface AdInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ads' | 'inquiries'>('ads');
  const [ads, setAds] = useState<Ad[]>([]);
  const [inquiries, setInquiries] = useState<AdInquiry[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState('');
  const [duration, setDuration] = useState(30);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      navigate('/admin');
      return;
    }

    checkAuth();
    fetchAds();
    fetchInquiries();
    
    // Set default start time to now
    const now = new Date();
    setStartTime(now.toISOString().slice(0, 16));
    
    // Set default end time to 7 days from now
    const sevenDaysLater = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    setEndTime(sevenDaysLater.toISOString().slice(0, 16));
    
    if (supabase) {
      const subscription = supabase
        .channel('changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'advertisements' 
        }, () => {
          fetchAds();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'ad_inquiries' 
        }, () => {
          fetchInquiries();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const checkAuth = async () => {
    if (!supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/admin');
    }
  };

  const fetchAds = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAds(data);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const fetchInquiries = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('ad_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setInquiries(data);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('ad_inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (!error) {
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !linkUrl || !startTime || !endTime || !supabase) return;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('advertisements')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('advertisements')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('advertisements')
        .insert([
          {
            image_url: publicUrl,
            link_url: linkUrl,
            active: true,
            duration: duration,
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString()
          }
        ]);

      if (dbError) throw dbError;

      fetchAds();
      setImageFile(null);
      setImagePreviewUrl('');
      setLinkUrl('');
      setDuration(30);
      
      // Reset times to defaults
      const now = new Date();
      setStartTime(now.toISOString().slice(0, 16));
      const sevenDaysLater = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      setEndTime(sevenDaysLater.toISOString().slice(0, 16));
    } catch (error) {
      console.error('Error uploading ad:', error);
      alert('Error uploading advertisement');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?') || !supabase) return;

    try {
      await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('advertisements')
          .remove([fileName]);
      }

      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Error deleting advertisement');
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    if (!supabase) return;

    try {
      await supabase
        .from('advertisements')
        .update({ active: !currentActive })
        .eq('id', id);

      fetchAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      alert('Error updating advertisement status');
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  const getTimeStatus = (ad: Ad) => {
    const now = new Date();
    const start = new Date(ad.start_time);
    const end = new Date(ad.end_time);

    if (now < start) return 'Scheduled';
    if (now > end) return 'Expired';
    return 'Active';
  };

  const PreviewModal = () => {
    if (!showPreview || !imagePreviewUrl) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Advertisement Preview</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">This is how your advertisement will appear on the website:</p>
              <div className="bg-white py-4 border rounded-lg">
                <div className="container mx-auto px-4">
                  <a 
                    href={linkUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full max-h-[100px] overflow-hidden"
                  >
                    <img 
                      src={imagePreviewUrl} 
                      alt="Advertisement Preview" 
                      className="w-full h-full object-contain"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Link URL:</strong> {linkUrl || 'Not set'}</p>
              <p><strong>Duration:</strong> {formatDuration(duration)}</p>
              <p><strong>Start Time:</strong> {startTime ? new Date(startTime).toLocaleString() : 'Not set'}</p>
              <p><strong>End Time:</strong> {endTime ? new Date(endTime).toLocaleString() : 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="text-yellow-500" size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center mb-4">Configuration Required</h1>
          <p className="text-gray-600 text-center mb-4">
            Supabase environment variables are not configured. Please set up your Supabase project first.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Go Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex bg-white rounded-lg shadow">
              <button
                onClick={() => setActiveTab('ads')}
                className={`px-4 py-2 rounded-l-lg ${
                  activeTab === 'ads'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Advertisements
              </button>
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`px-4 py-2 rounded-r-lg ${
                  activeTab === 'inquiries'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Inquiries
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
        </div>

        {activeTab === 'ads' ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Upload New Advertisement</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Advertisement Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Link URL</label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    min="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter duration in seconds"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This ad will display for {formatDuration(duration)} in the rotation
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    disabled={!imagePreviewUrl}
                    className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye size={18} className="mr-2" />
                    Preview
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !imageFile}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={18} className="mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Advertisement'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Current Advertisements</h2>
              <div className="space-y-4">
                {ads.map((ad) => (
                  <div key={ad.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={ad.image_url}
                          alt="Advertisement"
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <a
                            href={ad.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {ad.link_url}
                          </a>
                          <div className="text-sm text-gray-500 mt-1">
                            Created: {new Date(ad.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            <Clock size={14} className="mr-1" />
                            <span className="text-gray-600">
                              Rotation Duration: {formatDuration(ad.duration)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            <Calendar size={14} className="mr-1" />
                            <span className="text-gray-600">
                              {new Date(ad.start_time).toLocaleString()} - {new Date(ad.end_time).toLocaleString()}
                            </span>
                          </div>
                          <div className={`text-sm mt-1 ${
                            getTimeStatus(ad) === 'Active' ? 'text-green-600' :
                            getTimeStatus(ad) === 'Scheduled' ? 'text-blue-600' :
                            'text-red-600'
                          }`}>
                            Status: {getTimeStatus(ad)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ad.active}
                            onChange={() => toggleActive(ad.id, ad.active)}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${
                            ad.active ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                              ad.active ? 'translate-x-6' : 'translate-x-1'
                            } mt-1`} />
                          </div>
                          <span className="ml-2 text-sm">
                            {ad.active ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                        <button
                          onClick={() => handleDelete(ad.id, ad.image_url)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {ads.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No advertisements uploaded yet
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Advertising Inquiries</h2>
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{inquiry.company}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>Contact: {inquiry.name}</p>
                        <p>Email: <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">{inquiry.email}</a></p>
                      </div>
                      <div className="mt-2">
                        <p className="text-gray-700">{inquiry.message}</p>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Received: {new Date(inquiry.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        inquiry.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : inquiry.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </div>
                      {inquiry.status === 'pending' && (
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => updateInquiryStatus(inquiry.id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => updateInquiryStatus(inquiry.id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {inquiries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Mail size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No advertising inquiries yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showPreview && <PreviewModal />}
    </div>
  );
};

export default AdminDashboard;