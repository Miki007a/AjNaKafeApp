import React from 'react';
import {
  MDBCarousel,
  MDBCarouselItem,
  MDBCarouselCaption
} from 'mdb-react-ui-kit';
import '../../public/resources/css/Carousel.css';

const CarouselSlider = ({ user }) => {

  const calculateAge = (dateString) => {
    const birthDate = new Date(dateString); // Parse the date
    const today = new Date(); // Get today's date
    let age = today.getFullYear() - birthDate.getFullYear(); // Calculate initial age
    const monthDifference = today.getMonth() - birthDate.getMonth(); // Check month difference
    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age; // Return the calculated age
  };

  const age = calculateAge(user.date); // Get the age
  return (
    <div className="user-carousel-container">
      <MDBCarousel showIndicators showControls fade>
        {user.user_pictures && user.user_pictures.length > 0 ? (
          user.user_pictures.split(':').map((picture, index) => (
            <MDBCarouselItem key={`${user.id}-${index}`}>
              <img
                src={`http://localhost:8000/storage/${picture}`}
                alt={`User Picture ${index + 1}`}
                className="d-block w-100"
              />
              <MDBCarouselCaption>
                <div className="carousel-caption-container">
                  <h5 className={'h2-carousel'}>{user.name} {age} Age </h5>
                  <p>{user.gender}</p>
                  <p>{user.preference}</p>
                </div>
              </MDBCarouselCaption>
            </MDBCarouselItem>

          ))
        ) : (
          <MDBCarouselItem className='active' key={user.id}>
            <img src={`http://localhost:8000/storage/${user.profile_picture}`} alt={user.name}
                 className="d-block w-100"/>
              <MDBCarouselCaption>
                <div className="carousel-caption-container">
                <h5 className={'h2-carousel'}>{user.name} {age} Age </h5>
                <p>{user.gender}</p>
                <p>{user.preference}</p>
                </div>
              </MDBCarouselCaption>

          </MDBCarouselItem>
        )}
      </MDBCarousel>
    </div>
  );
};

export default CarouselSlider;
