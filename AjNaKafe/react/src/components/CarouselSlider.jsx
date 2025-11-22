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
          <>
            {user.user_pictures.split(':').map((picture, index) => (
              <MDBCarouselItem key={`${user.id}-${index}`} className={index === 0 ? 'active' : ''}>
                <img
                  src={`http://localhost:8000/storage/${picture}`}
                  alt={`User Picture ${index + 1}`}
                  className="d-block w-100"
                  draggable="false"
                />
                <MDBCarouselCaption>
                  <div className="carousel-caption-container">
                    <h5 className={'h2-carousel'} style={{ fontSize: '1.5em' }}>{user.name}, {age} години</h5>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '8px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {user.gender && (
                        <span style={{
                          background: 'rgba(212, 165, 116, 0.8)',
                          padding: '5px 12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          Род: {user.gender}
                        </span>
                      )}
                      {user.preference && (
                        <span style={{
                          background: 'rgba(230, 185, 128, 0.8)',
                          padding: '5px 12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          Преференца: {user.preference}
                        </span>
                      )}
                    </div>
                    {user.bio && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                        maxHeight: '120px',
                        overflowY: 'auto'
                      }} className="bio-container">
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: '#fff'
                        }}>
                          {user.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </MDBCarouselCaption>
              </MDBCarouselItem>
            ))}
          </>
        ) : (
          <>
            <MDBCarouselItem className='active' key={`${user.id}`}>
              <img src={`http://localhost:8000/storage/${user.profile_picture}`} alt={user.name}
                   className="d-block w-100"
                   draggable="false"/>
                <MDBCarouselCaption>
                  <div className="carousel-caption-container">
                    <h5 className={'h2-carousel'} style={{ fontSize: '1.5em' }}>{user.name}, {age} години</h5>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '8px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {user.gender && (
                        <span style={{
                          background: 'rgba(212, 165, 116, 0.8)',
                          padding: '5px 12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          Род: {user.gender}
                        </span>
                      )}
                      {user.preference && (
                        <span style={{
                          background: 'rgba(230, 185, 128, 0.8)',
                          padding: '5px 12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          Преференца: {user.preference}
                        </span>
                      )}
                    </div>
                    {user.bio && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                        maxHeight: '120px',
                        overflowY: 'auto'
                      }} className="bio-container">
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: '#fff'
                        }}>
                          {user.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </MDBCarouselCaption>
            </MDBCarouselItem>
          </>
        )}
      </MDBCarousel>
    </div>
  );
};

export default CarouselSlider;
