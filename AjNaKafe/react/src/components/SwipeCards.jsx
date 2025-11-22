import React, { useEffect, useState } from 'react';
import TinderCard from 'react-tinder-card';
import styles from '../assets/swipe-card.module.css';
import CarouselSlider from '../components/CarouselSlider.jsx';
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";
import {Hearts} from "react-loader-spinner";
import { useOutletContext } from 'react-router-dom';

const SwipeCards = () => {
  const outletContext = useOutletContext();
  const distance = outletContext?.distance || 50;
  const [lastDirection, setLastDirection] = useState(null);
  const { user } = useStateContext();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Effect to fetch users when distance changes
  useEffect(() => {
    if (distance !== undefined) {
      setLoading(true);
      axiosClient.get('/swiped-users', {
        params: {
          distance: distance
        }
      })
        .then(({ data }) => {
          setUsers(data);
          setLoading(false); // Set loading to false once data is fetched
        })
        .catch(error => {
          console.error('Error fetching swiped users:', error);
          setLoading(false); // Ensure loading is also set to false if there's an error
        });
    }
  }, [distance]);

  const swiped = (direction, id) => {
    setLastDirection(direction);
    // Swipe right = like, swipe left = dislike
    let status = direction === 'right' ? 'like' : 'dislike';

    // Remove the swiped card from the array immediately so next card can appear
   // setUsers(prevUsers => prevUsers.filter(user => user.id !== id));

    axiosClient.post('/like', {
      'status': status,
      'from_user_id': user.id,
      'to_user_id': id,
    }).then(() => {
      console.log(`${status} action on user ${id} by user ${user.id}`);
    }).catch(error => {
      console.error('Error posting like/dislike:', error);
    });
  };

  const outOfFrame = (id) => {
    console.log(`User ${id} left the screen`);
  };

  return (
    <div>
      <div className={styles.cardContainer}>
        {loading ? (
          <Hearts
            height="400"
            width="400"
            color="#f5deb3"
            ariaLabel="hearts-loading"
            wrapperStyle={{}}
            margin-top="200px"
            visible={true}
          />
        ) : (
          users.slice(0, 10).map((person, index) => (
            <TinderCard
              className={styles.swipe}
              key={person.id} // Use person.id for a unique key
              onSwipe={(dir) => swiped(dir, person.id)}
              onCardLeftScreen={() => outOfFrame(person.id)}
              swipeRequirementType="position"
              swipeThreshold={window.innerWidth * 0.2} // 20% of screen width - lower threshold for easier swiping
              flickOnSwipe={true}
              preventSwipe={['up', 'down']} // Only allow left and right swipes
            >
              <div className={styles.card}>
                <CarouselSlider user={person} /> {/* Pass the single user object */}
              </div>
            </TinderCard>
          ))
        )}
      </div>
    </div>
  );
};

export default SwipeCards;
