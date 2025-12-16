import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';


const MAPBOX_TOKEN = "pk.eyJ1Ijoicm9yaWsiLCJhIjoiY21qN3JvaDh5MDV4cDNncXpkM3RlNmVzZCJ9.HemoDNLmVXXnG2OTEb3H7g";

const MapComponent = ({ restaurants }) => {
    const [markers, setMarkers] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    const [viewState, setViewState] = useState({
        longitude: 18.6714,
        latitude: 50.2945,
        zoom: 12
    });

    useEffect(() => {
        const geocodeRestaurants = async () => {
            const newMarkers = [];
            for (const restaurant of restaurants) {
                if (!restaurant.address) continue;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(restaurant.address)}`
                    );
                    const data = await response.json();
                    if (data && data.length > 0) {
                        newMarkers.push({
                            id: restaurant.id,
                            name: restaurant.name,
                            cuisines: restaurant.cuisines,
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon)
                        });
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
                await new Promise(r => setTimeout(r, 600));
            }
            setMarkers(newMarkers);
        };

        if (restaurants.length > 0) geocodeRestaurants();
    }, [restaurants]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{width: '100%', height: '100%'}}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                {/* Kontrolki nawigacji (+/-) */}
                <NavigationControl position="top-right" />

                {/* Markery */}
                {markers.map((marker) => (
                    <Marker 
                        key={marker.id} 
                        longitude={marker.lng} 
                        latitude={marker.lat} 
                        anchor="bottom"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            setSelectedRestaurant(marker);
                        }}
                    >
                        {/* Własna ikona pinezki (SVG) */}
                        <svg 
                            height={30} 
                            viewBox="0 0 24 24" 
                            style={{cursor: 'pointer', fill: '#9333ea', stroke: 'white', strokeWidth: '2px', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))'}}
                        >
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    </Marker>
                ))}

                {/* Popup po kliknięciu */}
                {selectedRestaurant && (
                    <Popup
                        longitude={selectedRestaurant.lng}
                        latitude={selectedRestaurant.lat}
                        anchor="top"
                        onClose={() => setSelectedRestaurant(null)}
                        closeOnClick={false}
                    >
                        <div className="text-black p-1">
                            <h3 className="font-bold">{selectedRestaurant.name}</h3>
                            <p className="text-xs text-gray-500">{selectedRestaurant.cuisines}</p>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
};

export default MapComponent;