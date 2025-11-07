import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { MDBContainer, MDBRow } from "mdb-react-ui-kit";
import { Link } from "react-router-dom";
import '../../public/resources/css/card.css';
import { useStateContext } from "../context/ContextProvider.jsx";
import { Hearts } from "react-loader-spinner"; // You can use the same Hearts spinner or any other loader

const Card = () => {
  const { user } = useStateContext();
  const [loading, setLoading] = useState(true); // State for image loading

  const handleImageLoad = () => {
    setLoading(false); // Set loading to false when image is loaded
  };

  return (
    <div>
      <div className="">
        <div className="main-container shadow">
          <MDBContainer>
            <MDBRow>
              <div>
                <Link to={'user-details'}>
                  <div className="d-flex justify-content-start align-items-center" style={{ padding: '1rem' }}>
                    <div style={{ position: 'relative', width: '15%' }}>

                      {loading && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Hearts
                            height="40"
                            width="40"
                            color="#f5deb3"
                            ariaLabel="hearts-loading"
                            visible={true}
                          />
                        </div>
                      )}
                      {/* Image */}
                      <img
                        src={`http://localhost:8000/storage/${user.profile_picture}`}
                        alt="John"
                        style={{
                          width: "100%",
                          height: "auto",
                          aspectRatio: "1 / 1",
                          borderRadius: "50%",
                          border: '1px solid black',
                          display: loading ? 'none' : 'block', // Hide the image while loading
                        }}
                        onLoad={handleImageLoad} // When image is loaded
                      />
                    </div>
                    <h2 style={{ marginLeft: '1rem' }} className="">My Profile</h2>
                  </div>
                </Link>
              </div>
            </MDBRow>
          </MDBContainer>
        </div>
      </div>
    </div>
  );
};

export default Card;
