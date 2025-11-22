import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useStateContext } from "../context/ContextProvider.jsx";
import { Hearts } from "react-loader-spinner";
import '../../public/resources/css/dialog.css';
import MessageIcon from '@mui/icons-material/Message';
import SwipeIcon from '@mui/icons-material/Swipe';
import axiosClient from "../axios-client.js";

const MatchDialog = ({ match }) => {
  const [open, setOpen] = useState(false);  // State to control dialog visibility
  const { user } = useStateContext();
  const [matchedUser, setMatchedUser] = useState(null);

  // Effect to open the dialog when there is a match
  useEffect(() => {
    if (match) {
      setOpen(true); // Open dialog if match exists
      console.log("MatchDialog received match:", match);
      console.log("match.otherUser:", match.otherUser);
      console.log("match.match:", match.match);
      
      // Check if we already have the other user data in the notification
      if (match.otherUser) {
        setMatchedUser(match.otherUser);
      } else if (match.match) {
        // Fallback to old logic if needed
        const userMatchedId = match.match.user1_id !== user.id ? match.match.user1_id : match.match.user2_id;
        axiosClient.get(`/user/${userMatchedId}`).then(({ data }) => {
          console.log(data);
          setMatchedUser(data);  // Set matched user data
        }).catch(error => {
          console.error("Error fetching matched user:", error);
        });
      }
    }
  }, [match]);

  const handleClose = () => {
    setOpen(false);  // Close the dialog
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            opacity: 0.9, // Set dialog opacity to 90%
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // Ensure the background color is controlled
          },
        }}
      >
        <div
          style={{
            borderRadius: "50%",
            border: '1px solid #ffe593',
          }}
        >
          <DialogTitle id="alert-dialog-title" className="bg-black text-white text-center">
            {"Совршен пар!"}
          </DialogTitle>
          <DialogContent className="bg-black text-white">
            <DialogContentText className="bg-black text-white" id="alert-dialog-description">
              <div className="text-center">
                {/* Conditional rendering for matchedUser name */}
                {matchedUser ? (
                  `Ти и ${matchedUser.name} се совпаднавте!`
                ) : (
                  'Чекаме на согласноста од другата страна...' // Fallback message
                )}
              </div>
              <div className="d-flex justify-content-center">
                <Hearts
                  height="150"
                  width="200"
                  color="#ffe593"
                  ariaLabel="hearts-loading"
                  visible={true}
                  margin="auto"
                />
                <Hearts
                  height="150"
                  width="200"
                  color="#ffe593"
                  ariaLabel="hearts-loading"
                  visible={true}
                  margin="auto"
                />
              </div>

              <div className="d-flex justify-content-center">
                <div style={{ width: '150px', height: 'auto' }} className="mx-auto">
                  <img
                    src={`http://localhost:8000/storage/${user.profile_picture}`}
                    alt="User Profile"
                    style={{
                      width: '100%',
                      height: 'auto',
                      aspectRatio: '1 / 1',
                      borderRadius: '50%',
                      border: '1px solid black',
                    }}
                  />
                </div>
                {matchedUser && (
                  <div style={{ width: '150px', height: 'auto' }} className="mx-auto">
                    <img
                      src={`http://localhost:8000/storage/${matchedUser.profile_picture}`}
                      alt="Matched User Profile"
                      style={{
                        width: '100%',
                        height: 'auto',
                        aspectRatio: '1 / 1',
                        borderRadius: '50%',
                        border: '1px solid black',
                      }}
                    />
                  </div>
                )}
              </div>
            </DialogContentText>
          </DialogContent>
          <DialogActions className="bg-black text-white text-center d-flex flex-column">
            <Button
              className="text-center btn-submit-dialog d-block mx-auto w-100"
              onClick={handleClose}
            >
              <SwipeIcon /> Продолжи со барање
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default MatchDialog;
