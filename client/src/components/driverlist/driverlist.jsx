import { useEffect, useState } from "react";
import { useLocation,useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import LoadingPage from "../loadingPage/loadingPage";
import Overlay from "../overlayScreen/overlay";
import "./driverlist.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const driverlistPage = () => {
  const navigate = useNavigate();
  const { busId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [seats, setSeats] = useState([]);
  const [userInfo, setUserInfo] = useState([]);


  const fetchReservedPassengers = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/seats/driver-list/${busId}`);
      // setUserInfo(response.data.data.orderedUserNames || []);    
      setSeats(response.data.data.passengerList || []);
      console.log(userInfo)

      setPageLoading(false);
    } catch (error) {
      console.error("Error fetching reserved passengers:", error);
      setPassengers([]);
      setPageLoading(false);
    }
  };


  const getRowColor = (index) => {
    const fullGroups = Math.floor(seats.length / 15);
    const lastGreenIndex = fullGroups * 15 - 1;
    return index <= lastGreenIndex ? "green" : "red";
  };

  useEffect(() => {
    if (busId) {
      fetchReservedPassengers();
      console.log(userInfo);
    }
  }, [busId]);

  if (pageLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="passengers-page">
      <h2 className="title">Reserved Passengers</h2>

      {seats.length > 0 ? (
        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="passenger-table">
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>

            <tbody>
              {seats.map((seat, idx) => {
                const rowColor = getRowColor(idx);
                return (
                  <tr key={idx} style={{ backgroundColor: rowColor }}>
                    <>
                       <td>{idx + 1}</td>
                        <td>{seat.name}</td>
                        <td>{seat.route}</td>
                    </>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : isLoading ? (
        <LoadingComponent />
      ) : (
        <p className="no-data">No reserved passengers found. {seats[0]}</p>
      )}

    </div>
  );
};

export default driverlistPage;
