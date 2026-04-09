import { HomePage } from "@/pages/HomePage";
import { OrderPage } from "@/pages/OrderPage";

function App() {
  const path = window.location.pathname;
  const orderMatch = path.match(/^\/order\/(.+)$/);

  if (orderMatch) {
    return <OrderPage orderId={orderMatch[1]} />;
  }

  return <HomePage />;
}

export default App;
