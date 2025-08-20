import React, { useState, useEffect } from 'react';
import { Country, City } from 'country-state-city';

function LocationSelector({ 
  selectedCountry, 
  selectedCity, 
  onCountryChange, 
  onCityChange,
  required = false 
}) {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [countryCode, setCountryCode] = useState('');

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
    
    if (selectedCountry) {
      const country = allCountries.find(c => c.name === selectedCountry);
      if (country) {
        setCountryCode(country.isoCode);
      }
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (countryCode) {
      const countryCities = City.getCitiesOfCountry(countryCode);
      setCities(countryCities || []);
    } else {
      setCities([]);
    }
  }, [countryCode]);

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    
    if (countryName !== selectedCountry) {
      onCountryChange(countryName);
      onCityChange('');
      
      const country = countries.find(c => c.name === countryName);
      setCountryCode(country ? country.isoCode : '');
    }
  };

  return (
    <div className="location-selector">
      <div className="form-group">
        <label htmlFor="country">Country {required && '*'}</label>
        <select
          id="country"
          value={selectedCountry || ''}
          onChange={handleCountryChange}
          required={required}
          key={`country-${selectedCountry}`}
        >
          <option value="">Select a country</option>
          {countries.map((country) => (
            <option key={`${country.isoCode}-${country.name}`} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="city">City {required && '*'}</label>
        <select
          id="city"
          value={selectedCity || ''}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!countryCode}
          required={required}
          key={`city-${selectedCity}-${countryCode}`}
        >
          <option value="">Select a city</option>
          {cities.map((city, index) => (
            <option key={`${city.name}-${index}`} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default LocationSelector;