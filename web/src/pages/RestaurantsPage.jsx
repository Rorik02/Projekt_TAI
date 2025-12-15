import React from 'react';
// Usuwamy import './RestaurantsPage.css'
import RestaurantsList from '../../components/RestaurantsList/RestaurantsList';

const RestaurantsPage = () => {
    return(
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          <RestaurantsList/>  
        </div>
    );
}

export default RestaurantsPage;