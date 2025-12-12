'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const chickenSpecies = [
  { name: 'Rhode Island Red', origin: 'USA', lat: 41.5801, lng: -71.4774, description: 'Popular American breed known for brown eggs', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Rhode_Island_Red_rooster.jpg/280px-Rhode_Island_Red_rooster.jpg' },
  { name: 'Silkie', origin: 'China', lat: 35.8617, lng: 104.1954, description: 'Fluffy feathered Chinese breed with black skin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Silky_bantam.jpg/280px-Silky_bantam.jpg' },
  { name: 'Leghorn', origin: 'Italy', lat: 43.5486, lng: 10.3106, description: 'White Italian breed, excellent egg layers', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/White_Leghorn_rooster.jpg/280px-White_Leghorn_rooster.jpg' },
  { name: 'Sussex', origin: 'England', lat: 50.9097, lng: -0.1207, description: 'Traditional English breed, dual-purpose', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Light_sussex_hen.jpg/280px-Light_sussex_hen.jpg' },
  { name: 'Brahma', origin: 'India', lat: 20.5937, lng: 78.9629, description: 'Large Indian breed with feathered legs', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Brahma_rooster_by_Venky_S..jpg/280px-Brahma_rooster_by_Venky_S..jpg' },
  { name: 'Orpington', origin: 'England', lat: 51.3716, lng: 0.0989, description: 'Large, friendly English breed', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Buff_Orpington_hen_and_chicken.jpg/280px-Buff_Orpington_hen_and_chicken.jpg' },
  { name: 'Marans', origin: 'France', lat: 45.9667, lng: -1.0000, description: 'French breed laying dark brown eggs', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Marans_rooster.jpg/280px-Marans_rooster.jpg' },
  { name: 'Plymouth Rock', origin: 'USA', lat: 41.9584, lng: -70.6673, description: 'American breed with barred plumage', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Plymouth_Rock_rooster.jpg/280px-Plymouth_Rock_rooster.jpg' },
  { name: 'Ayam Cemani', origin: 'Indonesia', lat: -0.7893, lng: 113.9213, description: 'Rare black Indonesian chicken', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ayam_Cemani_Rooster.jpg/280px-Ayam_Cemani_Rooster.jpg' },
  { name: 'Polish', origin: 'Poland', lat: 51.9194, lng: 19.1451, description: 'Crested breed with distinctive head feathers', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/White_Crested_Black_Polish_Bantam.jpg/280px-White_Crested_Black_Polish_Bantam.jpg' },
  { name: 'Wyandotte', origin: 'USA', lat: 42.8864, lng: -78.8784, description: 'American breed with laced plumage patterns', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Silver_laced_wyandotte_hen.jpg/280px-Silver_laced_wyandotte_hen.jpg' },
  { name: 'Australorp', origin: 'Australia', lat: -25.2744, lng: 133.7751, description: 'Australian breed, world egg-laying record holder', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Australorp_Rooster.jpg/280px-Australorp_Rooster.jpg' },
  { name: 'Japanese Bantam', origin: 'Japan', lat: 36.2048, lng: 138.2529, description: 'Small ornamental Japanese breed', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Japanese_Bantam_rooster.jpg/280px-Japanese_Bantam_rooster.jpg' }
];

const adoptionCenters = [
  { name: 'San Francisco Animal Shelter', lat: 37.7749, lng: -122.4194, description: 'Rescue chickens from various situations' },
  { name: 'NYC Farm Sanctuary', lat: 40.7128, lng: -74.0060, description: 'Providing shelter for rescued chickens' },
  { name: 'Iowa Chicken Rescue', lat: 41.8780, lng: -93.0977, description: 'Dedicated to chicken welfare and adoption' },
  { name: 'Texas Animal Haven', lat: 29.7604, lng: -95.3698, description: 'Safe haven for rescued birds' },
  { name: 'LA Bird Rescue Center', lat: 34.0522, lng: -118.2437, description: 'Bird rehabilitation and adoption center' },
  { name: 'Miami Animal Adoption Center', lat: 25.7617, lng: -80.1918, description: 'Find your perfect feathered friend' },
  { name: 'Chicago Sanctuary', lat: 41.8781, lng: -87.6298, description: 'Peaceful home for rescued chickens' },
  { name: 'Seattle Farm Animal Rescue', lat: 47.6062, lng: -122.3321, description: 'Compassionate care for farm animals' }
];

const chickenRestaurants = [
  { name: 'KFC HQ', location: 'Louisville, USA', lat: 38.2527, lng: -85.7585, description: 'Kentucky Fried Chicken headquarters', reviews: ['"Best fried chicken ever! ⭐⭐⭐⭐⭐" - John D.', '"Original recipe is unbeatable! ⭐⭐⭐⭐⭐" - Sarah M.'] },
  { name: 'Nando\'s HQ', location: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473, description: 'Famous Peri-Peri chicken chain', reviews: ['"That Peri-Peri sauce is addictive! ⭐⭐⭐⭐⭐" - Mike T.', '"Perfect spice level! ⭐⭐⭐⭐" - Lisa K.'] },
  { name: 'Chick-fil-A HQ', location: 'Atlanta, USA', lat: 33.7490, lng: -84.3880, description: 'Popular American chicken sandwich chain', reviews: ['"Best chicken sandwich hands down! ⭐⭐⭐⭐⭐" - Tom R.', '"Great service and quality! ⭐⭐⭐⭐⭐" - Emily W.'] },
  { name: 'Popeyes HQ', location: 'Miami, USA', lat: 25.7617, lng: -80.1918, description: 'Louisiana-style fried chicken', reviews: ['"Spicy chicken is amazing! ⭐⭐⭐⭐⭐" - David L.', '"Love that Louisiana flavor! ⭐⭐⭐⭐" - Amy P.'] },
  { name: 'Jollibee HQ', location: 'Manila, Philippines', lat: 14.5995, lng: 120.9842, description: 'Filipino fast-food chain with Chickenjoy', reviews: ['"Chickenjoy lives up to its name! ⭐⭐⭐⭐⭐" - Carlos M.', '"Crispy and juicy perfection! ⭐⭐⭐⭐⭐" - Maria S.'] },
  { name: 'Bonchon HQ', location: 'Seoul, South Korea', lat: 37.5665, lng: 126.9780, description: 'Korean fried chicken chain', reviews: ['"Super crispy and flavorful! ⭐⭐⭐⭐⭐" - Kim J.', '"Best Korean fried chicken! ⭐⭐⭐⭐⭐" - Park H.'] },
  { name: 'Nando\'s UK', location: 'London, UK', lat: 51.5074, lng: -0.1278, description: 'Peri-Peri chicken in the UK', reviews: ['"Love the flame-grilled taste! ⭐⭐⭐⭐" - James B.', '"Great sides too! ⭐⭐⭐⭐" - Sophie C.'] },
  { name: 'Church\'s Chicken HQ', location: 'Atlanta, USA', lat: 33.7537, lng: -84.3863, description: 'Southern fried chicken chain', reviews: ['"That Southern flavor is real! ⭐⭐⭐⭐" - Robert H.', '"Honey butter biscuits! ⭐⭐⭐⭐⭐" - Jennifer L.'] },
  { name: 'Roscoe\'s Chicken & Waffles', location: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437, description: 'Famous soul food restaurant', reviews: ['"Perfect combo of sweet and savory! ⭐⭐⭐⭐⭐" - Marcus J.', '"LA institution! Must try! ⭐⭐⭐⭐⭐" - Tina G.'] },
  { name: 'Texas Chicken HQ', location: 'Texas, USA', lat: 31.9686, lng: -99.9018, description: 'Fried chicken chain', reviews: ['"Big Texas portions! ⭐⭐⭐⭐" - Steve W.', '"Good value for money! ⭐⭐⭐⭐" - Karen D.'] },
  { name: 'Kyochon', location: 'Seoul, South Korea', lat: 37.5172, lng: 127.0473, description: 'Premium Korean fried chicken', reviews: ['"Premium quality worth it! ⭐⭐⭐⭐⭐" - Lee S.', '"Soy garlic is heavenly! ⭐⭐⭐⭐⭐" - Choi M.'] },
  { name: 'Raising Cane\'s HQ', location: 'Baton Rouge, USA', lat: 30.4515, lng: -91.1871, description: 'Chicken finger specialists', reviews: ['"Simple menu, perfect execution! ⭐⭐⭐⭐⭐" - Brian K.', '"That Cane\'s sauce though! ⭐⭐⭐⭐⭐" - Ashley R.'] }
];

interface MapProps {
  targetLocation?: { lat: number; lng: number; name: string } | null;
}

export default function Map({ targetLocation }: MapProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  useEffect(() => {
    if (targetLocation) {
      setMapCenter([targetLocation.lat, targetLocation.lng]);
      setMapZoom(8);
    }
  }, [targetLocation]);

  useEffect(() => {
    // Fix for default markers in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const getRedIcon = () => {
    if (typeof window === 'undefined') return undefined;
    return new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  const getYellowIcon = () => {
    if (typeof window === 'undefined') return undefined;
    return new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <div className="h-96 w-full">
      <MapContainer center={mapCenter} zoom={mapZoom} key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {chickenSpecies.map((species, index) => (
          <Marker 
            key={`species-${index}`} 
            position={[species.lat, species.lng]}
            eventHandlers={{
              click: () => speakText(`${species.name} from ${species.origin}. ${species.description}`)
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center', maxWidth: '250px' }}>
                <strong style={{ fontSize: '16px' }}>🐔 {species.name}</strong>
                <br />
                <em>{species.origin}</em>
                <br />
                <img 
                  src={species.image} 
                  alt={species.name} 
                  style={{ width: '100%', maxWidth: '200px', height: 'auto', margin: '8px 0', borderRadius: '8px' }}
                />
                <br />
                <span style={{ fontSize: '12px' }}>{species.description}</span>
                <br />
                <button 
                  onClick={() => speakText(`${species.name} from ${species.origin}. ${species.description}`)}
                  style={{ marginTop: '8px', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  🔊 Play Audio
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        {chickenRestaurants.map((restaurant, index) => (
          <Marker 
            key={`restaurant-${index}`} 
            position={[restaurant.lat, restaurant.lng]}
            icon={getRedIcon()}
            eventHandlers={{
              click: () => speakText(`${restaurant.name} in ${restaurant.location}. ${restaurant.description}`)
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center', maxWidth: '250px' }}>
                <strong style={{ fontSize: '16px' }}>🍗 {restaurant.name}</strong>
                <br />
                <em>{restaurant.location}</em>
                <br />
                <span style={{ fontSize: '12px' }}>{restaurant.description}</span>
                <br />
                <div style={{ marginTop: '8px', textAlign: 'left', fontSize: '11px', background: '#f9f9f9', padding: '6px', borderRadius: '4px' }}>
                  <strong>Customer Reviews:</strong>
                  {restaurant.reviews.map((review, idx) => (
                    <div key={idx} style={{ marginTop: '4px', fontStyle: 'italic' }}>{review}</div>
                  ))}
                </div>
                <button 
                  onClick={() => speakText(`${restaurant.name} in ${restaurant.location}. ${restaurant.description}`)}
                  style={{ marginTop: '8px', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  🔊 Play Audio
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        {adoptionCenters.map((center, index) => (
          <Marker 
            key={`adoption-${index}`} 
            position={[center.lat, center.lng]}
            icon={getYellowIcon()}
            eventHandlers={{
              click: () => speakText(`${center.name}. ${center.description}`)
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center', maxWidth: '250px' }}>
                <strong style={{ fontSize: '16px' }}>🐥 {center.name}</strong>
                <br />
                <span style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>{center.description}</span>
                <br />
                <div style={{ marginTop: '8px', padding: '8px', background: '#fef3c7', borderRadius: '4px' }}>
                  <strong style={{ color: '#92400e' }}>💛 Adoption Center</strong>
                  <p style={{ fontSize: '11px', color: '#78350f', marginTop: '4px' }}>Visit us to meet rescue chickens looking for loving homes!</p>
                </div>
                <button 
                  onClick={() => speakText(`${center.name}. ${center.description}`)}
                  style={{ marginTop: '8px', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  🔊 Play Audio
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}