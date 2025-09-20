import BusinessCardPage from "./BusinessCardPage";
import { useParams } from "react-router-dom";

const CardView = () => {
  const { userId } = useParams(); // grabs :userId from the URL
  return <BusinessCardPage userId={userId} />;
};

export default CardView;