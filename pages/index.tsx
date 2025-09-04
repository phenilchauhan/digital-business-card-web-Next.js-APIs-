// pages/index.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

type Card = {
  id: string;
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    photo: string; // URL of uploaded image
    designation: string;
    phone: string;
    email: string;
  };
  business: {
    company: string;
    role: string;
    services: string[];
  };
  social: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
    website: string;
  };
  about: {
    bio: string;
    experience: string;
  };
  cta: {
    call: string;
    whatsapp: string;
    email: string;
    website: string;
  };
};

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [userId] = useState('user123'); // Replace with real auth user
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'social' | 'about' | 'cta'>('profile');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await axios.get(`/api/cards?userId=${userId}`);
      setCards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createCard = async () => {
    try {
      const res = await axios.post('/api/cards', { userId });
      setCards(prev => [res.data, ...prev]);
      setActiveCard(res.data);
      setActiveTab('profile');
    } catch (err) {
      console.error(err);
    }
  };

  const updateCard = async (card: Card) => {
    if (!card) return;
    try {
      const res = await axios.put(`/api/cards/${card.id}`, card);
      setCards(cards.map((c) => (c.id === card.id ? res.data : c)));
      setActiveCard(res.data);
      alert('Card saved in database!');
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('Are you sure to delete this card?')) return;
    try {
      await axios.delete(`/api/cards/${cardId}`);
      setCards(cards.filter((c) => c.id !== cardId));
      if (activeCard?.id === cardId) setActiveCard(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (!activeCard) return;
    setActiveCard({
      ...activeCard,
      [activeTab]: { ...activeCard[activeTab], [field]: value },
    });
  };

  // Image upload (uploads and updates DB via api route)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeCard) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional local preview while uploading
    const previewUrl = URL.createObjectURL(file);
    setActiveCard({ ...activeCard, profile: { ...activeCard.profile, photo: previewUrl } });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`/api/cards/upload/${activeCard.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // server returned url like "/uploads/...."
      setActiveCard({
        ...activeCard,
        profile: { ...activeCard.profile, photo: res.data.url },
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Image upload failed');
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">Digital Business Card</h1>

      <div className="d-flex justify-content-center mb-4">
        <button className="btn btn-primary" onClick={createCard}>Create New Card</button>
      </div>

      <div className="row">
        <div className="col-md-4">
          <h4>Your Cards</h4>
          <ul className="list-group">
            {cards.map((card) => (
              <li key={card.id} className={`list-group-item d-flex justify-content-between align-items-start ${activeCard?.id === card.id ? 'active text-white' : ''}`}>
                <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => setActiveCard(card)}>
                  <strong>{card.profile.firstName} {card.profile.lastName}</strong><br />
                  <small>{card.profile.designation} @ {card.business.company}</small><br />
                  <small>{card.profile.phone}</small>
                </div>
                <button className="btn btn-sm btn-danger ms-2" onClick={() => deleteCard(card.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {activeCard && (
          <div className="col-md-8">
            <div className="card p-3 shadow-sm">
              <div className="mb-3 border rounded p-3 bg-light">
                {activeCard.profile.photo && (
                  <img src={activeCard.profile.photo} alt="Profile" className="img-thumbnail mb-2" style={{ maxWidth: '120px' }} />
                )}
                <h5>{activeCard.profile.firstName} {activeCard.profile.lastName}</h5>
                <p className="mb-1">{activeCard.profile.designation}</p>
                <p className="mb-1">{activeCard.business.company} - {activeCard.business.role}</p>
                <p className="mb-1">📞 {activeCard.profile.phone} | ✉️ {activeCard.profile.email}</p>
                <div>🌐 {activeCard.social.website} <br />🔗 {activeCard.social.linkedin} | 🐦 {activeCard.social.twitter}</div>
              </div>

              <ul className="nav nav-tabs mb-3">
                {['profile', 'business', 'social', 'about', 'cta'].map((tab) => (
                  <li className="nav-item" key={tab}>
                    <button className={`nav-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab as any)}>
                      {tab.toUpperCase()}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mb-3">
                {Object.keys(activeCard[activeTab]).map((key) => (
                  <div className="mb-2" key={key}>
                    <label className="form-label">{key}</label>

                    {activeTab === 'profile' && key === 'photo' ? (
                      <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
                    ) : (
                      <input className="form-control" value={(activeCard[activeTab] as any)[key] ?? ''} onChange={(e) => handleChange(key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>

              <button className="btn btn-success mt-2" onClick={() => updateCard(activeCard)}>Save Card</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
